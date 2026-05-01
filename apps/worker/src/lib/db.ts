/**
 * Drizzle Database Client — ARCH_LOCK_V3 §4, R20
 * Singleton Drizzle client for the worker process.
 * Requires DATABASE_URL to be set to a valid postgres/postgresql URL. If not
 * available or invalid, returns null so the worker can still boot for non-DB
 * endpoints and health checks can degrade safely.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@viyo/db';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pgClient: ReturnType<typeof postgres> | null = null;

/**
 * Validate DATABASE_URL before handing it to postgres-js.
 *
 * WHY: Render staging may contain literal dashboard placeholders such as
 * `<STAGING_SUPABASE_POOLED_DATABASE_URL>` until real staging credentials are
 * provisioned. postgres-js throws synchronously on malformed URLs, which turns
 * `/health` into HTTP 500 and prevents Render's health check from succeeding.
 * Invalid or placeholder values should behave the same as an unconfigured DB:
 * DB-backed routes remain unavailable, while the worker process and public
 * health route continue to run in degraded mode.
 */
function normalizeDatabaseUrl(databaseUrl: string | undefined): string | null {
  const trimmedUrl = databaseUrl?.trim();
  if (!trimmedUrl) return null;

  if (trimmedUrl.startsWith('<') && trimmedUrl.endsWith('>')) {
    console.warn('[VIYO] DATABASE_URL placeholder detected — DB routes will return 503');
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (parsedUrl.protocol !== 'postgres:' && parsedUrl.protocol !== 'postgresql:') {
      console.warn(`[VIYO] DATABASE_URL uses unsupported protocol ${parsedUrl.protocol} — DB routes will return 503`);
      return null;
    }

    return trimmedUrl;
  } catch {
    console.warn('[VIYO] DATABASE_URL is invalid — DB routes will return 503');
    return null;
  }
}

/**
 * Get or create the Drizzle client singleton.
 * Returns null if DATABASE_URL is not configured or invalid.
 */
export function getDb(): ReturnType<typeof drizzle<typeof schema>> | null {
  if (dbInstance) return dbInstance;

  const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (!databaseUrl) {
    console.warn('[VIYO] DATABASE_URL not configured for a valid DB connection — DB routes will return 503');
    return null;
  }

  pgClient = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  dbInstance = drizzle(pgClient, { schema });
  return dbInstance;
}

/**
 * Close the database connection — for graceful shutdown.
 */
export async function closeDb(): Promise<void> {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
    dbInstance = null;
  }
}
