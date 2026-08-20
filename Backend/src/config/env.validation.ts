import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  // Not z.url(): a replica-set connection string lists several hosts
  // separated by commas, which is valid Mongo syntax but not a parseable URL,
  // and rejecting it would refuse to boot against a perfectly good cluster.
  // The scheme is the part actually worth checking.
  MONGODB_URI: z
    .string()
    .refine(
      (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://',
    ),

  // One or more site origins, comma-separated — a deployed site has several
  // (production, custom domain, per-branch previews) and all of them need to
  // pass CORS. Validated per entry so one malformed origin is caught here at
  // boot rather than as a confusing CORS failure in the browser later.
  FRONTEND_URL: z
    .string()
    .default('http://localhost:3001')
    .refine(
      (value) =>
        value
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean)
          .every((url) => URL.canParse(url)),
      'FRONTEND_URL must be a URL, or several comma-separated URLs',
    ),
  
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters — generate one with `openssl rand -base64 48`'),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  
  // Email transport — Brevo's HTTP API is preferred where SMTP ports are
  // blocked (most managed hosts); Gmail over SMTP stays for local development.
  // All optional: the app runs without email, it just delivers nothing.
  BREVO_API_KEY: z.string().optional(),
  MAIL_FROM_ADDRESS: z.email().optional(),
  MAIL_FROM_NAME: z.string().optional(),

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
