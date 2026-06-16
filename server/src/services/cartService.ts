import prisma from '../prisma';
import { Prisma } from '@prisma/client';

const getFullCart = (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true, variants: true } }, variant: true },
        orderBy: { createdAt: 'asc' },
      },
      coupon: true,
    },
  });
};

export const getCart = async (userId: string) => {
  const cart = await getFullCart(userId);
  if (!cart) throw new Error('Cart not found');
  return cart;
};

export const addItem = async (
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string,
  variantName?: string
) => {
  await prisma.$transaction(
    async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      if (!cart) throw new Error('Cart not found');

      const existingItem = cart.items.find(
        (item) => item.productId === productId && (item.variantId ?? null) === (variantId ?? null)
      );

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            variantId: variantId ?? null,
            variantName: variantName ?? null,
          },
        });
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  return getFullCart(userId);
};

export const updateItemQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  const cart = await getCart(userId);
  const itemExists = cart.items.some((item) => item.id === cartItemId);
  if (!itemExists) throw new Error('Item not found in cart');

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getFullCart(userId);
};

export const removeItem = async (userId: string, cartItemId: string) => {
  const cart = await getCart(userId);
  const itemExists = cart.items.some((item) => item.id === cartItemId);
  if (!itemExists) throw new Error('Item not found in cart');

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return getFullCart(userId);
};

export const removeCoupon = async (userId: string) => {
  const cart = await getCart(userId);
  await prisma.cart.update({
    where: { id: cart.id },
    data: { appliedCouponId: null },
  });
  return getFullCart(userId);
};

export const applyCoupon = async (userId: string, couponCode: string) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: {
        equals: couponCode,
        mode: 'insensitive', // Case-insensitive lookup
      },
    },
  });

  const cart = await getCart(userId);
  const cartTotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  if (!coupon) throw new Error('Invalid coupon code.');
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
    throw new Error('Coupon has expired.');
  if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)
    throw new Error('Coupon has reached its usage limit.');
  if (coupon.perUserLimit) {
    const userUses = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (userUses >= coupon.perUserLimit)
      throw new Error(
        `You have already used this coupon the maximum number of times (${coupon.perUserLimit}).`
      );
  }
  if (coupon.minCartValue && cartTotal < coupon.minCartValue)
    throw new Error(`Cart total must be at least ₹${coupon.minCartValue} to use this coupon.`);

  await prisma.cart.update({
    where: { id: cart.id },
    data: { appliedCouponId: coupon.id },
  });

  return getFullCart(userId);
};
