import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as productService from '../services/productService';
import { getEstimatedDelivery } from '../services/shiprocketService';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Extract query parameters
  const search = (req.query.search as string) || '';
  const categoryId = (req.query.category as string) || '';
  const sortBy = (req.query.sort as string) || 'newest';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;

  const result = await productService.getProductsPaginated({
    search,
    categoryId,
    sortBy,
    page,
    limit,
  });

  res.json(result);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// New Endpoint for Checking Pincode
export const checkServiceability = asyncHandler(async (req: Request, res: Response) => {
  const { pincode } = req.body;

  if (!pincode || pincode.length < 6) {
    res.status(400);
    throw new Error('Invalid Pincode');
  }

  // Call service (Shiprocket or Fallback)
  const estimatedDate = await getEstimatedDelivery(pincode);

  res.json({
    deliverable: true,
    estimatedDate: estimatedDate,
  });
});
