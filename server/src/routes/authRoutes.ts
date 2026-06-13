import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
// Fix: Corrected import path for validation schemas
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

export default router;
