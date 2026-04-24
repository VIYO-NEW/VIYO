/**
 * Drizzle Database Client — ARCH_LOCK_V3 §4, R20
 * Singleton Drizzle client for the worker process.
 * Requires DATABASE_URL to be set. If not available, returns null
 * so the worker can still boot for non-DB endpoints.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@viyo/db';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pgClient: ReturnType<typeof postgres> | null = null;

/**
 * Get or create the Drizzle client singleton.
 * Returns null if DATABASE_URL is not configured.
 */
export function getDb(): ReturnType<typeof drizzle<typeof schema>> | null {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('[VIYO] DATABASE_URL not set — DB routes will return 503');
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
