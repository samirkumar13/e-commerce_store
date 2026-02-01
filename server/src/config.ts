import dotenv from 'dotenv';
import path from 'path';

// Explicitly load the .env file from the server root directory
// This ensures it is found regardless of where the script is run from
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- HELPER FUNCTION to load and trim a variable ---
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // We log a warning instead of crashing immediately for non-critical keys, 
    // but for this app, we strictly check them.
    // allowing optional shiprocket for dev
    if (key.startsWith('SHIPROCKET')) return '';
    throw new Error(`FATAL ERROR: Environment variable "${key}" is not set. Please check your .env file.`);
  }
  return value.trim();
};

// --- CONFIGURATION OBJECT ---
const config = {
  databaseUrl: getEnvVar('DATABASE_URL'),
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN'),
  },
  port: getEnvVar('PORT'),
  phonepe: {
    merchantId: getEnvVar('PHONEPE_MERCHANT_ID'),
    saltKey: getEnvVar('PHONEPE_SALT_KEY'),
    saltIndex: getEnvVar('PHONEPE_SALT_INDEX'),
    apiUrl: getEnvVar('PHONEPE_API_URL'),
  },
  shiprocket: {
    email: getEnvVar('SHIPROCKET_EMAIL'),
    password: getEnvVar('SHIPROCKET_PASSWORD'),
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION,
  },
  frontendUrl: getEnvVar('FRONTEND_URL'),
  backendUrl: getEnvVar('BACKEND_URL'),
};

export default config;