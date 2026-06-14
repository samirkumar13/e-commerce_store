import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../prisma';

const router = Router();

// Public — returns non-expired coupons that still have usage remaining
router.get(
  '/active',
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        AND: [
          { OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] },
        ],
      },
      select: {
        code: true,
        discountType: true,
        discountValue: true,
        minCartValue: true,
        expiryDate: true,
        usageLimit: true,
        timesUsed: true,
      },
      orderBy: { discountValue: 'desc' },
      take: 10,
    });
    // Filter out exhausted coupons
    const available = coupons.filter(
      c => c.usageLimit === null || c.timesUsed < c.usageLimit
    );
    res.json(available);
  })
);

export default router;
