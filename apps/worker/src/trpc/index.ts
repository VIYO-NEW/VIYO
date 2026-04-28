/**
 * Worker tRPC Router — T46
 *
 * Minimal tRPC island mounted under the existing Hono worker. This file is the
 * single export surface for future typed clients while preserving Hono as the
 * primary worker framework.
 */
import { artDirectorRouter } from './routers/art-director.js';
import { createCallerFactory, router } from './core.js';

export const appRouter = router({
  artDirector: artDirectorRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
