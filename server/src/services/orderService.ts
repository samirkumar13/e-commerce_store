import prisma from '../prisma';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import axios from 'axios';
import config from '../config';
import { createShiprocketOrder } from './shiprocketService';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './emailService';

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

const calculateCartTotal = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: { product: { include: { category: true } } } },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const subTotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  let discountAmount = 0;

  if (cart.coupon) {
    if (cart.coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subTotal * cart.coupon.discountValue) / 100;
    } else {
      discountAmount = cart.coupon.discountValue;
    }
  }

  const taxableAmount = Math.max(0, subTotal - discountAmount);

  const taxSetting = await prisma.setting.findFirst({ where: { key: 'taxRate' } });
  const taxRate = taxSetting && taxSetting.value ? parseFloat(taxSetting.value) : 0;
  const taxAmount = (taxableAmount * taxRate) / 100;

  const totalAmount = taxableAmount + taxAmount;

  return { totalAmount, cart };
};

// Helper to create order in PENDING_PAYMENT state
const createPendingOrder = async (
  userId: string,
  merchantTransactionId: string,
  shippingDetails: ShippingDetails
) => {
  const { totalAmount, cart } = await calculateCartTotal(userId);

  // Calculate discount amount before creating order
  const discountAmt = cart.coupon
    ? cart.coupon.discountType === 'PERCENTAGE'
      ? (cart.items.reduce((s, i) => s + i.quantity * i.product.price, 0) *
          cart.coupon.discountValue) /
        100
      : cart.coupon.discountValue
    : 0;

  return prisma.order.create({
    data: {
      userId,
      totalAmount,
      discountAmount: discountAmt,
      couponCode: cart.coupon?.code,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      trackingNumber: merchantTransactionId,
      // Explicitly map Shipping Details (Removed spread operator)
      shippingAddress: shippingDetails.address,
      city: shippingDetails.city,
      state: shippingDetails.state,
      pincode: shippingDetails.pincode,
      phone: shippingDetails.phone,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
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

  // 6. Send order confirmation email (non-blocking)
  try {
    await sendOrderConfirmationEmail(
      order.user.email,
      order.user.name || 'there',
      order.id,
      order.items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.price })),
      order.totalAmount,
    );
  } catch (error) {
    console.error('Order confirmation email failed:', error);
  }

  return updatedOrder;
};

// --- EXPORTED SERVICE FUNCTIONS ---

export const initiatePhonePePayment = async (userId: string, shippingDetails: ShippingDetails) => {
  const { totalAmount } = await calculateCartTotal(userId);
  const merchantTransactionId = `ORD${Date.now()}`;

  // 1. Create Order in Database FIRST
  await createPendingOrder(userId, merchantTransactionId, shippingDetails);

  const amountInPaise = Math.round(totalAmount * 100);

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
