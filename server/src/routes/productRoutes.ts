import { Router, Request, Response } from 'express';
import { getProducts, getProductById, checkServiceability } from '../controllers/productController';
import asyncHandler from 'express-async-handler';
import prisma from '../prisma';

const router = Router();

router.route('/').get(getProducts);
router.route('/serviceability').post(checkServiceability);

// Related products — same category, exclude current
router.get(
  '/:id/related',
  asyncHandler(async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id }, select: { categoryId: true } });
    if (!product) { res.json([]); return; }
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: req.params.id } },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
    res.json(related);
  })
);

// Stock notification subscription
router.post(
  '/:id/notify',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Valid email is required.' }); return;
    }
    const product = await prisma.product.findUnique({ where: { id: req.params.id }, select: { stock: true } });
    if (!product) { res.status(404).json({ message: 'Product not found.' }); return; }
    if (product.stock > 0) { res.json({ message: 'This product is already in stock!' }); return; }
    await prisma.stockNotification.upsert({
      where: { email_productId: { email, productId: req.params.id } },
      update: { notified: false },
      create: { email, productId: req.params.id },
    });
    res.status(201).json({ message: 'You will be notified when this product is back in stock.' });
  })
);

router.route('/:id').get(getProductById);

export default router;
