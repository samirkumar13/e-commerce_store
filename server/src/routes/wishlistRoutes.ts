import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as wishlistController from '../controllers/wishlistController';

const router = Router();

router.use(protect); // All wishlist routes are protected

router.route('/').get(wishlistController.getWishlist);
router.route('/add').post(wishlistController.addToWishlist);
router.route('/remove/:productId').delete(wishlistController.removeFromWishlist);

export default router;
