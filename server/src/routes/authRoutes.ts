
import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
// Fix: Corrected import path for validation schemas
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/register', validate(registerSchema) as any, registerUser as any);
router.post('/login', validate(loginSchema) as any, loginUser as any);
router.get('/me', protect as any, getUserProfile as any);

export default router;
