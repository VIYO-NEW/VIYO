/**
 * Zod Validation Middleware Factory — R18 §7
 * Generic Hono middleware that validates request body, query, or params
 * against a Zod schema. Returns 400 with structured error details on failure.
 *
 * Usage:
 *   app.post('/products', validateBody(createProductSchema), handler);
 *   app.get('/products', validateQuery(listProductsQuerySchema), handler);
 */
import type { Context, Next } from 'hono';
import { z } from 'zod';

/**
 * Validate JSON request body against a Zod schema.
 * On success: sets c.set('validatedBody', parsedData).
 * On failure: returns 400 with Zod error details.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    let rawBody: unknown;
    try {
      rawBody = await c.req.json();
    } catch {
      return c.json(
        {
          error: 'BadRequest',
          message: 'Request body must be valid JSON',
          statusCode: 400,
          requestId: (c.get('requestId') as string) ?? 'unknown',
        },
        400,
      );
    }

    const result = schema.safeParse(rawBody);

    if (!result.success) {
      return c.json(
        {
          error: 'ValidationError',
          message: 'Request body validation failed',
          statusCode: 400,
          requestId: (c.get('requestId') as string) ?? 'unknown',
          details: result.error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        400,
      );
    }

    c.set('validatedBody', result.data as z.infer<T>);
    return next();
  };
}

/**
 * Validate query parameters against a Zod schema.
 * On success: sets c.set('validatedQuery', parsedData).
 * On failure: returns 400 with Zod error details.
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const rawQuery = c.req.query();
    const result = schema.safeParse(rawQuery);

    if (!result.success) {
      return c.json(
        {
          error: 'ValidationError',
          message: 'Query parameter validation failed',
          statusCode: 400,
          requestId: (c.get('requestId') as string) ?? 'unknown',
          details: result.error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        400,
      );
    }

    c.set('validatedQuery', result.data as z.infer<T>);
    return next();
  };
}

/**
 * Validate route parameters against a Zod schema.
 * On success: sets c.set('validatedParams', parsedData).
 * On failure: returns 400 with Zod error details.
 */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const rawParams = c.req.param();
    const result = schema.safeParse(rawParams);

    if (!result.success) {
      return c.json(
        {
          error: 'ValidationError',
          message: 'Route parameter validation failed',
          statusCode: 400,
          requestId: (c.get('requestId') as string) ?? 'unknown',
          details: result.error.issues.map((issue: z.ZodIssue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        400,
      );
    }

    c.set('validatedParams', result.data as z.infer<T>);
    return next();
  };
}
