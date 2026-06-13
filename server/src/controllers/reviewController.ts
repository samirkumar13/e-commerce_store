import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private (Verified Buyers Only)
export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, comment, productId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error('User not authorized');
  }

  if (!rating || !comment || !productId) {
    res.status(400);
    throw new Error('Please provide rating, comment, and product ID');
  }

  // 1. Check duplicate review
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  // 2. VERIFICATION: Check if user bought the product AND it is delivered/returned
  // We look for any order that belongs to this user, contains this product,
  // and has a status of DELIVERED or RETURNED.
  const validOrder = await prisma.order.findFirst({
    where: {
      userId: userId,
      status: { in: ['DELIVERED', 'RETURNED'] }, // Strict check
      items: {
        some: {
          productId: productId,
        },
      },
    },
  });

  if (!validOrder) {
    res.status(403);
    throw new Error('You can only review products you have purchased and received.');
  }

  // 3. Create Review
  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      userId,
      productId,
    },
  });

  res.status(201).json(review);
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate Average
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  res.json({
    reviews,
    averageRating: agg._avg.rating || 0,
    totalReviews: agg._count.rating || 0,
  });
});

// @desc    Check if user can review a product
// @route   GET /api/reviews/eligibility/:productId
// @access  Private
export const checkReviewEligibility = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const userId = req.user?.id;

  // 0. Check Global Setting
  const setting = await prisma.setting.findUnique({
    where: { key: 'reviewsEnabled' },
  });

  if (setting && setting.value === 'false') {
    res.json({ canReview: false, reason: 'Reviews are currently disabled by the store owner.' });
    return;
  }

  if (!userId) {
    res.json({ canReview: false });
    return;
  }

  // Check existing review
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    res.json({ canReview: false, reason: 'Already reviewed' });
    return;
  }

  // Check valid purchase
  const validOrder = await prisma.order.findFirst({
    where: {
      userId: userId,
      status: { in: ['DELIVERED', 'RETURNED'] },
      items: {
        some: {
          productId: productId,
        },
      },
    },
  });

  if (validOrder) {
    res.json({ canReview: true });
  } else {
    res.json({ canReview: false, reason: 'No verified purchase' });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner Only)
export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    res.status(403);
    throw new Error('Not authorized to edit this review');
  }

  const updatedReview = await prisma.review.update({
    where: { id },
    data: {
      rating: Number(rating),
      comment,
    },
  });

  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const isAdmin = req.user?.isAdmin;

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.userId !== userId && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await prisma.review.delete({
    where: { id },
  });

  res.json({ message: 'Review removed' });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my/all
// @access  Private
export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(reviews);
});
