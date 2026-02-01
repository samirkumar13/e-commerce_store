import { PrismaClient } from '@prisma/client';

// This creates a single, reusable instance of the PrismaClient.
const prisma = new PrismaClient();

export default prisma;
