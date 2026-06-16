import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as walletService from '../services/walletService';

const router = Router();
router.use(protect);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const balance = await walletService.getWalletBalance(userId);
    res.json({ balance });
  })
);

router.get(
  '/history',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(200, Math.max(1, parseInt(req.query.take as string) || 50));
    const history = await walletService.getWalletHistory(userId, skip, take);
    res.json(history);
  })
);

export default router;
