
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (Some settings might be private in future, but generally app config is public)
export const getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await prisma.setting.findMany();
  // Convert array to object for easier frontend consumption
  const settingsMap = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // Default values if keys missing
  if (!settingsMap.reviewsEnabled) settingsMap.reviewsEnabled = 'true';

  res.json(settingsMap);
});

// @desc    Update a setting
// @route   PUT /api/settings/:key
// @access  Private (Admin)
export const updateSetting = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!req.user?.isAdmin) {
    res.status(401);
    throw new Error('Not authorized as admin');
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });

  res.json(setting);
});
