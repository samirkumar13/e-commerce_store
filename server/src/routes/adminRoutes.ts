
import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import validate from '../middleware/validationMiddleware';
import * as adminController from '../controllers/adminController';
import { productSchema, categorySchema, slideSchema, orderUpdateSchema, userUpdateSchema, couponSchema, settingsSchema, blogSchema, videoSchema, brandSchema } from '../validation/adminValidation';

const router = Router();

// All admin routes are protected and require admin privileges
router.use(protect as any, admin as any);

// Dashboard
router.get('/stats', adminController.getStats as any);

// User Management
router.route('/users')
    .get(adminController.getUsers as any);
router.route('/users/:id')
    .put(validate(userUpdateSchema) as any, adminController.updateUser as any)
    .delete(adminController.deleteUser as any);

// Product Management
router.get('/products/low-stock', adminController.getLowStockProducts as any);
router.route('/products')
    .get(adminController.getProducts as any)
    .post(validate(productSchema) as any, adminController.createProduct as any);
router.route('/products/:id')
    .put(validate(productSchema) as any, adminController.updateProduct as any)
    .delete(adminController.deleteProduct as any);

// Category Management
router.route('/categories')
    .get(adminController.getCategories as any)
    .post(validate(categorySchema) as any, adminController.createCategory as any);
router.route('/categories/:id')
    .put(validate(categorySchema) as any, adminController.updateCategory as any)
    .delete(adminController.deleteCategory as any);

// Home Slide Management
router.route('/slides')
    .get(adminController.getSlides as any)
    .post(validate(slideSchema) as any, adminController.createSlide as any);
router.route('/slides/:id')
    .put(validate(slideSchema) as any, adminController.updateSlide as any)
    .delete(adminController.deleteSlide as any);

// Order Management
router.route('/orders')
    .get(adminController.getOrders as any);
router.route('/orders/:id')
    .put(validate(orderUpdateSchema) as any, adminController.updateOrder as any);

// Coupon Management
router.route('/coupons')
    .get(adminController.getCoupons as any)
    .post(validate(couponSchema) as any, adminController.createCoupon as any);
router.route('/coupons/:id')
    .put(validate(couponSchema) as any, adminController.updateCoupon as any)
    .delete(adminController.deleteCoupon as any);

// Settings Management
router.route('/settings')
    .get(adminController.getSettings as any)
    .put(validate(settingsSchema) as any, adminController.updateSettings as any);

// Blog Management
router.route('/blogs')
    .get(adminController.getBlogs as any)
    .post(validate(blogSchema) as any, adminController.createBlog as any);
router.route('/blogs/:id')
    .put(validate(blogSchema) as any, adminController.updateBlog as any)
    .delete(adminController.deleteBlog as any);

// Video Management
router.route('/videos')
    .get(adminController.getVideos as any)
    .post(validate(videoSchema) as any, adminController.createVideo as any);
router.route('/videos/:id')
    .put(validate(videoSchema) as any, adminController.updateVideo as any)
    .delete(adminController.deleteVideo as any);

// Brand Management
router.route('/brands')
    .get(adminController.getBrands as any)
    .post(validate(brandSchema) as any, adminController.createBrand as any);
router.route('/brands/:id')
    .put(validate(brandSchema) as any, adminController.updateBrand as any)
    .delete(adminController.deleteBrand as any);

export default router;
