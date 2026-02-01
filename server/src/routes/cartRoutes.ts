
import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem, applyCouponToCart } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect as any);

router.route('/').get(getCart as any);
router.route('/add').post(addItemToCart as any);
router.route('/update/:cartItemId').put(updateCartItem as any);
router.route('/remove/:cartItemId').delete(removeCartItem as any);
router.route('/apply-coupon').post(applyCouponToCart as any);

export default router;
