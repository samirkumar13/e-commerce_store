
// config must be imported first to load env vars immediately
import config from './config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware';

// Import all route handlers
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import settingRoutes from './routes/settingRoutes';
import slideRoutes from './routes/slideRoutes';
import seedRoutes from './routes/seedRoutes';
import uploadRoutes from './routes/uploadRoutes';
import wishlistRoutes from './routes/wishlistRoutes';


import addressRoutes from './routes/addressRoutes';
import reviewRoutes from './routes/reviewRoutes';
import path from 'path';


const app = express();

// Middleware
// Fix: Cast cors to any to resolve overload mismatch error
app.use(cors() as any);
app.use(express.json() as any);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')) as any);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/slides', slideRoutes);

app.use('/api/seed', seedRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);


// Root endpoint for health check
app.get('/', (req: Request, res: Response) => {
  // Fix: Cast res to any to allow usage of send method
  (res as any).send('Qurion Tech API is running...');
});

// Error Handling Middleware (must be last)
app.use(notFound as any);
app.use(errorHandler as any);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});