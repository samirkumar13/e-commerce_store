import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import prisma from '../prisma';


const ensureUser = (req: Request) => {
  const authReq = req as any;
  if (!authReq.user) throw new Error('Not authorized');
  return authReq.user;
};

export const initiatePhonePeCheckout = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { shippingDetails } = req.body;

  if (
    !shippingDetails ||
    !shippingDetails.address ||
    !shippingDetails.pincode ||
    !shippingDetails.phone
  ) {
    res.status(400);
    throw new Error('Incomplete shipping details.');
  }

  const pointsToRedeem = typeof req.body.pointsToRedeem === 'number' ? req.body.pointsToRedeem : 0;
  const response = await orderService.initiatePhonePePayment(user.id, shippingDetails, pointsToRedeem);
  res.json(response);
});

export const getPhonePeTransactionStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { transactionId } = req.params;

  if (!transactionId) {
    res.status(400);
    throw new Error('Missing transaction ID');
  }

  const order = await orderService.verifyPhonePePayment(transactionId, user.id);
  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const orders = await orderService.getUserOrders(user.id);
  res.json(orders);
});

export const handlePhonePeCallback = asyncHandler(async (req: Request, res: Response) => {
  await orderService.processCallback(req.body);
  res.json({ success: true });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { id } = req.params;
  try {
    const result = await orderService.cancelUserOrder(id, user.id);
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500);
    throw err;
  }
});
