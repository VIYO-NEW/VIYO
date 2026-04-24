import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { health } from './routes/health.js';

/**
 * VIYO Worker — Hono API Server
 * Deployed on Render at api.viyo.new
 * Authority: ARCH_LOCK_V3 §3, R21
 */
const app = new Hono();

// --- Middleware ---
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173', // apps/web dev
      'http://localhost:5174', // apps/admin dev
      'https://app.viyo.new',
      'https://admin.viyo.new',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// --- Routes ---
app.route('/health', health);

// Root route
app.get('/', (c) => {
  return c.json({ service: 'viyo-worker', version: '0.0.1' });
});

// --- Server ---
const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`VIYO Worker running on http://localhost:${info.port}`);
});

export default app;
