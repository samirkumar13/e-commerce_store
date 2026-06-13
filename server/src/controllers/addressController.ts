import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(addresses);
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { type, name, street, city, state, pincode, country, phone, isDefault } = req.body;

  if (isDefault) {
    // If setting as default, unset others
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      type,
      name,
      street,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault,
    },
  });
  res.status(201).json(address);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { type, name, street, city, state, pincode, country, phone, isDefault } = req.body;

  const address = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      type,
      name,
      street,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault,
    },
  });
  res.json(updatedAddress);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const address = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  await prisma.address.delete({ where: { id } });
  res.json({ message: 'Address removed' });
});
