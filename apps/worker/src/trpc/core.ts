/**
 * tRPC Core Primitives — T46
 *
 * Centralizes app-level tRPC builders for the minimal Hono-mounted island.
 */
import { initTRPC } from '@trpc/server';
import { ApiError } from '../middleware/error-handler.js';
import type { TRPCContext } from './context.js';

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    const cause = error.cause;
    if (cause instanceof ApiError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          httpStatus: cause.statusCode,
          apiError: {
            message: cause.message,
            details: cause.details,
          },
        },
      };
    }

    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
