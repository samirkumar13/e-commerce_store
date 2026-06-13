import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} from '../controllers/uploadController';

const router = Router();

// All upload routes are protected and require admin privileges
router.use(protect, admin);

// Single image upload
// POST /api/admin/upload?type=products (or slides, categories, etc.)
router.post('/', upload.single('image'), uploadImage);

// Multiple images upload (for product galleries)
// POST /api/admin/upload/multiple?type=products
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);

// Delete an uploaded image
// DELETE /api/admin/upload
router.delete('/', deleteImage);

export default router;
