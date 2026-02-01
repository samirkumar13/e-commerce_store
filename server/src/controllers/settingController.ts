
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as settingService from '../services/settingService';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingService.getPublicSettings();
  (res as any).json(settings);
});
