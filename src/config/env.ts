import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET ?? 'development-only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  resetPasswordPath: process.env.CLIENT_URL
    ? `${process.env.CLIENT_URL}/reset-password/`
    : '/reset-password',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
