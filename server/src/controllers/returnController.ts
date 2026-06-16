import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as returnService from '../services/returnService';

export const requestReturn = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { orderId, reason } = req.body;
  if (!orderId || !reason?.trim()) { res.status(400); throw new Error('orderId and reason are required'); }
  const ret = await returnService.requestReturn(userId, orderId, reason.trim());
  res.status(201).json(ret);
});

export const getMyReturns = asyncHandler(async (req: Request, res: Response) => {
  res.json(await returnService.getMyReturns((req as any).user.id));
});

export const adminGetReturns = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await returnService.adminGetReturns());
});

export const adminUpdateReturn = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, refundMode, adminNote } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400); throw new Error('status must be APPROVED or REJECTED');
  }
  if (status === 'APPROVED' && !['wallet', 'original'].includes(refundMode)) {
    res.status(400); throw new Error('refundMode must be wallet or original');
  }
  res.json(await returnService.adminUpdateReturn(id, status, refundMode ?? 'wallet', adminNote));
});
