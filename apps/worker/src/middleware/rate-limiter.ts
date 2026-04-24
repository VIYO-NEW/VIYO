/**
 * Rate Limiter Middleware — R21 §3, R19
 * In-memory sliding window rate limiter.
 * Designed to be swapped for Upstash Redis when keys are available.
 *
 * Default: 100 requests per 60 seconds per IP.
 * Returns 429 with Retry-After header when exceeded.
 */
import type { Context, Next } from 'hono';

interface WindowEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Maximum requests per window. Default: 100 */
  maxRequests: number;
  /** Window duration in milliseconds. Default: 60_000 (1 minute) */
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  maxRequests: 100,
  windowMs: 60_000,
};

/** In-memory store — keyed by IP address */
const store = new Map<string, WindowEntry>();

/** Periodic cleanup interval (every 5 minutes) */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(windowMs: number): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60_000);

  // Allow process to exit even if interval is running
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Create a rate limiter middleware with configurable options.
 */
export function createRateLimiter(opts?: Partial<RateLimiterOptions>) {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  startCleanup(options.windowMs);

  return async function rateLimiterMiddleware(c: Context, next: Next): Promise<Response | void> {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      ?? c.req.header('x-real-ip')
      ?? 'unknown';

    const now = Date.now();
    const entry = store.get(ip) ?? { timestamps: [] };

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => now - t < options.windowMs);

    if (entry.timestamps.length >= options.maxRequests) {
      const oldestInWindow = entry.timestamps[0]!;
      const retryAfterMs = options.windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      c.header('Retry-After', String(retryAfterSec));
      c.header('X-RateLimit-Limit', String(options.maxRequests));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil((oldestInWindow + options.windowMs) / 1000)));

      return c.json(
        {
          error: 'TooManyRequests',
          message: `Rate limit exceeded. Try again in ${retryAfterSec} seconds.`,
          statusCode: 429,
        },
        429,
      );
    }

    entry.timestamps.push(now);
    store.set(ip, entry);

    c.header('X-RateLimit-Limit', String(options.maxRequests));
    c.header('X-RateLimit-Remaining', String(options.maxRequests - entry.timestamps.length));

    return next();
  };
}

/**
 * Reset the in-memory store — useful for testing.
 */
export function resetRateLimiterStore(): void {
  store.clear();
}
