import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SKIP_ENV_VALIDATION: z.string().optional(),
});

// Skip validation during build time or if explicitly skipped
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD === 'true';
const skipValidation = isBuildTime || process.env.SKIP_ENV_VALIDATION === 'true';

let validatedEnv = process.env as any;

if (!skipValidation) {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Critical: Missing or invalid environment variables in production.');
    }
  } else {
    validatedEnv = result.data;
  }
}

export const env = validatedEnv as z.infer<typeof envSchema>;
