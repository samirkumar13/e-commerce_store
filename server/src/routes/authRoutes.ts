import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
