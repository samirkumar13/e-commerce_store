import { Router } from 'express';
import {
  getMyOrders,
  initiatePhonePeCheckout,
  getPhonePeTransactionStatus,
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getMyOrders);
router.post('/initiate-phonepe', initiatePhonePeCheckout);
router.get('/phonepe-status/:transactionId', getPhonePeTransactionStatus);

export default router;
