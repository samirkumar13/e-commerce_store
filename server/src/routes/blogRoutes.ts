import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as blogService from '../services/blogService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const type = req.query.type as string | undefined;
    res.json(await blogService.getPublishedBlogs(limit, type));
  })
);

export default router;
