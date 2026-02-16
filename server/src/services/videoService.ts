
import prisma from '../prisma';

// Public
export const getActiveVideos = (type?: string) => prisma.video.findMany({
    where: {
        status: 'ACTIVE',
        ...(type ? { type } : {}),
    },
    orderBy: { order: 'asc' },
});

// Admin CRUD
export const getAllVideos = () => prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
export const createVideo = (data: any) => prisma.video.create({ data });
export const updateVideo = (id: string, data: any) => prisma.video.update({ where: { id }, data });
export const deleteVideo = (id: string) => prisma.video.delete({ where: { id } });
