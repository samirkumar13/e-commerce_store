import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ------------------------------------------------------------------
  // Clean up existing data (FK-safe order)
  // ------------------------------------------------------------------
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.homeSlide.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.video.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
  console.log('  Cleared existing data');

  // Reliable placeholder image generator (brand slate/cyan palette)
  const ph = (text: string, w = 600, h = 600) =>
    `https://placehold.co/${w}x${h}/0f172a/38bdf8?text=${encodeURIComponent(text)}`;

  // ------------------------------------------------------------------
  // 1. Users
  // ------------------------------------------------------------------
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', salt);
  const userHash = await bcrypt.hash('test123', salt);

  const admin = await prisma.user.create({
    data: { email: 'admin@quriontech.in', name: 'Admin', passwordHash: adminHash, isAdmin: true },
  });
  await prisma.cart.create({ data: { userId: admin.id } });

  const testUser = await prisma.user.create({
    data: { email: 'test@quriontech.in', name: 'Test User', passwordHash: userHash, isAdmin: false },
  });
  await prisma.cart.create({ data: { userId: testUser.id } });
  await prisma.wishlist.create({ data: { userId: testUser.id } });
  console.log('  Users created');

  // ------------------------------------------------------------------
  // 2. Settings
  // ------------------------------------------------------------------
  await prisma.setting.createMany({
    data: [
      { key: 'storeName', value: 'Qurion Tech' },
      { key: 'storeDescription', value: 'Your one-stop shop for electronic components, development boards, and maker supplies.' },
      { key: 'storeEmail', value: 'support@quriontech.in' },
      { key: 'storePhone', value: '+91 98765 43210' },
      { key: 'storeAddress', value: '123, Tech Park, Bangalore, Karnataka 560001' },
      { key: 'storeCurrency', value: '₹' },
      { key: 'shippingCharge', value: '49' },
      { key: 'freeShippingAbove', value: '999' },
      { key: 'instagramUrl', value: 'https://instagram.com/quriontech' },
      { key: 'facebookUrl', value: 'https://facebook.com/quriontech' },
      { key: 'twitterUrl', value: 'https://twitter.com/quriontech' },
      { key: 'youtubeUrl', value: 'https://youtube.com/@quriontech' },
      { key: 'whatsappNumber', value: '+919876543210' },
      { key: 'youtubeChannel', value: 'UCxyz123' },
    ],
  });
  console.log('  Settings created');

  // ------------------------------------------------------------------
  // 3. Categories
  // ------------------------------------------------------------------
  const microcontrollers = await prisma.category.create({ data: { name: 'Microcontrollers', slug: 'microcontrollers', imageUrl: ph('Microcontrollers', 400, 400) } });
  const sbcs             = await prisma.category.create({ data: { name: 'Single Board Computers', slug: 'sbcs', imageUrl: ph('Single Board Computers', 400, 400) } });
  const sensors          = await prisma.category.create({ data: { name: 'Sensors', slug: 'sensors', imageUrl: ph('Sensors', 400, 400) } });
  const motors           = await prisma.category.create({ data: { name: 'Motors & Actuators', slug: 'motors', imageUrl: ph('Motors & Actuators', 400, 400) } });
  const prototyping      = await prisma.category.create({ data: { name: 'Prototyping', slug: 'prototyping', imageUrl: ph('Prototyping', 400, 400) } });
  const kits             = await prisma.category.create({ data: { name: 'Starter Kits', slug: 'kits', imageUrl: ph('Starter Kits', 400, 400) } });
  const displays         = await prisma.category.create({ data: { name: 'Displays', slug: 'displays', imageUrl: ph('Displays', 400, 400) } });
  const power            = await prisma.category.create({ data: { name: 'Power Components', slug: 'power-components', imageUrl: ph('Power Components', 400, 400) } });
  console.log('  Categories created');

  // ------------------------------------------------------------------
  // 4. Products
  // ------------------------------------------------------------------
  const products = [
    // Microcontrollers
    { name: 'Arduino Uno R3', slug: 'arduino-uno-r3', description: 'The classic Arduino Uno R3 is the perfect board to get started with electronics and coding. Based on ATmega328P.', price: 549, originalPrice: 699, imageUrl: 'https://images.unsplash.com/photo-1608096299210-db7e3848b94a?q=80&w=800&auto=format&fit=crop', images: [], stock: 150, sku: 'ARD-UNO-R3', categoryId: microcontrollers.id },
    { name: 'Arduino Nano', slug: 'arduino-nano', description: 'Compact and breadboard-friendly. ATmega328P, same pinout as Uno. Ideal for tight-space projects.', price: 299, originalPrice: 399, imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop', images: [], stock: 200, sku: 'ARD-NANO', categoryId: microcontrollers.id },
    { name: 'ESP32 Development Kit V1', slug: 'esp32-dev-kit-v1', description: 'Dual-core 240 MHz MCU with integrated WiFi & Bluetooth. Ideal for IoT and wireless projects.', price: 429, originalPrice: 549, imageUrl: 'https://images.unsplash.com/photo-1628867577363-e57544383c27?q=80&w=800&auto=format&fit=crop', images: [], stock: 120, sku: 'ESP32-DKIT', categoryId: microcontrollers.id },
    { name: 'ESP8266 NodeMCU v3', slug: 'esp8266-nodemcu-v3', description: 'WiFi-enabled microcontroller, programmable via Arduino IDE. Great for home automation projects.', price: 199, originalPrice: 249, imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=800&auto=format&fit=crop', images: [], stock: 200, sku: 'ESP8266-NMCU', categoryId: microcontrollers.id },
    { name: 'STM32F103C8T6 Blue Pill', slug: 'stm32-blue-pill', description: 'ARM Cortex-M3 dev board at 72 MHz, 64KB Flash. A powerful alternative to Arduino.', price: 299, originalPrice: 399, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', images: [], stock: 80, sku: 'STM32-BLUEPILL', categoryId: microcontrollers.id },
    // Single Board Computers
    { name: 'Raspberry Pi 4 Model B (4GB)', slug: 'raspberry-pi-4-4gb', description: 'Your tiny, dual-display, desktop computer. Quad-core Cortex-A72 at 1.8GHz, 4GB LPDDR4 RAM.', price: 5499, originalPrice: 5999, imageUrl: 'https://images.unsplash.com/photo-1561738069-370126a29d72?q=80&w=800&auto=format&fit=crop', images: [], stock: 22, sku: 'RPI-4-4GB', categoryId: sbcs.id },
    { name: 'Raspberry Pi Pico', slug: 'raspberry-pi-pico', description: 'RP2040 dual-core Cortex-M0+ at 133 MHz. MicroPython support. 26 multi-function GPIO pins.', price: 299, originalPrice: 349, imageUrl: 'https://images.unsplash.com/photo-1640955011254-39734e60b16f?q=80&w=800&auto=format&fit=crop', images: [], stock: 200, sku: 'RPI-PICO', categoryId: sbcs.id },
    // Sensors
    { name: 'DHT22 Temperature & Humidity Sensor', slug: 'dht22-sensor', description: 'High-accuracy digital temperature (-40–80°C) and humidity (0–100% RH) sensor.', price: 179, originalPrice: 229, imageUrl: 'https://images.unsplash.com/photo-1634952329824-0557e231d873?q=80&w=800&auto=format&fit=crop', images: [], stock: 250, sku: 'DHT22', categoryId: sensors.id },
    { name: 'DHT11 Temperature & Humidity Sensor', slug: 'dht11-sensor', description: 'Basic, ultra low-cost digital temperature and humidity sensor. Good for indoor use.', price: 99, originalPrice: 129, imageUrl: 'https://images.unsplash.com/photo-1641933846978-e9f2ad4db090?q=80&w=800&auto=format&fit=crop', images: [], stock: 300, sku: 'DHT11', categoryId: sensors.id },
    { name: 'HC-SR04 Ultrasonic Sensor', slug: 'hc-sr04-ultrasonic-sensor', description: '2cm–400cm non-contact distance measurement with 3mm accuracy. 5V operation.', price: 89, originalPrice: 119, imageUrl: 'https://images.unsplash.com/photo-1541892015-338a6bb54743?q=80&w=800&auto=format&fit=crop', images: [], stock: 500, sku: 'HCSR04', categoryId: sensors.id },
    { name: 'PIR Motion Sensor HC-SR501', slug: 'pir-motion-sensor', description: 'Adjustable sensitivity and delay. Detects motion up to 7 meters. Ideal for security projects.', price: 79, originalPrice: 99, imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800&auto=format&fit=crop', images: [], stock: 400, sku: 'PIR-HCSR501', categoryId: sensors.id },
    { name: 'MPU-6050 Gyroscope + Accelerometer', slug: 'mpu6050-gyro', description: '6-axis IMU with I2C. Perfect for drones, balance bots, and gesture control.', price: 129, originalPrice: 159, imageUrl: 'https://images.unsplash.com/photo-1606770347101-a1ac471cda5c?q=80&w=800&auto=format&fit=crop', images: [], stock: 180, sku: 'MPU6050', categoryId: sensors.id },
    // Motors
    { name: 'SG90 Micro Servo Motor', slug: 'sg90-micro-servo', description: 'Tiny and lightweight. ~180° rotation. Perfect for robotics and RC projects.', price: 149, originalPrice: 199, imageUrl: 'https://images.unsplash.com/photo-1611270453367-5a1097241f1a?q=80&w=800&auto=format&fit=crop', images: [], stock: 350, sku: 'SG90', categoryId: motors.id },
    { name: 'MG995 Metal Gear Servo', slug: 'mg995-servo', description: 'High-torque metal gear servo (11kg·cm). Good for robotic arms and heavy-duty RC.', price: 299, originalPrice: 379, imageUrl: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?q=80&w=800&auto=format&fit=crop', images: [], stock: 120, sku: 'MG995', categoryId: motors.id },
    { name: 'L298N Motor Driver Module', slug: 'l298n-motor-driver', description: 'Dual H-bridge for DC and stepper motors. Up to 2A per channel, 5–35V supply.', price: 149, originalPrice: 199, imageUrl: 'https://images.unsplash.com/photo-1581092334247-ddef2a41a41c?q=80&w=800&auto=format&fit=crop', images: [], stock: 200, sku: 'L298N', categoryId: motors.id },
    // Prototyping
    { name: '830 Point Solderless Breadboard', slug: 'solderless-breadboard-830', description: 'Full-size solderless breadboard with 830 tie points and power rails.', price: 99, originalPrice: 129, imageUrl: 'https://images.unsplash.com/photo-1580854401201-92d84a753896?q=80&w=800&auto=format&fit=crop', images: [], stock: 500, sku: 'BB-830', categoryId: prototyping.id },
    { name: 'Jumper Wire Kit (120 pcs)', slug: 'jumper-wire-kit-120', description: '120 Dupont jumper wires: 40 M-M, 40 M-F, 40 F-F, 20cm length.', price: 79, originalPrice: 99, imageUrl: 'https://images.unsplash.com/photo-1601588019474-6aa1f3bdfb52?q=80&w=800&auto=format&fit=crop', images: [], stock: 600, sku: 'JW-120', categoryId: prototyping.id },
    { name: 'Resistor Kit (600 pcs, 30 values)', slug: 'resistor-kit-600', description: '600 resistors from 10Ω to 1MΩ. 1/4W, 5% tolerance. Organised in a storage box.', price: 149, originalPrice: 199, imageUrl: 'https://images.unsplash.com/photo-1612535012aced6ea00fe6cc4c1fe08?q=80&w=800&auto=format&fit=crop', images: [], stock: 200, sku: 'RKIT-600', categoryId: prototyping.id },
    // Displays
    { name: '0.96" OLED Display (I2C)', slug: 'oled-096-i2c', description: '128×64 monochrome OLED with I2C. SSD1306 driver. Works with Arduino & Raspberry Pi.', price: 149, originalPrice: 199, imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop', images: [], stock: 220, sku: 'OLED-096', categoryId: displays.id },
    { name: '16×2 LCD Display (Blue Backlight)', slug: 'lcd-16x2-blue', description: 'Standard 16×2 character LCD, HD44780-compatible. Blue backlight, common for Arduino projects.', price: 89, originalPrice: 119, imageUrl: 'https://images.unsplash.com/photo-1564177096760-94cf15574408?q=80&w=800&auto=format&fit=crop', images: [], stock: 300, sku: 'LCD-16X2', categoryId: displays.id },
    // Kits
    { name: 'Elegoo UNO R3 Super Starter Kit', slug: 'elegoo-uno-starter-kit', description: 'Complete beginner kit with UNO R3 board, 200+ components, and a detailed project guide.', price: 3499, originalPrice: 4499, imageUrl: 'https://images.unsplash.com/photo-1606753028448-6aa5745e1029?q=80&w=800&auto=format&fit=crop', images: [], stock: 45, sku: 'ELG-UNO-KIT', categoryId: kits.id },
    // Power
    { name: 'TP4056 Li-Ion Charger Module', slug: 'tp4056-charger', description: '1A lithium battery charger with micro-USB input, over-charge and over-discharge protection.', price: 49, originalPrice: 69, imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc2523f0?q=80&w=800&auto=format&fit=crop', images: [], stock: 500, sku: 'TP4056', categoryId: power.id },
    { name: 'MT3608 Boost Converter Module', slug: 'mt3608-boost', description: 'Step-up DC-DC converter. Input 2–24V, adjustable output up to 28V, 2A max.', price: 59, originalPrice: 79, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', images: [], stock: 400, sku: 'MT3608', categoryId: power.id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: { ...product, imageUrl: ph(product.name) } });
  }
  console.log(`  ${products.length} products created`);

  // ------------------------------------------------------------------
  // 5. Home Slides
  // ------------------------------------------------------------------
  await prisma.homeSlide.createMany({
    data: [
      { title: 'New Arrivals: ESP32 & Sensor Modules', imageUrl: ph('New Arrivals', 1200, 450), linkUrl: '#/products', status: 'ACTIVE', order: 1 },
      { title: 'Dev Boards Sale — Up to 20% Off', imageUrl: ph('Dev Boards Sale', 1200, 450), linkUrl: '#/category/microcontrollers', status: 'ACTIVE', order: 2 },
      { title: 'Starter Kits — Everything You Need', imageUrl: ph('Starter Kits', 1200, 450), linkUrl: '#/category/kits', status: 'ACTIVE', order: 3 },
    ],
  });
  console.log('  Slides created');

  // ------------------------------------------------------------------
  // 6. Brands
  // ------------------------------------------------------------------
  await prisma.brand.createMany({
    data: [
      { name: 'Arduino', logoUrl: 'https://placehold.co/200x80/ffffff/00979D?text=Arduino', website: 'https://arduino.cc', status: 'ACTIVE', order: 1 },
      { name: 'Raspberry Pi', logoUrl: 'https://placehold.co/200x80/ffffff/c51a4a?text=Raspberry+Pi', website: 'https://raspberrypi.com', status: 'ACTIVE', order: 2 },
      { name: 'Espressif', logoUrl: 'https://placehold.co/200x80/ffffff/e40010?text=Espressif', website: 'https://espressif.com', status: 'ACTIVE', order: 3 },
      { name: 'STMicroelectronics', logoUrl: 'https://placehold.co/200x80/ffffff/0057a8?text=STMicro', website: 'https://st.com', status: 'ACTIVE', order: 4 },
      { name: 'Texas Instruments', logoUrl: 'https://placehold.co/200x80/ffffff/c41230?text=TI', website: 'https://ti.com', status: 'ACTIVE', order: 5 },
      { name: 'Elegoo', logoUrl: 'https://placehold.co/200x80/ffffff/f97316?text=Elegoo', website: 'https://elegoo.com', status: 'ACTIVE', order: 6 },
    ],
  });
  console.log('  Brands created');

  // ------------------------------------------------------------------
  // 7. Blog Posts
  // ------------------------------------------------------------------
  await prisma.blogPost.createMany({
    data: [
      {
        title: 'Getting Started with ESP32: WiFi + DHT22 in 10 Minutes',
        slug: 'getting-started-esp32-wifi-dht22',
        excerpt: 'Learn how to connect your ESP32 to WiFi and read a DHT22 sensor in just 10 minutes using the Arduino IDE.',
        content: '<h2>Introduction</h2><p>The ESP32 is one of the most powerful yet affordable microcontrollers available today. In this tutorial we will connect it to WiFi and read temperature data from a DHT22 sensor.</p><h2>What you need</h2><ul><li>ESP32 DevKit</li><li>DHT22 sensor</li><li>Jumper wires</li></ul>',
        imageUrl: ph('ESP32 Guide', 800, 450),
        category: 'Tutorials',
        type: 'TUTORIAL',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      {
        title: 'Arduino vs Raspberry Pi: Which Should You Choose?',
        slug: 'arduino-vs-raspberry-pi',
        excerpt: 'A complete comparison to help you pick the right platform for your next project.',
        content: '<h2>Overview</h2><p>Both Arduino and Raspberry Pi are excellent platforms for makers, but they serve different purposes. Arduino is a microcontroller; Raspberry Pi is a full single-board computer.</p>',
        imageUrl: ph('Arduino vs Raspberry Pi', 800, 450),
        category: 'Guides',
        type: 'BLOG',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      {
        title: 'Top 5 Sensors Every Maker Should Own',
        slug: 'top-5-sensors-every-maker',
        excerpt: 'From temperature to motion detection, these 5 sensors will unlock countless project possibilities.',
        content: '<h2>Introduction</h2><p>Sensors are the eyes and ears of any electronics project. Here are the five we recommend every maker keeps in their parts bin.</p>',
        imageUrl: ph('Top 5 Sensors', 800, 450),
        category: 'Products',
        type: 'BLOG',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      {
        title: 'Build a Smart Home Hub with Raspberry Pi 4',
        slug: 'smart-home-hub-raspberry-pi-4',
        excerpt: 'Turn your Raspberry Pi 4 into a powerful smart home hub running Home Assistant.',
        content: '<h2>Introduction</h2><p>Home Assistant is a powerful open-source platform for home automation. In this guide we install it on a Raspberry Pi 4.</p>',
        imageUrl: ph('Smart Home Hub', 800, 450),
        category: 'Projects',
        type: 'TUTORIAL',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    ],
  });
  console.log('  Blog posts created');

  // ------------------------------------------------------------------
  // 8. Videos
  // ------------------------------------------------------------------
  await prisma.video.createMany({
    data: [
      { title: 'ESP32 Complete Beginner Guide', youtubeId: 'xPlN_Tk3VLQ', type: 'FULL', category: 'Tutorial', description: 'Full walkthrough of ESP32 setup and first WiFi project.', status: 'ACTIVE', order: 1 },
      { title: 'Building a Smart Home with Arduino', youtubeId: 'CqF4oLFMbRg', type: 'FULL', category: 'Project', description: 'Step-by-step smart home automation project using Arduino and relays.', status: 'ACTIVE', order: 2 },
      { title: 'OLED Display with Arduino in 60 sec', youtubeId: 'PrIAnDZ9dp8', type: 'SHORT', category: 'Quick Tips', status: 'ACTIVE', order: 1 },
      { title: 'DHT22 Wiring in 60 seconds', youtubeId: 'IPrIAnDZ9dp8', type: 'SHORT', category: 'Quick Tips', status: 'ACTIVE', order: 2 },
    ],
  });
  console.log('  Videos created');

  // ------------------------------------------------------------------
  // 9. Coupon
  // ------------------------------------------------------------------
  await prisma.coupon.create({
    data: { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, minCartValue: 499, usageLimit: 100 },
  });
  console.log('  Coupon created: WELCOME10 (10% off, min ₹499)');

  console.log('\n✅ Seed complete!');
  console.log('   Admin: admin@quriontech.in / admin123');
  console.log('   User:  test@quriontech.in  / test123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
