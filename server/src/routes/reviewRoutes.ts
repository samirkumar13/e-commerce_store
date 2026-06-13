import express from 'express';
import {
  addReview,
  getProductReviews,
  checkReviewEligibility,
  updateReview,
  deleteReview,
  getMyReviews,
} from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, addReview);

router.route('/:productId').get(getProductReviews);

router.route('/eligibility/:productId').get(protect, checkReviewEligibility);

router.route('/my/all').get(protect, getMyReviews);

router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

export default router;
