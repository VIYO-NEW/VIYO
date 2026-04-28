/**
 * tRPC Context Adapter — T46
 *
 * Converts the already-authenticated Hono request context into the narrow tRPC
 * context required by artDirector.routeGeneration. The mount lives behind the
 * existing worker middleware stack, so this adapter must not re-implement auth
 * or bypass request IDs.
 */
import type { Context } from 'hono';
import type { AuthContext } from '@viyo/shared';

export interface TRPCContext {
  auth: AuthContext;
  requestId: string;
}

export function createTRPCContext(c: Context): TRPCContext {
  const auth = c.get('auth') as AuthContext | undefined;
  const requestId = (c.get('requestId') as string | undefined) ?? 'unknown';

  if (!auth) {
    throw new Error('Authenticated Hono context is required for tRPC requests');
  }

  return { auth, requestId };
}
