import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://localhost:27017/ai-electrostore'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters').default('super_secret_auth_key_1234567890_min16'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').default('sk-mock-key-for-build'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default('electrostore'),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().default('123456789'),
  CLOUDINARY_API_SECRET: z.string().default('mock_cloudinary_secret'),
  RESEND_API_KEY: z.string().default('re_mock_key'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_mock_stripe_key'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_mock_stripe_webhook'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://ai-electrostore.vercel.app'),
});

// Ahead-of-Time Compiled Validator for zero overhead
export const compiledEnvValidator = typeof (z as any).compile === 'function'
  ? (z as any).compile(envSchema, { jitless: true })
  : envSchema;

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
});
