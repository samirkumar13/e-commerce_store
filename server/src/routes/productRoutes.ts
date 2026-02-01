
import { Router } from 'express';
import { getProducts, getProductById, checkServiceability } from '../controllers/productController';

const router = Router();

router.route('/').get(getProducts as any);
router.route('/serviceability').post(checkServiceability as any); // New Route
router.route('/:id').get(getProductById as any);

export default router;
