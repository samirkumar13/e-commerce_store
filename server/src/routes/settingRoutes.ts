import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getSettings);
router.put('/:key', protect, admin, updateSetting);

export default router;
