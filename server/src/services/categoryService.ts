import prisma from '../prisma';

export const getAllCategories = () => {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });
};