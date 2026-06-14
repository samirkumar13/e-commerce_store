import prisma from '../prisma';

export const getActiveFaqs = () =>
  prisma.faq.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { order: 'asc' },
  });

export const getAllFaqs = () => prisma.faq.findMany({ orderBy: { order: 'asc' } });

export const createFaq = (data: any) => prisma.faq.create({ data });

export const updateFaq = (id: string, data: any) =>
  prisma.faq.update({ where: { id }, data });

export const deleteFaq = (id: string) => prisma.faq.delete({ where: { id } });
