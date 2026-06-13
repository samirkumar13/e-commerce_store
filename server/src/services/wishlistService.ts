import prisma from '../prisma';

export const getWishlist = async (userId: string) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return wishlist;
};

export const addItem = async (userId: string, productId: string) => {
  const wishlist = await getWishlist(userId);

  // Check if item exists
  const exists = wishlist.items.find((item) => item.productId === productId);
  if (exists) return wishlist;

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return getWishlist(userId);
};

export const removeItem = async (userId: string, productId: string) => {
  const wishlist = await getWishlist(userId);

  // Find the item ID first because we need it for delete
  const item = wishlist.items.find((i) => i.productId === productId);

  if (item) {
    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });
  }

  return getWishlist(userId);
};

export const clearWishlist = async (userId: string) => {
  const wishlist = await getWishlist(userId);
  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id },
  });
  return getWishlist(userId);
};
