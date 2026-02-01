
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().cuid('Invalid category ID'),
  imageUrl: z.string().url('Invalid image URL'),
  originalPrice: z.number().nullable().optional(),
  images: z.array(z.string().url()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
});

export const slideSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    imageUrl: z.string().url('Invalid image URL'),
    linkUrl: z.string().optional(),
    order: z.number().int(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
});

export const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    isAdmin: z.boolean(),
});

export const couponSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive('Discount value must be positive'),
    expiryDate: z.string().datetime().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    minCartValue: z.number().positive().nullable().optional(),
});

export const settingsSchema = z.object({
    settings: z.array(z.object({
        key: z.string(),
        value: z.string(),
    }))
});
