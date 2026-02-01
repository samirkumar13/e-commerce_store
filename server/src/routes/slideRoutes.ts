
import { Router } from 'express';
import { getSlides } from '../controllers/slideController';

const router = Router();

router.get('/', getSlides as any);

export default router;
