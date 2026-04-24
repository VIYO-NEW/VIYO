/**
 * Environment Variable Validation — R21 §3, P0-06
 * Zod-based schema that validates and types all env vars.
 * Fail-fast at boot: if required vars are missing, the process exits with a clear error.
 *
 * Usage:
 *   import { getWorkerEnv } from '@viyo/shared';
 *   const env = getWorkerEnv();  // throws if invalid
 *   env.SUPABASE_URL // typed string
 */
import { z } from 'zod';

/**
 * Worker (backend) environment schema.
 * Required vars throw on boot. Optional vars have defaults for dev.
 */
const workerEnvSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  DATABASE_URL: z.string().optional(),

  // Auth
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Vault
  VIYO_VAULT_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Image APIs
  GOOGLE_AI_API_KEY: z.string().optional(),
  IDEOGRAM_API_KEY: z.string().optional(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('viyo-assets'),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // OpenTelemetry
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('viyo-worker'),

  // Deployment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().int().min(1).max(65535))
    .default('3001'),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;

/**
 * Client (browser) environment schema.
 * Only VITE_ prefixed vars are exposed to the browser.
 */
const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  VITE_API_URL: z.string().url().default('http://localhost:3001'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/** Cached parsed worker env — singleton */
let cachedWorkerEnv: WorkerEnv | null = null;

/**
 * Parse and validate worker environment variables.
 * Throws with a clear error listing all missing/invalid vars.
 * Result is cached after first successful parse.
 */
export function getWorkerEnv(): WorkerEnv {
  if (cachedWorkerEnv) return cachedWorkerEnv;

  const result = workerEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    const message = `\n[VIYO] Environment validation failed. Fix the following and restart:\n${formatted}\n`;

    console.error(message);
    process.exit(1);
  }

  cachedWorkerEnv = result.data;
  return cachedWorkerEnv;
}

/** Cached parsed client env — singleton */
let cachedClientEnv: ClientEnv | null = null;

/**
 * Parse and validate client (Vite) environment variables.
 * In the browser, reads from import.meta.env.
 * On the server (SSR/tests), reads from process.env.
 */
export function getClientEnv(source?: Record<string, string | undefined>): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;

  const envSource = source ?? (typeof process !== 'undefined' ? process.env : {});
  const result = clientEnvSchema.safeParse(envSource);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `[VIYO] Client environment validation failed:\n${formatted}`,
    );
  }

  cachedClientEnv = result.data;
  return cachedClientEnv;
}

/**
 * Reset cached envs — useful for testing.
 */
export function resetEnvCache(): void {
  cachedWorkerEnv = null;
  cachedClientEnv = null;
}
