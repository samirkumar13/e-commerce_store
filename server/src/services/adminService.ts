import prisma from '../prisma';
import { Prisma } from '@prisma/client';

// Dashboard Stats
export const getDashboardStats = async (period: 'today' | 'week' | 'month' | 'all') => {
  let dateFilter = {};
  const now = new Date();

  if (period === 'today') {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { gte: startOfDay };
  } else if (period === 'week') {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    dateFilter = { gte: startOfWeek };
  } else if (period === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { gte: startOfMonth };
  }

  const whereClause = period === 'all' ? {} : { createdAt: dateFilter };

  const [userCount, orderCount, productCount, categoryCount] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.order.count({ where: whereClause }),
    prisma.product.count({ where: whereClause }),
    prisma.category.count({ where: whereClause }),
  ]);
  return {
    users: userCount,
    orders: orderCount,
    products: productCount,
    categories: categoryCount,
  };
};

const userSelect = { id: true, name: true, email: true, isAdmin: true, role: true, permissions: true, createdAt: true, walletBalance: true, referralCode: true } as const;

// User Management
export const getAllUsers = () =>
  prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
export const updateUser = (id: string, data: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id }, data, select: userSelect });
export const deleteUser = (id: string) => prisma.user.delete({ where: { id } });

// Staff Management
export const getAllStaff = () =>
  prisma.user.findMany({
    where: { role: { in: ['STAFF', 'ADMIN'] } },
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });

export const createStaffUser = async (data: { name: string; email: string; password: string; role: 'STAFF' | 'ADMIN'; permissions: Record<string, boolean> }) => {
  const bcrypt = require('bcrypt') as typeof import('bcrypt');
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      isAdmin: data.role === 'ADMIN',
      permissions: data.permissions,
      isVerified: true,
    },
    select: userSelect,
  });
};

export const updateStaffUser = async (id: string, data: { name?: string; role?: string; permissions?: Record<string, boolean>; password?: string }) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.role) { updateData.role = data.role; updateData.isAdmin = data.role === 'ADMIN'; }
  if (data.permissions) updateData.permissions = data.permissions;
  if (data.password) {
    const bcrypt = require('bcrypt') as typeof import('bcrypt');
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }
  return prisma.user.update({ where: { id }, data: updateData, select: userSelect });
};

export const deleteStaffUser = (id: string) => prisma.user.delete({ where: { id } });

// Product Management
export const getAllProducts = () =>
  prisma.product.findMany({ include: { category: true, variants: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'desc' } });
export const getLowStockProducts = (threshold: number) =>
  prisma.product.findMany({
    where: { stock: { lte: threshold } },
    include: { category: true, variants: true },
    orderBy: { stock: 'asc' },
  });
export const createProduct = (data: Prisma.ProductCreateInput) => prisma.product.create({ data, include: { category: true, variants: true } });
export const updateProduct = (id: string, data: Prisma.ProductUpdateInput) =>
  prisma.product.update({ where: { id }, data, include: { category: true, variants: true } });
export const deleteProduct = (id: string) => prisma.product.delete({ where: { id } });

// Variant Management
export const getVariantsByProduct = (productId: string) =>
  prisma.productVariant.findMany({ where: { productId }, orderBy: { createdAt: 'asc' } });
export const createVariant = (productId: string, data: { name: string; price: number; originalPrice?: number | null; stock: number; sku?: string; imageUrl?: string }) =>
  prisma.productVariant.create({ data: { ...data, productId } });
export const updateVariant = (id: string, data: { name?: string; price?: number; originalPrice?: number | null; stock?: number; sku?: string; imageUrl?: string }) =>
  prisma.productVariant.update({ where: { id }, data });
export const deleteVariant = (id: string) => prisma.productVariant.delete({ where: { id } });

// Category Management
export const getAllCategories = () => prisma.category.findMany({ orderBy: { name: 'asc' } });
export const createCategory = (data: Prisma.CategoryCreateInput) =>
  prisma.category.create({ data });
export const updateCategory = (id: string, data: Prisma.CategoryUpdateInput) =>
  prisma.category.update({ where: { id }, data });
export const deleteCategory = async (id: string) => {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Cannot delete category. It is used by ${productCount} products. Please reassign or delete them first.`
    );
  }
  return prisma.category.delete({ where: { id } });
};

// Home Slide Management
export const getAllSlides = () => prisma.homeSlide.findMany({ orderBy: { order: 'asc' } });
export const createSlide = (data: Prisma.HomeSlideCreateInput) => prisma.homeSlide.create({ data });
export const updateSlide = (id: string, data: Prisma.HomeSlideUpdateInput) =>
  prisma.homeSlide.update({ where: { id }, data });
export const deleteSlide = (id: string) => prisma.homeSlide.delete({ where: { id } });

// Order Management
export const getAllOrders = () =>
  prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

export const updateOrder = (id: string, data: Prisma.OrderUpdateInput) =>
  prisma.order.update({
    where: { id },
    data,
    include: { user: { select: { name: true, email: true } } },
  }) as any; // cast: includes userId, pointsEarned which Prisma types as known fields

// Coupon Management
export const getAllCoupons = () => prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
export const createCoupon = async (data: Prisma.CouponCreateInput) => {
  const upperCode = (data.code as string).toUpperCase();

  const existingCoupon = await prisma.coupon.findUnique({ where: { code: upperCode } });
  if (existingCoupon) {
    throw new Error(`A coupon with the code '${upperCode}' already exists.`);
  }

  data.code = upperCode;
  return prisma.coupon.create({ data });
};
export const updateCoupon = (id: string, data: Prisma.CouponUpdateInput) => {
  if (typeof data.code === 'string') {
    data.code = data.code.toUpperCase();
  }
  return prisma.coupon.update({ where: { id }, data });
};
export const deleteCoupon = (id: string) => prisma.coupon.delete({ where: { id } });

// Settings Management
export const getSettings = () => prisma.setting.findMany();
export const updateSettings = async (settings: { key: string; value: string }[]) => {
  return prisma.$transaction(
    settings.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    )
  );
};
