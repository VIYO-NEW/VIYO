/**
 * Error Handler Middleware — R18 §7, R21
 * Global Hono error boundary that catches all unhandled errors
 * and returns structured JSON responses with request IDs.
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
