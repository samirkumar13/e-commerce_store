import prisma from '../prisma';

export const getWalletBalance = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
  return user?.walletBalance ?? 0;
};

export const getWalletHistory = async (userId: string, skip = 0, take = 50) => {
  return prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

export const creditWallet = async (
  userId: string,
  points: number,
  type: string,
  description: string,
  orderId?: string
) => {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: points } },
    }),
    prisma.walletTransaction.create({
      data: { userId, type, points, description, orderId },
    }),
  ]);
};

export const debitWallet = async (
  userId: string,
  points: number,
  type: string,
  description: string,
  orderId?: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });
  if (!user || user.walletBalance < points) throw new Error('Insufficient wallet balance');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: points } },
    }),
    prisma.walletTransaction.create({
      data: { userId, type, points: -points, description, orderId },
    }),
  ]);
};

// Admin: manually adjust wallet
export const adminAdjustWallet = async (userId: string, points: number, reason: string) => {
  if (points > 0) {
    await creditWallet(userId, points, 'CREDIT_ADMIN', reason || 'Admin credit');
  } else {
    await debitWallet(userId, Math.abs(points), 'DEBIT_ADMIN', reason || 'Admin debit');
  }
};
