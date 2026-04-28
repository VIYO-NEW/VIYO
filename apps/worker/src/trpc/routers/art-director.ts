/**
 * Art Director tRPC Router — T46
 *
 * Exposes the PO-locked artDirector.routeGeneration procedure. Procedure logic
 * stays thin: validate through the shared schema, preserve auth context, delegate
 * orchestration to the domain router, and return the shared response contract.
 */
import { TRPCError } from '@trpc/server';
import { routeGenerationRequestSchema, routeGenerationResponseSchema } from '@viyo/shared';
import { routeGeneration } from '../../lib/ai/image-router.js';
import { ApiError } from '../../middleware/error-handler.js';
import { publicProcedure, router } from '../core.js';

export const artDirectorRouter = router({
  routeGeneration: publicProcedure
    .input(routeGenerationRequestSchema)
    .output(routeGenerationResponseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await routeGeneration(input, {
          auth: ctx.auth,
          requestId: ctx.requestId,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          throw new TRPCError({
            code: err.statusCode === 402 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR',
            message: err.message,
            cause: err,
          });
        }

        throw err;
      }
    }),
});
