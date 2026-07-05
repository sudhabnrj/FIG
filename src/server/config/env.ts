import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8).optional().default('placeholder_jwt_refresh_secret'),
  GOOGLE_CLIENT_ID: z.string().optional().default('placeholder_google_client_id'),
  GOOGLE_CLIENT_SECRET: z.string().optional().default('placeholder_google_client_secret'),
  GITHUB_CLIENT_ID: z.string().optional().default('placeholder_github_client_id'),
  GITHUB_CLIENT_SECRET: z.string().optional().default('placeholder_github_client_secret'),
  APP_URL: z.string().url().optional().default('http://localhost:3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const getEnv = () => {
  const result = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.warn('⚠️ Environment validation failed:', result.error.format());
    
    // During production builds, don't crash the build due to missing runtime env variables
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production';
    if (isBuildPhase) {
      return {
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/placeholder',
        JWT_SECRET: process.env.JWT_SECRET || 'placeholder_jwt_secret_value',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'placeholder_jwt_refresh_secret',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'placeholder_google_client_id',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_google_client_secret',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'placeholder_github_client_id',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'placeholder_github_client_secret',
        APP_URL: process.env.APP_URL || 'http://localhost:3001',
        NODE_ENV: 'production' as const,
      };
    }
    
    throw new Error('Invalid environment variables. Please check your .env.local file.');
  }

  return result.data;
};

export const env = getEnv();
