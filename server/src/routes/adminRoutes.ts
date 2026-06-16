import { Router } from 'express';
import { protect, admin, staff, hasPermission } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import * as adminController from '../controllers/adminController';
import { importProductsCSV } from '../controllers/csvImportController';
import { adminGetReturns, adminUpdateReturn } from '../controllers/returnController';
import multer from 'multer';
import {
  productSchema,
  categorySchema,
  slideSchema,
  orderUpdateSchema,
  userUpdateSchema,
  couponSchema,
  settingsSchema,
  blogSchema,
  videoSchema,
  brandSchema,
  faqSchema,
} from '../validation/adminValidation';

const router = Router();

// All admin routes require login + at least staff role
router.use(protect, staff);

// Dashboard stats — all staff can see
router.get('/stats', adminController.getStats);

// Staff management — admin only
router.get('/staff', admin, adminController.getStaffUsers);
router.post('/staff', admin, adminController.createStaffUser);
router.put('/staff/:id', admin, adminController.updateStaffUser);
router.delete('/staff/:id', admin, adminController.deleteStaffUser);

// User Management
router.route('/users').get(hasPermission('users'), adminController.getUsers);
router
  .route('/users/:id')
  .put(hasPermission('users'), validate(userUpdateSchema), adminController.updateUser)
  .delete(admin, adminController.deleteUser);
router.post('/users/:id/wallet', hasPermission('users'), adminController.adjustUserWallet);
router.get('/users/:id/wallet-history', hasPermission('users'), adminController.getUserWalletHistory);

// CSV Import
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/products/import-csv', hasPermission('products'), csvUpload.single('file'), importProductsCSV);

// Product Management
router.get('/products/low-stock', hasPermission('products'), adminController.getLowStockProducts);
router
  .route('/products')
  .get(hasPermission('products'), adminController.getProducts)
  .post(hasPermission('products'), validate(productSchema), adminController.createProduct);
router
  .route('/products/:id')
  .put(hasPermission('products'), validate(productSchema), adminController.updateProduct)
  .delete(hasPermission('products'), adminController.deleteProduct);

// Variant Management
router
  .route('/products/:productId/variants')
  .get(hasPermission('products'), adminController.getVariants)
  .post(hasPermission('products'), adminController.createVariant);
router
  .route('/products/:productId/variants/:variantId')
  .put(hasPermission('products'), adminController.updateVariant)
  .delete(hasPermission('products'), adminController.deleteVariant);

// Category Management
router
  .route('/categories')
  .get(hasPermission('categories'), adminController.getCategories)
  .post(hasPermission('categories'), validate(categorySchema), adminController.createCategory);
router
  .route('/categories/:id')
  .put(hasPermission('categories'), validate(categorySchema), adminController.updateCategory)
  .delete(hasPermission('categories'), adminController.deleteCategory);

// Home Slide Management
router
  .route('/slides')
  .get(hasPermission('slides'), adminController.getSlides)
  .post(hasPermission('slides'), validate(slideSchema), adminController.createSlide);
router
  .route('/slides/:id')
  .put(hasPermission('slides'), validate(slideSchema), adminController.updateSlide)
  .delete(hasPermission('slides'), adminController.deleteSlide);

// Order Management
router.route('/orders').get(hasPermission('orders'), adminController.getOrders);
router.route('/orders/:id').put(hasPermission('orders'), validate(orderUpdateSchema), adminController.updateOrder);

// Returns Management
router.route('/returns').get(hasPermission('orders'), adminGetReturns);
router.route('/returns/:id').put(hasPermission('orders'), adminUpdateReturn);

// Coupon Management
router
  .route('/coupons')
  .get(hasPermission('coupons'), adminController.getCoupons)
  .post(hasPermission('coupons'), validate(couponSchema), adminController.createCoupon);
router
  .route('/coupons/:id')
  .put(hasPermission('coupons'), validate(couponSchema), adminController.updateCoupon)
  .delete(hasPermission('coupons'), adminController.deleteCoupon);

// Settings Management — admin only
router
  .route('/settings')
  .get(hasPermission('settings'), adminController.getSettings)
  .put(admin, validate(settingsSchema), adminController.updateSettings);

// Blog Management
router
  .route('/blogs')
  .get(hasPermission('blog'), adminController.getBlogs)
  .post(hasPermission('blog'), validate(blogSchema), adminController.createBlog);
router
  .route('/blogs/:id')
  .put(hasPermission('blog'), validate(blogSchema), adminController.updateBlog)
  .delete(hasPermission('blog'), adminController.deleteBlog);

// Video Management
router
  .route('/videos')
  .get(hasPermission('blog'), adminController.getVideos)
  .post(hasPermission('blog'), validate(videoSchema), adminController.createVideo);
router
  .route('/videos/:id')
  .put(hasPermission('blog'), validate(videoSchema), adminController.updateVideo)
  .delete(hasPermission('blog'), adminController.deleteVideo);

// Brand Management
router
  .route('/brands')
  .get(hasPermission('slides'), adminController.getBrands)
  .post(hasPermission('slides'), validate(brandSchema), adminController.createBrand);
router
  .route('/brands/:id')
  .put(hasPermission('slides'), validate(brandSchema), adminController.updateBrand)
  .delete(hasPermission('slides'), adminController.deleteBrand);

// Newsletter Subscribers
router.get('/newsletter', hasPermission('users'), adminController.getNewsletterSubscribers);
router.delete('/newsletter/:id', admin, adminController.deleteNewsletterSubscriber);

// Stock Notifications
router.get('/stock-notifications', hasPermission('products'), adminController.getStockNotifications);

// FAQ Management
router
  .route('/faqs')
  .get(hasPermission('blog'), adminController.getFaqs)
  .post(hasPermission('blog'), validate(faqSchema), adminController.createFaq);
router
  .route('/faqs/:id')
  .put(hasPermission('blog'), validate(faqSchema), adminController.updateFaq)
  .delete(hasPermission('blog'), adminController.deleteFaq);

export default router;
