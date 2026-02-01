
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../prisma';
import { User } from '@prisma/client';
import config from '../config'; // Import the validated config

/**
 * Generates a JSON Web Token for a given user ID.
 */
const generateToken = (id: string): string => {
  const secret = config.jwt.secret;
  const expiresIn = config.jwt.expiresIn;

  const options: SignOptions = {
    expiresIn: expiresIn,
  };

  return jwt.sign({ id }, secret, options);
};

/**
 * Registers a new user, hashes their password, and returns the user data with a token.
 */
export const register = async (email: string, password: string, name: string): Promise<Omit<User, 'passwordHash'> & { token: string }> => {
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('User with that email already exists');
  }
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  // Create an empty cart for the new user
  await prisma.cart.create({ data: { userId: user.id } });

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    token: generateToken(user.id),
  };
};

/**
 * Logs in a user by verifying their credentials and returns user data with a token.
 */
export const login = async (email: string, password: string): Promise<Omit<User, 'passwordHash'> & { token: string }> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token: generateToken(user.id),
    };
  }
  throw new Error('Invalid email or password');
};

/**
 * Fetches a user's profile data by their ID, excluding the password hash.
 */
export const getProfile = async (userId: string): Promise<Omit<User, 'passwordHash'>> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isAdmin: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
};
