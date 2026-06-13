// src/utils/validationSchemas.ts
import { z } from 'zod';

// Fix: Removed the outer 'body' object from the schema.
// The validation middleware applies the schema directly to req.body.
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
});

// Fix: Removed the outer 'body' object.
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
