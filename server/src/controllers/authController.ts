import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import crypto from 'crypto';
import * as authService from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';
import { sendPasswordResetEmail } from '../services/emailService';
import config from '../config';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register(email, password, name || '');
  res.status(201).json(result);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as any;
  if (!authReq.user) { res.status(401); throw new Error('Not authorized'); }
  const user = await authService.getProfile(authReq.user.id);
  res.json(user);
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as any;
  const user = await authService.updateProfile(authReq.user.id, req.body);
  res.json(user);
});

export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as any;
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(authReq.user.id, currentPassword, newPassword);
  res.json(result);
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always respond 200 to avoid revealing whether email exists
  if (!user) { res.json({ message: 'If that email is registered, you will receive a reset link.' }); return; }

  // Invalidate previous tokens for this user
  await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

  const resetUrl = `${config.frontendUrl}/#/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, user.name || 'there', resetUrl);

  res.json({ message: 'If that email is registered, you will receive a reset link.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400); throw new Error('Token and new password are required'); }
  if (password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired');
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bcrypt = require('bcrypt') as typeof import('bcrypt');
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);

  res.json({ message: 'Password updated successfully. You can now log in.' });
});
