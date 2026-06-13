import prisma from '../prisma';

export const getPublicSettings = async () => {
  const settings = await prisma.setting.findMany();
  // Convert array to a key-value object for easier frontend consumption
  return settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>
  );
};
