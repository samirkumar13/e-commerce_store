import { Router } from 'express';
import {
  getMyOrders,
  initiatePhonePeCheckout,
  getPhonePeTransactionStatus,
  cancelOrder,
} from '../controllers/orderController';
import { requestReturn, getMyReturns } from '../controllers/returnController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getMyOrders);
router.post('/initiate-phonepe', initiatePhonePeCheckout);
router.get('/phonepe-status/:transactionId', getPhonePeTransactionStatus);
router.post('/returns', requestReturn);
router.get('/returns', getMyReturns);
router.post('/:id/cancel', cancelOrder);

export default router;
