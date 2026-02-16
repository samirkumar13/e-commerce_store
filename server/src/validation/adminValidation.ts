
import { z } from 'zod';

// Custom validator that accepts both URLs and relative paths (for uploaded images)
const imagePathOrUrl = z.string().refine(
    (val) => val.startsWith('/uploads/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'Must be a valid URL or uploaded image path' }
);

// Optional version for fields that can be empty
const optionalImagePathOrUrl = z.string().refine(
    (val) => val === '' || val.startsWith('/uploads/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'Must be a valid URL or uploaded image path' }
).optional();

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be a positive number'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    categoryId: z.string().cuid('Invalid category ID'),
    imageUrl: imagePathOrUrl,
    originalPrice: z.number().nullable().optional(),
    images: z.array(z.string()).optional(), // Allow any string for flexibility
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
});

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    imageUrl: optionalImagePathOrUrl, // Added image support for categories
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
});

export const slideSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    imageUrl: imagePathOrUrl,
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

export const blogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    excerpt: z.string().min(1, 'Excerpt is required'),
    content: z.string().min(1, 'Content is required'),
    imageUrl: imagePathOrUrl,
    category: z.string().min(1, 'Category is required'),
    type: z.enum(['BLOG', 'TUTORIAL']),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    publishedAt: z.string().datetime().nullable().optional(),
});

export const videoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    youtubeId: z.string().min(1, 'YouTube ID is required'),
    type: z.enum(['FULL', 'SHORT']),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    order: z.number().int().min(0),
});

export const brandSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    logoUrl: imagePathOrUrl,
    website: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    order: z.number().int().min(0),
});
