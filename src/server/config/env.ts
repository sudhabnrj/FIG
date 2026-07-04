import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(8),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const getEnv = () => {
  const result = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
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
        NODE_ENV: 'production' as const,
      };
    }
    
    throw new Error('Invalid environment variables. Please check your .env.local file.');
  }

  return result.data;
};

export const env = getEnv();
