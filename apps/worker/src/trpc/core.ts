/**
 * tRPC Core Primitives — T46
 *
 * Centralizes app-level tRPC builders for the minimal Hono-mounted island.
 */
import { initTRPC } from '@trpc/server';
import type { TRPCContext } from './context.js';

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
