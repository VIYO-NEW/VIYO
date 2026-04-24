/**
 * Health Check Route — R18
 * GET /health — returns service metadata and database connectivity status.
 * The DB check performs a lightweight `SELECT id FROM workspaces LIMIT 1`
 * to verify the connection pool is alive. If DATABASE_URL is not configured
 * or the query fails, the response degrades gracefully to status "degraded".
 */
import { Hono } from 'hono';
import { workspaces } from '@viyo/db';
import { getDb } from '../lib/db.js';

const health = new Hono();

health.get('/', async (c) => {
  const dbStatus = await checkDatabase();

  const status = dbStatus.connected ? 'ok' : 'degraded';

  return c.json({
    status,
    service: 'viyo-worker',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
    },
  });
});

/**
 * Perform a lightweight DB probe.
 * Returns { connected: true, latencyMs } on success,
 * or { connected: false, error } on failure.
 */
async function checkDatabase(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const db = getDb();

  if (!db) {
    return { connected: false, error: 'DATABASE_URL not configured' };
  }

  const start = performance.now();
  try {
    await db.select({ id: workspaces.id }).from(workspaces).limit(1);
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    return { connected: true, latencyMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return { connected: false, error: message };
  }
}

export { health };
