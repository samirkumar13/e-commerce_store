
import prisma from '../prisma';

export const getActiveSlides = () => {
  return prisma.homeSlide.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { order: 'asc' },
  });
};