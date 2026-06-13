import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as videoService from '../services/videoService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    (res as any).json(await videoService.getActiveVideos(type));
  })
);

export default router;
