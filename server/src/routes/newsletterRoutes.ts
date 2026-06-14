import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../prisma';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Valid email is required.' });
      return;
    }
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      res.json({ message: 'You are already subscribed!' });
      return;
    }
    await prisma.newsletterSubscriber.create({ data: { email } });
    res.status(201).json({ message: 'Successfully subscribed!' });
  })
);

router.get(
  '/',
  protect,
  admin,
  asyncHandler(async (_req: Request, res: Response) => {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers);
  })
);

router.delete(
  '/:id',
  protect,
  admin,
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
