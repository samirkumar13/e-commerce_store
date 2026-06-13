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
    (res as any).status(400);
    throw new Error('Incomplete shipping details.');
  }

  const response = await orderService.initiatePhonePePayment(user.id, shippingDetails);
  (res as any).json(response);
});

export const getPhonePeTransactionStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { transactionId } = req.params;

  if (!transactionId) {
    (res as any).status(400);
    throw new Error('Missing transaction ID');
  }

  const order = await orderService.verifyPhonePePayment(transactionId, user.id);
  (res as any).status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const orders = await orderService.getUserOrders(user.id);
  (res as any).json(orders);
});

export const handlePhonePeCallback = asyncHandler(async (req: Request, res: Response) => {
  await orderService.processCallback(req.body);
  (res as any).json({ success: true });
});
