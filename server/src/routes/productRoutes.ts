import { Router } from 'express';
import { getProducts, getProductById, checkServiceability } from '../controllers/productController';

const router = Router();

router.route('/').get(getProducts);
router.route('/serviceability').post(checkServiceability); // New Route
router.route('/:id').get(getProductById);

export default router;
