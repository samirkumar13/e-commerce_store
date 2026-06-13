import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as addressController from '../controllers/addressController';

const router = Router();

router.use(protect);

router.route('/').get(addressController.getAddresses).post(addressController.addAddress);

router.route('/:id').put(addressController.updateAddress).delete(addressController.deleteAddress);

export default router;
