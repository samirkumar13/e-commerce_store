import prisma from '../prisma';

export const getAllProducts = () => {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProductById = (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};