import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
});
