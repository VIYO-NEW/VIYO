import { Hono } from 'hono';

const health = new Hono();

/**
 * GET /health — Health check endpoint.
 * Returns 200 OK with service metadata.
 */
health.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'viyo-worker',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
  });
});

export { health };
