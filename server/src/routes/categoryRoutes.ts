
import { Router } from 'express';
import { getCategories } from '../controllers/categoryController';

const router = Router();

router.route('/').get(getCategories as any);

export default router;
