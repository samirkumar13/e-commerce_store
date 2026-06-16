import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../prisma';
import { User } from '@prisma/client';
import config from '../config';
import { creditWallet } from './walletService';

// Retries up to 5 times to avoid the rare P2002 unique-constraint collision on referralCode
const generateUniqueReferralCode = async (): Promise<string> => {
  for (let i = 0; i < 5; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate a unique referral code');
};

const generateToken = (id: string): string => {
  const secret = config.jwt.secret;
  const expiresIn = config.jwt.expiresIn as jwt.SignOptions['expiresIn'];

  const options: SignOptions = {
    expiresIn: expiresIn,
  };

  return jwt.sign({ id }, secret, options);
};

/**
 * Registers a new user, hashes their password, and returns the user data with a token.
 */
export const register = async (
  email: string,
  password: string,
  name: string,
  referralCode?: string
): Promise<Omit<User, 'passwordHash'> & { token: string }> => {
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('User with that email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newReferralCode = await generateUniqueReferralCode();

  // Validate referrer if code provided
  let referredBy: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer) referredBy = referrer.id;
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash, referralCode: newReferralCode, referredBy },
  });

  // Create an empty cart for the new user
  await prisma.cart.create({ data: { userId: user.id } });

  // If referred, credit the new user immediately as a welcome bonus
  if (referredBy) {
    try {
      const referralSetting = await prisma.setting.findFirst({ where: { key: 'referralBonusPoints' } });
      const bonus = referralSetting?.value ? parseInt(referralSetting.value) : 100;
      await creditWallet(user.id, bonus, 'CREDIT_REFERRAL', 'Welcome bonus — you joined via a referral link');
      // Referrer gets their bonus when this user places their first paid order (in confirmOrder)
    } catch (err) {
      console.error('Referral welcome bonus failed:', err);
    }
  }

  // Refresh user to include updated walletBalance
  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
  const { passwordHash: _, ...userWithoutPassword } = freshUser!;

  return {
    ...userWithoutPassword,
    token: generateToken(user.id),
  };
};

/**
 * Logs in a user by verifying their credentials and returns user data with a token.
 */
export const login = async (
  email: string,
  password: string
): Promise<Omit<User, 'passwordHash'> & { token: string }> => {
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
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, isAdmin: true, role: true, permissions: true, isVerified: true, createdAt: true, updatedAt: true, walletBalance: true, referralCode: true, referredBy: true },
  });
  if (!user) throw new Error('User not found');

  if (!user.referralCode) {
    const newCode = await generateUniqueReferralCode();
    user = await prisma.user.update({
      where: { id: userId },
      data: { referralCode: newCode },
      select: { id: true, email: true, name: true, isAdmin: true, role: true, permissions: true, isVerified: true, createdAt: true, updatedAt: true, walletBalance: true, referralCode: true, referredBy: true },
    });
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; email?: string }
): Promise<Omit<User, 'passwordHash'>> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...data },
    select: { id: true, email: true, name: true, isAdmin: true, role: true, permissions: true, isVerified: true, createdAt: true, updatedAt: true, walletBalance: true, referralCode: true, referredBy: true },
  });
  return user;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const matches = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!matches) throw new Error('Incorrect current password');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
};
