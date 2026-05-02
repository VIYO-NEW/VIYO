/**
 * OpenTelemetry MUST be the first import — it patches Node.js modules
 * before any other imports. See instrumentation.ts for details.
 */
import './instrumentation.js';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve as serveInngest } from 'inngest/hono';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { health } from './routes/health.js';
import { v1Router } from './routes/v1/index.js';
import { authMiddleware } from './middleware/auth.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRateLimiter } from './middleware/rate-limiter.js';
import { inngest, allFunctions } from './inngest/index.js';
import { appRouter } from './trpc/index.js';
import { createTRPCContext } from './trpc/context.js';

/**
 * VIYO Worker — Hono API Server
 * Deployed on Render at api.viyo.new
 * Authority: ARCH_LOCK_V3 §3, R18, R21, R22
 *
 * Middleware stack order:
 * request-id → logger → cors → [/api/inngest bypasses auth] → rate-limiter → auth → routes
 *
 * The /api/inngest endpoint is mounted BEFORE the rate-limiter and auth
 * middleware. It uses the Inngest signing key for authentication instead
 * of the standard T3 Supabase Auth middleware (PO directive).
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
      'https://viyo.new', // public production website
      'https://www.viyo.new', // public production website alias
      'https://staging.viyo.new', // public staging website
      'https://app.viyo.new', // logged-in Brands production app
      'https://app.staging.viyo.new', // logged-in Brands staging app
      'https://admin.viyo.new', // production admin portal
      'https://admin.staging.viyo.new', // staging admin portal
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  }),
);

/**
 * Inngest serve endpoint — BEFORE rate-limiter and auth.
 * PO directive: /api/inngest bypasses T3 Auth middleware.
 * Authentication is handled by the Inngest SDK via INNGEST_SIGNING_KEY.
 * The Inngest SDK validates the signing key on PUT (sync) and POST (invoke).
 * GET returns the introspection payload (function count, SDK version).
 */
app.on(
  ['GET', 'POST', 'PUT'],
  '/api/inngest',
  serveInngest({ client: inngest, functions: allFunctions }),
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

// --- tRPC API Island — T46 Art Director Routing Suite ---
app.all('/api/trpc/*', (c) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => createTRPCContext(c),
  }),
);

// --- Versioned API Routes ---
app.route('/api/v1', v1Router);

// --- Server ---
const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`VIYO Worker running on http://localhost:${info.port}`);
});

export default app;
