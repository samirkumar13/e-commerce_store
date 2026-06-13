import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  applyCouponToCart,
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/').get(getCart);
router.route('/add').post(addItemToCart);
router.route('/update/:cartItemId').put(updateCartItem);
router.route('/remove/:cartItemId').delete(removeCartItem);
router.route('/apply-coupon').post(applyCouponToCart);

export default router;
