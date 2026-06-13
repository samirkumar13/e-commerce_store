import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as brandService from '../services/brandService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await brandService.getActiveBrands());
  })
);

export default router;
