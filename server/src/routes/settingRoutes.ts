
import { Router } from 'express';
import { getSettings } from '../controllers/settingController';

const router = Router();

// This is a public route, no protection needed
router.get('/', getSettings as any);

export default router;
