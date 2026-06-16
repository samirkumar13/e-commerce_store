import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as cartService from '../services/cartService';

export const removeCouponFromCart = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const cart = await cartService.removeCoupon(user.id);
  res.json(cart);
});

const ensureUser = (req: Request, res: Response) => {
  const authReq = req as any;
  if (!authReq.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  return authReq.user;
};

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const cart = await cartService.getCart(user.id);
  res.json(cart);
});

export const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { productId, quantity, variantId, variantName } = req.body;
  const cart = await cartService.addItem(user.id, productId, quantity, variantId, variantName);
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(user.id, cartItemId, quantity);
  res.json(cart);
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { cartItemId } = req.params;
  const cart = await cartService.removeItem(user.id, cartItemId);
  res.json(cart);
});

export const applyCouponToCart = asyncHandler(async (req: Request, res: Response) => {
  const user = ensureUser(req, res);
  const { couponCode } = req.body;

  if (!couponCode || typeof couponCode !== 'string' || couponCode.trim() === '') {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  try {
    const cart = await cartService.applyCoupon(user.id, couponCode);
    res.json(cart);
  } catch (error: any) {
    res.status(400);
    throw error;
  }
});
