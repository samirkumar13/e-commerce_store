import prisma from '../prisma';
import { creditWallet, debitWallet } from './walletService';

export const requestReturn = async (userId: string, orderId: string, reason: string) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new Error('Order not found');
  if (order.status !== 'DELIVERED') throw new Error('Only delivered orders can be returned');
  if (order.paymentStatus !== 'PAID') throw new Error('Only paid orders can be returned');

  const existing = await prisma.return.findUnique({ where: { orderId } });
  if (existing) throw new Error('A return request already exists for this order');

  return prisma.return.create({
    data: { orderId, userId, reason, refundAmount: order.totalAmount },
  });
};

export const getMyReturns = async (userId: string) => {
  return prisma.return.findMany({
    where: { userId },
    include: { order: { select: { id: true, totalAmount: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const adminGetReturns = async () => {
  return prisma.return.findMany({
    include: {
      order: { select: { id: true, totalAmount: true, pointsEarned: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const adminUpdateReturn = async (
  returnId: string,
  status: 'APPROVED' | 'REJECTED',
  refundMode: 'wallet' | 'original',
  adminNote?: string
) => {
  const ret = await prisma.return.findUnique({
    where: { id: returnId },
    include: { order: { select: { pointsEarned: true } } },
  });
  if (!ret) throw new Error('Return request not found');
  if (ret.status !== 'PENDING') throw new Error('This return has already been processed');

  const refundToWallet = refundMode === 'wallet';

  const updated = await prisma.return.update({
    where: { id: returnId },
    data: { status, refundToWallet, adminNote },
  });

  if (status === 'APPROVED') {
    // 1. Deduct loyalty points that were earned on delivery (if any were credited)
    const pointsEarned = ret.order?.pointsEarned ?? 0;
    if (pointsEarned > 0) {
      const credited = await prisma.walletTransaction.findFirst({
        where: { orderId: ret.orderId, type: 'CREDIT_ORDER' },
      });
      if (credited) {
        try {
          await debitWallet(
            ret.userId,
            pointsEarned,
            'DEBIT_ADMIN',
            `Points reversed — return approved for order #${ret.orderId.slice(-8).toUpperCase()}`
          );
        } catch {
          // wallet may have been spent — log but don't block approval
          console.error(
            `Could not debit ${pointsEarned} points for return ${returnId} — balance may be insufficient`
          );
        }
      }
    }

    // 2. Credit refund to wallet if chosen
    if (refundToWallet && ret.refundAmount) {
      await creditWallet(
        ret.userId,
        Math.round(ret.refundAmount),
        'CREDIT_ADMIN',
        `Wallet refund for order #${ret.orderId.slice(-8).toUpperCase()}`
      );
    }
    // For 'original' mode: admin handles the bank/PhonePe refund manually
  }

  return updated;
};
