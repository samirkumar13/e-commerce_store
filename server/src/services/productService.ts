import prisma from '../prisma';

// Original function - kept for backward compatibility
export const getAllProducts = () => {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

// Pagination parameters interface
interface PaginationParams {
  search?: string;
  categoryId?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// New paginated function for server-side filtering
export const getProductsPaginated = async ({
  search = '',
  categoryId = '',
  sortBy = 'newest',
  page = 1,
  limit = 12,
}: PaginationParams) => {
  // Build the where clause
  const where: any = {};

  // Search filter (name OR description)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Determine sort order
  let orderBy: any = { createdAt: 'desc' }; // default: newest
  switch (sortBy) {
    case 'price-low':
      orderBy = { price: 'asc' };
      break;
    case 'price-high':
      orderBy = { price: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
};

export const getProductById = (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
};