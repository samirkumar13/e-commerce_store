import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as wishlistController from '../controllers/wishlistController';

const router = Router();

router.use(protect); // All wishlist routes are protected

router.route('/').get(wishlistController.getWishlist as any);
router.route('/add').post(wishlistController.addToWishlist as any);
router.route('/remove/:productId').delete(wishlistController.removeFromWishlist as any);

export default router;
