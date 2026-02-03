
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    // Fallback for name if it's not provided in the request
    const result = await authService.register(email, password, name || '');
    (res as any).status(201).json(result);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    (res as any).json(result);
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    if (!authReq.user) {
        (res as any).status(401);
        throw new Error('Not authorized');
    }
    const user = await authService.getProfile(authReq.user.id);
    (res as any).json(user);
});

export const requestPasswordReset = async (req: Request, res: Response) => {
    // Placeholder 
};

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = await authService.updateProfile(authReq.user.id, req.body);
    (res as any).json(user);
});

export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(authReq.user.id, currentPassword, newPassword);
    (res as any).json(result);
});
