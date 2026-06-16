import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import prisma from '../prisma';
import * as adminService from '../services/adminService';
import * as blogService from '../services/blogService';
import * as videoService from '../services/videoService';
import * as brandService from '../services/brandService';
import * as faqService from '../services/faqService';
import { sendOrderStatusEmail } from '../services/emailService';
import {
  adminAdjustWallet,
  getWalletHistory,
  creditWallet,
  debitWallet,
} from '../services/walletService';

// Dashboard
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period as 'today' | 'week' | 'month' | 'all' | undefined;
  res.json(await adminService.getDashboardStats(period || 'all'));
});

// Users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllUsers());
});
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateUser(req.params.id, req.body));
});
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteUser(req.params.id);
  res.status(204).send();
});

// Products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllProducts());
});
export const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 5;
  if (isNaN(threshold)) {
    res.status(400).json({ message: 'Invalid threshold value.' });
    return;
  }
  res.json(await adminService.getLowStockProducts(threshold));
});
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createProduct(req.body));
});
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateProduct(req.params.id, req.body));
});
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteProduct(req.params.id);
  res.status(204).send();
});

// Staff Management
export const getStaffUsers = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllStaff());
});
export const createStaffUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, permissions } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email and password are required');
  }
  res.status(201).json(
    await adminService.createStaffUser({
      name,
      email,
      password,
      role: role || 'STAFF',
      permissions: permissions || {},
    })
  );
});
export const updateStaffUser = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateStaffUser(req.params.id, req.body));
});
export const deleteStaffUser = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as any;
  if (authReq.user?.id === req.params.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }
  await adminService.deleteStaffUser(req.params.id);
  res.status(204).send();
});

// Variants
export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getVariantsByProduct(req.params.productId));
});
export const createVariant = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createVariant(req.params.productId, req.body));
});
export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateVariant(req.params.variantId, req.body));
});
export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteVariant(req.params.variantId);
  res.status(204).send();
});

// Categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllCategories());
});
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createCategory(req.body));
});
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateCategory(req.params.id, req.body));
});
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteCategory(req.params.id);
  res.status(204).send();
});

// Home Slides
export const getSlides = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllSlides());
});
export const createSlide = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createSlide(req.body));
});
export const updateSlide = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateSlide(req.params.id, req.body));
});
export const deleteSlide = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteSlide(req.params.id);
  res.status(204).send();
});

// Orders
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllOrders());
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const updated = await adminService.updateOrder(req.params.id, req.body);

  // Award loyalty points when order is marked DELIVERED (idempotent)
  if (req.body.status === 'DELIVERED' && updated.pointsEarned && updated.pointsEarned > 0) {
    try {
      const alreadyCredited = await prisma.walletTransaction.findFirst({
        where: { orderId: updated.id, type: 'CREDIT_ORDER' },
      });
      if (!alreadyCredited) {
        await creditWallet(
          updated.userId,
          updated.pointsEarned,
          'CREDIT_ORDER',
          `Points earned for order #${updated.id.slice(-6).toUpperCase()}`,
          updated.id
        );
      }
    } catch (err) {
      console.error('Points award on delivery failed:', err);
    }
  }

  // Send status email if status changed to a notifiable state
  const notifiableStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (req.body.status && notifiableStatuses.includes(req.body.status) && updated.user) {
    try {
      await sendOrderStatusEmail(
        updated.user.email,
        updated.user.name || 'there',
        updated.id,
        req.body.status,
        updated.trackingNumber ?? undefined
      );
    } catch (err) {
      console.error('Order status email failed:', err);
    }
  }
  res.json(updated);
});

// Coupons
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getAllCoupons());
});
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await adminService.createCoupon(req.body));
});
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateCoupon(req.params.id, req.body));
});
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteCoupon(req.params.id);
  res.status(204).send();
});

// Settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.getSettings());
});
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  res.json(await adminService.updateSettings(req.body.settings));
});

// Blogs
export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  res.json(await blogService.getAllBlogs());
});
export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await blogService.createBlog(req.body));
});
export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  res.json(await blogService.updateBlog(req.params.id, req.body));
});
export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  await blogService.deleteBlog(req.params.id);
  res.status(204).send();
});

// Videos
export const getVideos = asyncHandler(async (req: Request, res: Response) => {
  res.json(await videoService.getAllVideos());
});
export const createVideo = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await videoService.createVideo(req.body));
});
export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  res.json(await videoService.updateVideo(req.params.id, req.body));
});
export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  await videoService.deleteVideo(req.params.id);
  res.status(204).send();
});

// Brands
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  res.json(await brandService.getAllBrands());
});
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await brandService.createBrand(req.body));
});
export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  res.json(await brandService.updateBrand(req.params.id, req.body));
});
export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  await brandService.deleteBrand(req.params.id);
  res.status(204).send();
});

// FAQs
export const getFaqs = asyncHandler(async (req: Request, res: Response) => {
  res.json(await faqService.getAllFaqs());
});
export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await faqService.createFaq(req.body));
});
export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  res.json(await faqService.updateFaq(req.params.id, req.body));
});
export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  await faqService.deleteFaq(req.params.id);
  res.status(204).send();
});

// Newsletter
export const getNewsletterSubscribers = asyncHandler(async (_req: Request, res: Response) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(subscribers);
});
export const deleteNewsletterSubscriber = asyncHandler(async (req: Request, res: Response) => {
  await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// Stock Notifications
export const getStockNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const notifications = await prisma.stockNotification.findMany({
    include: { product: { select: { name: true, slug: true, stock: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notifications);
});

// Wallet Management
export const adjustUserWallet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { points, reason } = req.body;
  if (typeof points !== 'number' || points === 0) {
    res.status(400);
    throw new Error('points must be a non-zero number');
  }
  await adminAdjustWallet(id, points, reason || '');
  const user = await prisma.user.findUnique({ where: { id }, select: { walletBalance: true } });
  res.json({ walletBalance: user?.walletBalance });
});

export const getUserWalletHistory = asyncHandler(async (req: Request, res: Response) => {
  const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
  const take = Math.min(200, Math.max(1, parseInt(req.query.take as string) || 50));
  const history = await getWalletHistory(req.params.id, skip, take);
  res.json(history);
});
