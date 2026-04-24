/**
 * Request ID Middleware — R21, R18 §6
 * Attaches a unique UUID to every request for distributed tracing.
 * The ID is available via c.get('requestId') and returned in the X-Request-Id header.
 */
import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'hono';

export interface RequestIdEnv {
  Variables: {
    requestId: string;
  };
}

export async function requestIdMiddleware(c: Context, next: Next): Promise<void> {
  const requestId = (c.req.header('X-Request-Id') as string) ?? randomUUID();
  c.set('requestId', requestId);
  await next();
  c.header('X-Request-Id', requestId);
}
