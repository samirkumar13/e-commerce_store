

import prisma from '../prisma';

const getFullCart = (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true } } },
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

export const addItem = async (userId: string, productId: string, quantity: number) => {
  const cart = await getCart(userId);
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: { increment: quantity } },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }
  return getFullCart(userId);
};

export const updateItemQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  const cart = await getCart(userId);
  const itemExists = cart.items.some(item => item.id === cartItemId);
  if (!itemExists) throw new Error('Item not found in cart');

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return getFullCart(userId);
};

export const removeItem = async (userId: string, cartItemId: string) => {
  const cart = await getCart(userId);
  const itemExists = cart.items.some(item => item.id === cartItemId);
  if (!itemExists) throw new Error('Item not found in cart');
  
  await prisma.cartItem.delete({ where: { id: cartItemId } });

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
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw new Error('Coupon has expired.');
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) throw new Error('Coupon has reached its usage limit.');
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) throw new Error(`Cart total must be at least ₹${coupon.minCartValue} to use this coupon.`);

    await prisma.cart.update({
        where: { id: cart.id },
        data: { appliedCouponId: coupon.id },
    });

    return getFullCart(userId);
};
