import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

const router = Router();

// The seed endpoint can create an admin account, so it must never be openly
// reachable. It is disabled unless ALLOW_SEED=true is explicitly set in the
// environment AND the request carries the matching SEED_SECRET.
const seedGuard = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.ALLOW_SEED !== 'true') {
    return res.status(404).json({ message: 'Not found' });
  }
  const provided = req.header('x-seed-secret');
  if (!process.env.SEED_SECRET || provided !== process.env.SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Seed endpoint - gated by ALLOW_SEED + SEED_SECRET (see seedGuard above)
router.get('/init', seedGuard, async (req: Request, res: Response) => {
  try {
    // Check if already seeded
    const count = await prisma.product.count();
    if (count > 0) {
      return res.json({ message: 'Database already seeded', productCount: count });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@circuithub.com',
        name: 'Admin',
        passwordHash,
        isAdmin: true,
      },
    });

    await prisma.cart.create({ data: { userId: admin.id } });

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: 'Microcontrollers', slug: 'microcontrollers' } }),
      prisma.category.create({ data: { name: 'Sensors', slug: 'sensors' } }),
      prisma.category.create({ data: { name: 'Development Boards', slug: 'development-boards' } }),
    ]);

    // Create sample products
    await prisma.product.createMany({
      data: [
        {
          name: 'Arduino Uno R3',
          slug: 'arduino-uno-r3',
          description: 'Popular microcontroller board based on ATmega328P',
          price: 25.99,
          stock: 50,
          categoryId: categories[2].id,
          imageUrl: 'https://via.placeholder.com/300x300?text=Arduino+Uno',
        },
        {
          name: 'ESP32 DevKit',
          slug: 'esp32-devkit',
          description: 'Powerful WiFi & Bluetooth development board',
          price: 12.99,
          stock: 100,
          categoryId: categories[2].id,
          imageUrl: 'https://via.placeholder.com/300x300?text=ESP32',
        },
        {
          name: 'DHT22 Temperature Sensor',
          slug: 'dht22-sensor',
          description: 'Digital temperature and humidity sensor',
          price: 4.99,
          stock: 200,
          categoryId: categories[1].id,
          imageUrl: 'https://via.placeholder.com/300x300?text=DHT22',
        },
      ],
    });

    const productCount = await prisma.product.count();
    res.json({
      message:
        'Database seeded successfully! Admin account created — sign in and change the password immediately.',
      productCount,
      adminEmail: admin.email,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
