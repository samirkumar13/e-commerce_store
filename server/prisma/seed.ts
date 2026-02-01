// PASTE THIS CODE INTO: prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.homeSlide.deleteMany();
  await prisma.user.deleteMany();
  
  // Create Admin User
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('adminpassword', salt);
  const admin = await prisma.user.create({
      data: {
          email: 'admin@example.com',
          name: 'Admin User',
          passwordHash: adminPassword,
          isAdmin: true,
      }
  });
  await prisma.cart.create({ data: { userId: admin.id } });
  console.log('Admin user created');

  // Create Categories
  const microcontrollers = await prisma.category.create({ data: { name: 'Microcontrollers', slug: 'microcontrollers' } });
  const sbcs = await prisma.category.create({ data: { name: 'SBCs', slug: 'sbcs' } });
  const sensors = await prisma.category.create({ data: { name: 'Sensors', slug: 'sensors' } });
  const motors = await prisma.category.create({ data: { name: 'Motors', slug: 'motors' } });
  const prototyping = await prisma.category.create({ data: { name: 'Prototyping', slug: 'prototyping' } });
  const kits = await prisma.category.create({ data: { name: 'Kits', slug: 'kits' } });
  console.log('Categories created');

  const products = [
    {
      name: 'Arduino Uno R3',
      slug: 'arduino-uno-r3',
      description: 'The classic Arduino Uno R3 is the perfect board to get started with electronics and coding.',
      price: 999.00,
      originalPrice: 1250.00,
      imageUrl: 'https://images.unsplash.com/photo-1608096299210-db7e3848b94a?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 150,
      categoryId: microcontrollers.id,
    },
    {
      name: 'Raspberry Pi 4 Model B (4GB)',
      slug: 'raspberry-pi-4-4gb',
      description: 'Your tiny, dual-display, desktop computer...and robot brain, smart home hub, media centre, and much more.',
      price: 4500.00,
      imageUrl: 'https://images.unsplash.com/photo-1561738069-370126a29d72?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 80,
      categoryId: sbcs.id,
    },
    {
      name: 'DHT11 Temp & Humidity Sensor',
      slug: 'dht11-sensor',
      description: 'A basic, ultra low-cost digital temperature and humidity sensor.',
      price: 299.00,
      imageUrl: 'https://images.unsplash.com/photo-1634952329824-0557e231d873?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 300,
      categoryId: sensors.id,
    },
    {
      name: 'SG90 Micro Servo Motor',
      slug: 'sg90-micro-servo',
      description: 'Tiny and lightweight with high output power. Servo can rotate approximately 180 degrees.',
      price: 199.00,
      originalPrice: 250.00,
      imageUrl: 'https://images.unsplash.com/photo-1611270453367-5a1097241f1a?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 0,
      categoryId: motors.id,
    },
    {
      name: '400 Point Solderless Breadboard',
      slug: 'solderless-breadboard-400',
      description: 'Solderless breadboards are great for prototyping. They require no soldering and are completely reusable.',
      price: 350.00,
      imageUrl: 'https://images.unsplash.com/photo-1580854401201-92d84a753896?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 200,
      categoryId: prototyping.id,
    },
    {
      name: 'Elegoo UNO R3 Super Starter Kit',
      slug: 'elegoo-uno-starter-kit',
      description: 'The most complete starter kit for Arduino beginners. Comes with more than 200pcs components.',
      price: 4999.00,
      imageUrl: 'https://images.unsplash.com/photo-1606753028448-6aa5745e1029?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 45,
      categoryId: kits.id,
    },
    {
      name: 'ESP32 Development Kit V1',
      slug: 'esp32-dev-kit-v1',
      description: 'A powerful, generic WiFi+BT+BLE MCU module that targets a wide variety of applications.',
      price: 850.00,
      originalPrice: 1000.00,
      imageUrl: 'https://images.unsplash.com/photo-1628867577363-e57544383c27?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 120,
      categoryId: microcontrollers.id,
    },
    {
      name: 'Ultrasonic Sensor HC-SR04',
      slug: 'hc-sr04-ultrasonic-sensor',
      description: 'Provides 2cm to 400cm of non-contact measurement functionality with a ranging accuracy that can reach up to 3mm.',
      price: 150.00,
      imageUrl: 'https://images.unsplash.com/photo-1541892015-338a6bb54743?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 500,
      categoryId: sensors.id,
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log(`Seeding finished. ${products.length} products created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });