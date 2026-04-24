import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { health } from './routes/health.js';
import { v1Router } from './routes/v1/index.js';
import { authMiddleware } from './middleware/auth.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRateLimiter } from './middleware/rate-limiter.js';

/**
 * VIYO Worker — Hono API Server
 * Deployed on Render at api.viyo.new
 * Authority: ARCH_LOCK_V3 §3, R18, R21, R22
 *
 * Middleware stack order:
 * request-id → logger → cors → rate-limiter → auth → routes
 * Error handler and notFound handler are registered globally.
 */
const app = new Hono();

// --- Global Error Handlers ---
app.onError(errorHandler);
app.notFound(notFoundHandler);

// --- Global Middleware Stack ---
// 1. Request ID — must be first for tracing
app.use('*', requestIdMiddleware);

// 2. Logger
app.use('*', logger());

// 3. CORS
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
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  }),
);

// 4. Rate Limiter — 100 req/min per IP (in-memory, Upstash-ready)
app.use('/api/*', createRateLimiter({ maxRequests: 100, windowMs: 60_000 }));

// 5. Auth — skips public paths internally (/health, /)
app.use('*', authMiddleware);

// --- Public Routes (exempted by auth middleware) ---
app.route('/health', health);

app.get('/', (c) => {
  return c.json({ service: 'viyo-worker', version: '0.0.1' });
});

// --- Versioned API Routes ---
app.route('/api/v1', v1Router);

// --- Server ---
const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`VIYO Worker running on http://localhost:${info.port}`);
});

export default app;
