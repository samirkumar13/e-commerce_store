
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

// Dashboard
export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const period = req.query.period as 'today' | 'week' | 'month' | 'all' | undefined;
    (res as any).json(await adminService.getDashboardStats(period || 'all'));
});

// Users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllUsers());
});
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateUser(req.params.id, req.body));
});
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteUser(req.params.id);
    (res as any).status(204).send();
});

// Products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllProducts());
});
export const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 5;
    if (isNaN(threshold)) {
        (res as any).status(400).json({ message: 'Invalid threshold value.' });
        return;
    }
    (res as any).json(await adminService.getLowStockProducts(threshold));
});
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    (res as any).status(201).json(await adminService.createProduct(req.body));
});
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateProduct(req.params.id, req.body));
});
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteProduct(req.params.id);
    (res as any).status(204).send();
});

// Categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllCategories());
});
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    (res as any).status(201).json(await adminService.createCategory(req.body));
});
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateCategory(req.params.id, req.body));
});
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteCategory(req.params.id);
    (res as any).status(204).send();
});

// Home Slides
export const getSlides = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllSlides());
});
export const createSlide = asyncHandler(async (req: Request, res: Response) => {
    (res as any).status(201).json(await adminService.createSlide(req.body));
});
export const updateSlide = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateSlide(req.params.id, req.body));
});
export const deleteSlide = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteSlide(req.params.id);
    (res as any).status(204).send();
});

// Orders
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllOrders());
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateOrder(req.params.id, req.body));
});

// Coupons
export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getAllCoupons());
});
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    (res as any).status(201).json(await adminService.createCoupon(req.body));
});
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateCoupon(req.params.id, req.body));
});
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    await adminService.deleteCoupon(req.params.id);
    (res as any).status(204).send();
});

// Settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.getSettings());
});
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    (res as any).json(await adminService.updateSettings(req.body.settings));
});
