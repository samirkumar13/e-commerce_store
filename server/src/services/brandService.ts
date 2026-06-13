import prisma from '../prisma';

// Public
export const getActiveBrands = () =>
  prisma.brand.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { order: 'asc' },
  });

// Admin CRUD
export const getAllBrands = () => prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
export const createBrand = (data: any) => prisma.brand.create({ data });
export const updateBrand = (id: string, data: any) => prisma.brand.update({ where: { id }, data });
export const deleteBrand = (id: string) => prisma.brand.delete({ where: { id } });
