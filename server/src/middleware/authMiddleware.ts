
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../prisma';
import { User } from '@prisma/client';
import config from '../config'; // Import the validated config

export interface AuthRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  let token;

  if (authReq.headers.authorization && authReq.headers.authorization.startsWith('Bearer')) {
    try {
      token = authReq.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      
      const user = await prisma.user.findUnique({ 
          where: { id: decoded.id }, 
          select: { id: true, name: true, email: true, isAdmin: true, createdAt: true, updatedAt: true } 
      });
      
      if (!user) {
        (res as any).status(401);
        throw new Error('Not authorized, user not found');
      }

      authReq.user = user;
      next();
    } catch (error) {
      console.error(error);
      (res as any).status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    (res as any).status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  if (authReq.user && authReq.user.isAdmin) {
    next();
  } else {
    (res as any).status(403);
    throw new Error('Not authorized as an admin');
  }
};
