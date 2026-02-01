
import { Router } from 'express';
import { getMyOrders, initiatePhonePeCheckout, getPhonePeTransactionStatus } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect as any);

router.get('/', getMyOrders as any);
router.post('/initiate-phonepe', initiatePhonePeCheckout as any);
router.get('/phonepe-status/:transactionId', getPhonePeTransactionStatus as any);

export default router;
