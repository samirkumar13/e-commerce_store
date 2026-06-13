import { User } from '@prisma/client';

// Augment Express's Request so `req.user` (populated by the auth middleware)
// is typed everywhere, removing the need for `req.user` casts.
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'passwordHash'>;
    }
  }
}

export {};
