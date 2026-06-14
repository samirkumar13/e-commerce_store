import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import * as adminController from '../controllers/adminController';
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

// All admin routes are protected and require admin privileges
router.use(protect, admin);

// Dashboard
router.get('/stats', adminController.getStats);

// User Management
router.route('/users').get(adminController.getUsers);
router
  .route('/users/:id')
  .put(validate(userUpdateSchema), adminController.updateUser)
  .delete(adminController.deleteUser);

// Product Management
router.get('/products/low-stock', adminController.getLowStockProducts);
router
  .route('/products')
  .get(adminController.getProducts)
  .post(validate(productSchema), adminController.createProduct);
router
  .route('/products/:id')
  .put(validate(productSchema), adminController.updateProduct)
  .delete(adminController.deleteProduct);

// Category Management
router
  .route('/categories')
  .get(adminController.getCategories)
  .post(validate(categorySchema), adminController.createCategory);
router
  .route('/categories/:id')
  .put(validate(categorySchema), adminController.updateCategory)
  .delete(adminController.deleteCategory);

// Home Slide Management
router
  .route('/slides')
  .get(adminController.getSlides)
  .post(validate(slideSchema), adminController.createSlide);
router
  .route('/slides/:id')
  .put(validate(slideSchema), adminController.updateSlide)
  .delete(adminController.deleteSlide);

// Order Management
router.route('/orders').get(adminController.getOrders);
router.route('/orders/:id').put(validate(orderUpdateSchema), adminController.updateOrder);

// Coupon Management
router
  .route('/coupons')
  .get(adminController.getCoupons)
  .post(validate(couponSchema), adminController.createCoupon);
router
  .route('/coupons/:id')
  .put(validate(couponSchema), adminController.updateCoupon)
  .delete(adminController.deleteCoupon);

// Settings Management
router
  .route('/settings')
  .get(adminController.getSettings)
  .put(validate(settingsSchema), adminController.updateSettings);

// Blog Management
router
  .route('/blogs')
  .get(adminController.getBlogs)
  .post(validate(blogSchema), adminController.createBlog);
router
  .route('/blogs/:id')
  .put(validate(blogSchema), adminController.updateBlog)
  .delete(adminController.deleteBlog);

// Video Management
router
  .route('/videos')
  .get(adminController.getVideos)
  .post(validate(videoSchema), adminController.createVideo);
router
  .route('/videos/:id')
  .put(validate(videoSchema), adminController.updateVideo)
  .delete(adminController.deleteVideo);

// Brand Management
router
  .route('/brands')
  .get(adminController.getBrands)
  .post(validate(brandSchema), adminController.createBrand);
router
  .route('/brands/:id')
  .put(validate(brandSchema), adminController.updateBrand)
  .delete(adminController.deleteBrand);

// Newsletter Subscribers
router.get('/newsletter', adminController.getNewsletterSubscribers);
router.delete('/newsletter/:id', adminController.deleteNewsletterSubscriber);

// FAQ Management
router
  .route('/faqs')
  .get(adminController.getFaqs)
  .post(validate(faqSchema), adminController.createFaq);
router
  .route('/faqs/:id')
  .put(validate(faqSchema), adminController.updateFaq)
  .delete(adminController.deleteFaq);

export default router;
