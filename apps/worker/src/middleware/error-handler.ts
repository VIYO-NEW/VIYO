/**
 * Error Handler Middleware — R18 §7, R21, T12
 * Global Hono error boundary that catches all unhandled errors
 * and returns structured JSON responses with request IDs.
 *
 * T12: Forwards all 5xx errors to Sentry for real-time alerting.
 * Sentry import is dynamic to avoid hard dependency when DSN is not set.
 */
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Standard VIYO API error response shape */
export interface ApiErrorResponse {
  error: string;
  message: string;
  requestId: string;
  statusCode: number;
  details?: unknown;
}

/** Custom error class for API errors with status codes */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * T12: Capture an error in Sentry with request context.
 * Dynamic import so this is a no-op when @sentry/node is not installed
 * or SENTRY_DSN_WORKER is not set.
 */
function captureToSentry(err: Error, requestId: string, method: string, url: string): void {
  import('@sentry/node')
    .then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setTag('requestId', requestId);
        scope.setTag('method', method);
        scope.setContext('request', { url, method, requestId });
        Sentry.captureException(err);
      });
    })
    .catch(() => {
      // Sentry not available — silent no-op
    });
}

/**
 * Hono onError handler — registered via app.onError().
 * Catches all thrown errors and returns structured JSON.
 */
export function errorHandler(err: Error, c: Context): Response {
  const requestId = (c.get('requestId') as string) ?? 'unknown';

  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      error: err.name,
      message: err.message,
      requestId,
      statusCode: err.statusCode,
      details: err.details,
    };

    console.error(`[${requestId}] ApiError ${err.statusCode}: ${err.message}`);

    // T12: Capture 5xx ApiErrors in Sentry (skip 4xx — those are user errors)
    if (err.statusCode >= 500) {
      captureToSentry(err, requestId, c.req.method, c.req.url);
    }

    return c.json(body, err.statusCode as ContentfulStatusCode);
  }

  // Unexpected errors — do not leak internal details in production
  const isProduction = process.env.NODE_ENV === 'production';

  const body: ApiErrorResponse = {
    error: 'InternalServerError',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    requestId,
    statusCode: 500,
    details: isProduction ? undefined : err.stack,
  };

  console.error(`[${requestId}] Unhandled error:`, err);

  // T12: Capture all unhandled errors in Sentry with request context
  captureToSentry(err, requestId, c.req.method, c.req.url);

  return c.json(body, 500);
}

/**
 * Hono notFound handler — registered via app.notFound().
 */
export function notFoundHandler(c: Context): Response {
  const requestId = (c.get('requestId') as string) ?? 'unknown';

  const body: ApiErrorResponse = {
    error: 'NotFound',
    message: `Route ${c.req.method} ${new URL(c.req.url).pathname} not found`,
    requestId,
    statusCode: 404,
  };

  return c.json(body, 404);
}
