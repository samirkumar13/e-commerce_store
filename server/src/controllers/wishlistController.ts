import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService';

const ensureUser = (req: Request, res: Response) => {
  const authReq = req as any;
  if (!authReq.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  return authReq.user;
};

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const wishlist = await wishlistService.getWishlist(user.id);
  (res as any).json(wishlist);
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const wishlist = await wishlistService.addItem(user.id, productId);
  (res as any).json(wishlist);
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { productId } = req.params;

  const wishlist = await wishlistService.removeItem(user.id, productId);
  (res as any).json(wishlist);
});
