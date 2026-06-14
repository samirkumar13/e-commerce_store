import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as faqService from '../services/faqService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await faqService.getActiveFaqs());
  })
);

export default router;
