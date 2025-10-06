import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
};
