import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as slideService from '../services/slideService';

export const getSlides = asyncHandler(async (req: Request, res: Response) => {
  const slides = await slideService.getActiveSlides();
  (res as any).json(slides);
});
