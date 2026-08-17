import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  MONGODB_URI: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters — generate one with `openssl rand -base64 48`'),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  
  EMAIL_USER: z.email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  
  OTP_EXPIRATION_MINUTES: z.string().default('10').transform(Number),
  MAX_LOGIN_ATTEMPTS: z.string().default('5').transform(Number),
  LOCK_TIME_MINUTES: z.string().default('15').transform(Number),
  
  PAYMOB_API_KEY: z.string().optional(),
  PAYMOB_INTEGRATION_ID: z.string().optional(),
  PAYMOB_IFRAME_ID: z.string().optional(),
  PAYMOB_HMAC_SECRET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
