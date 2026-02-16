
import prisma from '../prisma';

// Public
export const getPublishedBlogs = (limit?: number, type?: string) => prisma.blogPost.findMany({
    where: {
        status: 'PUBLISHED',
        ...(type ? { type } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
});

// Admin CRUD
export const getAllBlogs = () => prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });

export const createBlog = (data: any) => {
    if (data.status === 'PUBLISHED' && !data.publishedAt) {
        data.publishedAt = new Date();
    }
    return prisma.blogPost.create({ data });
};

export const updateBlog = (id: string, data: any) => {
    if (data.status === 'PUBLISHED' && !data.publishedAt) {
        data.publishedAt = new Date();
    }
    return prisma.blogPost.update({ where: { id }, data });
};

export const deleteBlog = (id: string) => prisma.blogPost.delete({ where: { id } });
