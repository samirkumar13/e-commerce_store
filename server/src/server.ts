// config must be imported first to load env vars immediately
import config from './config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import blogRoutes from './routes/blogRoutes';
import videoRoutes from './routes/videoRoutes';
import brandRoutes from './routes/brandRoutes';
import path from 'path';

const app = express();

// --- Security middleware ---
// Set sensible security headers. crossOriginResourcePolicy is relaxed so the
// SPA on a different origin can still load images served from /uploads.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }) as any);

// Restrict CORS to the configured frontend origin instead of allowing any site.
// localhost variants are permitted in non-production for local development.
const allowedOrigins = [
  config.frontendUrl,
  ...(config.nodeEnv === 'production' ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000']),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header) and whitelisted origins.
      // For disallowed origins we simply omit CORS headers (callback false) rather
      // than throwing, so the browser blocks it without a noisy 500 server error.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }) as any
);

app.use(express.json() as any);

// Throttle authentication endpoints to slow down brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 20 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')) as any);

// API Routes
app.use('/api/auth', authLimiter as any, authRoutes);
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
app.use('/api/blogs', blogRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/brands', brandRoutes);

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
