import prisma from '../prisma';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import axios from 'axios';
import config from '../config';
import { createShiprocketOrder } from './shiprocketService';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './emailService';
import { creditWallet } from './walletService';

interface PhonePePayResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    instrumentResponse: {
      redirectInfo: {
        url: string;
      };
    };
  };
}

interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantTransactionId: string;
    transactionId: string;
    state: string;
    responseCode: string;
    merchantUserId: string;
    amount: number;
  };
}

interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

// --- HELPER FUNCTIONS ---

const calculateCartTotal = async (userId: string, pointsToRedeem = 0) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: { product: { include: { category: true } }, variant: true } },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const subTotal = cart.items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        (item.variantId ? (item.variant?.price ?? item.product.price) : item.product.price),
    0
  );
  let discountAmount = 0;

  if (cart.coupon) {
    if (cart.coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subTotal * cart.coupon.discountValue) / 100;
    } else {
      discountAmount = cart.coupon.discountValue;
    }
  }

  // Validate & cap wallet redemption: max 50% of subtotal (configurable via setting)
  const maxRedeemSetting = await prisma.setting.findFirst({
    where: { key: 'pointsRedeemMaxPercent' },
  });
  const maxRedeemPercent = maxRedeemSetting?.value ? parseFloat(maxRedeemSetting.value) : 50;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
  const maxRedeemable = Math.floor((subTotal * maxRedeemPercent) / 100);
  const actualRedeem = Math.min(pointsToRedeem, user?.walletBalance ?? 0, maxRedeemable);
  const walletDiscount = actualRedeem; // 1 point = ₹1

  const taxableAmount = Math.max(0, subTotal - discountAmount - walletDiscount);

  const taxSetting = await prisma.setting.findFirst({ where: { key: 'taxRate' } });
  const taxRate = taxSetting && taxSetting.value ? parseFloat(taxSetting.value) : 0;
  const taxAmount = (taxableAmount * taxRate) / 100;

  const totalAmount = taxableAmount + taxAmount;

  return { totalAmount, discountAmount, cart, walletDiscount, actualRedeem };
};

// Helper to create order in PENDING_PAYMENT state
const createPendingOrder = async (
  userId: string,
  merchantTransactionId: string,
  shippingDetails: ShippingDetails,
  pointsToRedeem = 0
) => {
  const {
    totalAmount,
    discountAmount: discountAmt,
    cart,
    walletDiscount,
    actualRedeem,
  } = await calculateCartTotal(userId, pointsToRedeem);

  return prisma.$transaction(async (tx) => {
    // Create order first so we have its cuid for the wallet transaction
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        discountAmount: discountAmt,
        couponCode: cart.coupon?.code,
        walletDiscount,
        pointsRedeemed: actualRedeem,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        trackingNumber: merchantTransactionId,
        shippingAddress: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        pincode: shippingDetails.pincode,
        phone: shippingDetails.phone,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.variantId
              ? (item.variant?.price ?? item.product.price)
              : item.product.price,
            variantId: item.variantId ?? null,
            variantName: item.variantName ?? null,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Debit wallet atomically — if this fails the order creation is also rolled back
    if (actualRedeem > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: actualRedeem } },
      });
      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'DEBIT_ORDER',
          points: -actualRedeem,
          description: `Points redeemed for order`,
          orderId: order.id,
        },
      });
    }

    return order;
  });
};

// Helper to finalize order after payment success
const confirmOrder = async (merchantTransactionId: string, paymentId: string) => {
  const order = await prisma.order.findFirst({
    where: { trackingNumber: merchantTransactionId },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) throw new Error('Order not found for this transaction.');
  if (order.paymentStatus === 'PAID') return order; // Idempotency

  // 1. Update Order Status
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentId: paymentId,
    },
    include: { items: { include: { product: true } } },
  });

  // 2. Decrement Stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 3. Update Coupon Usage
  if (order.couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: order.couponCode } });
    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { timesUsed: { increment: 1 } },
      });
      await prisma.couponUsage.create({ data: { couponId: coupon.id, userId: order.userId } });
    }
  }

  // 4. Clear Cart
  const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { appliedCouponId: null },
    });
  }

  // 5. Push to Shiprocket
  // Wrapped in try/catch so shipping API failures don't roll back a successful payment
  try {
    const shiprocketData = await createShiprocketOrder(updatedOrder, order.user);
    if (shiprocketData) {
      await prisma.order.update({
        where: { id: order.id },
        data: shiprocketData as any,
      });
    }
  } catch (error) {
    console.error('Shiprocket integration failed (Order is confirmed):', error);
  }

  // 6. Pre-calculate loyalty points and store on order (NOT credited yet — credited on DELIVERED)
  try {
    const earnRateSetting = await prisma.setting.findFirst({ where: { key: 'pointsEarnRate' } });
    const earnRate = earnRateSetting?.value ? parseFloat(earnRateSetting.value) : 5;
    const pointsEarned = Math.floor((order.totalAmount * earnRate) / 100);
    if (pointsEarned > 0) {
      await prisma.order.update({ where: { id: order.id }, data: { pointsEarned } });
    }

    // Referral bonus on first order (awarded at payment, not delivery)
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { referredBy: true },
    });
    if (user?.referredBy) {
      const referralSetting = await prisma.setting.findFirst({
        where: { key: 'referralBonusPoints' },
      });
      const referralBonus = referralSetting?.value ? parseInt(referralSetting.value) : 100;
      const paidOrderCount = await prisma.order.count({
        where: { userId: order.userId, paymentStatus: 'PAID' },
      });
      if (paidOrderCount === 1) {
        await creditWallet(
          user.referredBy,
          referralBonus,
          'CREDIT_REFERRAL',
          'Referral bonus — your friend placed their first order'
        );
        await prisma.user.update({ where: { id: order.userId }, data: { referredBy: null } });
      }
    }
  } catch (error) {
    console.error('Points pre-calculation failed (order confirmed):', error);
  }

  // 7. Send order confirmation email (non-blocking)
  try {
    await sendOrderConfirmationEmail(
      order.user.email,
      order.user.name || 'there',
      order.id,
      order.items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.price })),
      order.totalAmount
    );
  } catch (error) {
    console.error('Order confirmation email failed:', error);
  }

  return updatedOrder;
};

// --- EXPORTED SERVICE FUNCTIONS ---

export const initiatePhonePePayment = async (
  userId: string,
  shippingDetails: ShippingDetails,
  pointsToRedeem = 0
) => {
  const merchantTransactionId = `ORD${Date.now()}`;

  // 1. Create order first — totalAmount comes from the order so PhonePe always receives the same figure
  const order = await createPendingOrder(
    userId,
    merchantTransactionId,
    shippingDetails,
    pointsToRedeem
  );

  const amountInPaise = Math.round(order.totalAmount * 100);

  // Use Config from .env
  const merchantId = config.phonepe.merchantId;
  const saltKey = config.phonepe.saltKey;
  const saltIndex = config.phonepe.saltIndex;
  const baseUrl = config.phonepe.apiUrl;

  const payload = {
    merchantId: merchantId,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amountInPaise,
    redirectUrl: `${config.frontendUrl}/#/payment-status/${merchantTransactionId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${config.backendUrl}/api/orders/phonepe-callback`,
    mobileNumber: shippingDetails.phone,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = base64Payload + '/pg/v1/pay' + saltKey;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = sha256 + '###' + saltIndex;

  try {
    const response = await axios.post<PhonePePayResponse>(
      `${baseUrl}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          accept: 'application/json',
        },
      }
    );

    if (response.data.success) {
      return { redirectUrl: response.data.data.instrumentResponse.redirectInfo.url };
    } else {
      throw new Error(response.data.message || 'Payment initiation failed.');
    }
  } catch (error: any) {
    console.error('PhonePe Init Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to connect to PhonePe.');
  }
};

export const verifyPhonePePayment = async (merchantTransactionId: string, realUserId?: string) => {
  const merchantId = config.phonepe.merchantId;
  const saltKey = config.phonepe.saltKey;
  const saltIndex = config.phonepe.saltIndex;
  const baseUrl = config.phonepe.apiUrl;

  const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = sha256 + '###' + saltIndex;

  try {
    const response = await axios.get<PhonePeStatusResponse>(
      `${baseUrl}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
        },
      }
    );

    const data = response.data;
    if (data.code === 'PAYMENT_SUCCESS') {
      const paymentId = data.data.transactionId;
      return confirmOrder(merchantTransactionId, paymentId);
    } else {
      // Payment failed, mark as failed
      await prisma.order.updateMany({
        where: { trackingNumber: merchantTransactionId },
        data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
      });
      throw new Error(data.message || 'Payment was not successful.');
    }
  } catch (error: any) {
    console.error('PhonePe Verification Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Could not verify payment status.');
  }
};

export const processCallback = async (payload: any) => {
  const decodedString = Buffer.from(payload.response, 'base64').toString('utf-8');
  const data = JSON.parse(decodedString);

  if (data.code === 'PAYMENT_SUCCESS') {
    const { merchantTransactionId, transactionId } = data.data;
    return confirmOrder(merchantTransactionId, transactionId);
  }
  return null;
};

export const cancelUserOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (order.status !== 'PROCESSING') {
    throw Object.assign(new Error('Only orders in PROCESSING status can be cancelled'), {
      status: 400,
    });
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    // 2. Restore stock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    // 3. Decrement coupon usage if applicable
    if (order.couponCode) {
      const coupon = await tx.coupon.findFirst({ where: { code: order.couponCode } });
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { timesUsed: { decrement: 1 } },
        });
        // Remove one per-user usage record for this order's user
        const usage = await tx.couponUsage.findFirst({
          where: { couponId: coupon.id, userId: order.userId },
        });
        if (usage) await tx.couponUsage.delete({ where: { id: usage.id } });
      }
    }

    // 4. Refund redeemed wallet points
    if (order.pointsRedeemed > 0) {
      await tx.user.update({
        where: { id: order.userId },
        data: { walletBalance: { increment: order.pointsRedeemed } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: order.userId,
          type: 'CREDIT_ADMIN',
          points: order.pointsRedeemed,
          description: `Wallet refund — order #${orderId.slice(-6).toUpperCase()} cancelled`,
          orderId,
        },
      });
    }
  });

  // 4. Send cancellation email (non-blocking)
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendOrderStatusEmail(user.email, user.name || 'there', orderId, 'CANCELLED');
    }
  } catch (err) {
    console.error('Cancellation email failed:', err);
  }

  return { success: true };
};

export const getUserOrders = (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: { include: { category: true } } } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
