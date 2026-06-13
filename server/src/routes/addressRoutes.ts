import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as addressController from '../controllers/addressController';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(addressController.getAddresses as any)
  .post(addressController.addAddress as any);

router
  .route('/:id')
  .put(addressController.updateAddress as any)
  .delete(addressController.deleteAddress as any);

export default router;
