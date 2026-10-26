import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value ?? `${fallback}`);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: toNumber(process.env.PORT, 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/store_management_app?schema=public',
  JWT_SECRET: process.env.JWT_SECRET ?? 'development-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret-change-me',
};
