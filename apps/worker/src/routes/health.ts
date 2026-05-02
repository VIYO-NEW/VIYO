/**
 * Health Check Route — R18
 * GET /health — returns service metadata plus sanitized dependency readiness.
 *
 * Runtime contract:
 * - database: lightweight `SELECT id FROM workspaces LIMIT 1` through Drizzle.
 * - redis: Upstash Redis REST `PING` using configured REST URL/token.
 * - inngest: existing function registry plus signing/event key readiness.
 * - sentry: worker Sentry DSN readiness for error capture and observability.
 *
 * WHY: Render health checks need an HTTP-safe endpoint, while the Phase 5
 * staging gate needs dependency-level evidence that does not expose secrets,
 * URLs, JWTs, database row data, or stack traces.
 */
import { Hono } from 'hono';
import { workspaces } from '@viyo/db';
import { getDb } from '../lib/db.js';
import { allFunctions } from '../inngest/index.js';

const health = new Hono();

const MAX_DIAGNOSTIC_MESSAGE_LENGTH = 500;
const REDIS_PING_TIMEOUT_MS = 5_000;

type HealthStatus = 'ok' | 'degraded';

type DependencyStatus = {
  healthy: boolean;
  configured?: boolean;
  latencyMs?: number;
  error?: string;
  diagnostic?: SanitizedErrorDiagnostic;
};

type DatabaseStatus = DependencyStatus & {
  connected: boolean;
};

type RedisStatus = DependencyStatus & {
  configured: boolean;
};

type InngestStatus = DependencyStatus & {
  configured: boolean;
  functionCount: number;
  missing?: string[];
};

type SentryStatus = DependencyStatus & {
  configured: boolean;
  environment: string;
  missing?: string[];
};

type SanitizedErrorDiagnostic = {
  name?: string;
  code?: string;
  severity?: string;
  detail?: string;
  hint?: string;
  message?: string;
  cause?: SanitizedErrorDiagnostic;
};

health.get('/', async (c) => {
  const [dbStatus, redisStatus] = await Promise.all([checkDatabase(), checkRedis()]);
  const inngestStatus = checkInngest();
  const sentryStatus = checkSentry();

  const checks = {
    database: dbStatus,
    redis: redisStatus,
    inngest: inngestStatus,
    sentry: sentryStatus,
  };

  const status: HealthStatus = Object.values(checks).every((check) => check.healthy)
    ? 'ok'
    : 'degraded';

  return c.json({
    status,
    service: 'viyo-worker',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Perform a lightweight DB probe.
 * Returns { healthy: true, connected: true, latencyMs } on success,
 * or { healthy: false, connected: false, error, diagnostic } on failure.
 */
async function checkDatabase(): Promise<DatabaseStatus> {
  const db = getDb();

  if (!db) {
    return { healthy: false, connected: false, error: 'DATABASE_URL not configured' };
  }

  const start = performance.now();
  try {
    await db.select({ id: workspaces.id }).from(workspaces).limit(1);
    const latencyMs = getLatencyMs(start);
    return { healthy: true, connected: true, latencyMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return {
      healthy: false,
      connected: false,
      error: sanitizeDiagnosticString(message) ?? 'Unknown database error',
      diagnostic: sanitizeErrorDiagnostic(err),
    };
  }
}

/**
 * Verify Upstash Redis through the REST PING endpoint without exposing the URL
 * or token. Missing credentials are reported by variable name only.
 */
async function checkRedis(): Promise<RedisStatus> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const missing = getMissingEnvKeys({
    UPSTASH_REDIS_REST_URL: redisUrl,
    UPSTASH_REDIS_REST_TOKEN: redisToken,
  });

  if (missing.length > 0) {
    return {
      healthy: false,
      configured: false,
      error: `${missing.join(', ')} not configured`,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIS_PING_TIMEOUT_MS);
  const start = performance.now();

  try {
    const response = await fetch(`${redisUrl!.replace(/\/+$/, '')}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
      signal: controller.signal,
    });
    const latencyMs = getLatencyMs(start);
    const responseBody = await response.text();

    if (!response.ok) {
      return {
        healthy: false,
        configured: true,
        latencyMs,
        error: `Upstash Redis PING returned HTTP ${response.status}`,
      };
    }

    if (!responseBody.toUpperCase().includes('PONG')) {
      return {
        healthy: false,
        configured: true,
        latencyMs,
        error: 'Upstash Redis PING did not return PONG',
      };
    }

    return { healthy: true, configured: true, latencyMs };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      healthy: false,
      configured: true,
      error: aborted ? 'Upstash Redis PING timed out' : 'Upstash Redis PING failed',
      diagnostic: sanitizeErrorDiagnostic(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verify the Inngest runtime wiring by checking the existing function registry
 * and required provider secrets by name only.
 */
function checkInngest(): InngestStatus {
  const missing = getMissingEnvKeys({
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY?.trim(),
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY?.trim(),
  });
  const functionCount = allFunctions.length;

  if (functionCount === 0) {
    return {
      healthy: false,
      configured: missing.length === 0,
      functionCount,
      missing,
      error: 'No Inngest functions registered',
    };
  }

  if (missing.length > 0) {
    return {
      healthy: false,
      configured: false,
      functionCount,
      missing,
      error: `${missing.join(', ')} not configured`,
    };
  }

  return { healthy: true, configured: true, functionCount };
}

/**
 * Verify Sentry worker readiness without echoing the DSN. The environment value
 * is non-secret and helps distinguish staging from production during validation.
 */
function checkSentry(): SentryStatus {
  const missing = getMissingEnvKeys({
    SENTRY_DSN_WORKER: process.env.SENTRY_DSN_WORKER?.trim(),
  });
  const environment = process.env.SENTRY_ENVIRONMENT?.trim() || process.env.NODE_ENV?.trim() || 'unknown';

  if (missing.length > 0) {
    return {
      healthy: false,
      configured: false,
      environment,
      missing,
      error: `${missing.join(', ')} not configured`,
    };
  }

  return { healthy: true, configured: true, environment };
}

/**
 * Build a list of missing environment variable names without exposing values.
 */
function getMissingEnvKeys(requiredValues: Record<string, string | undefined>): string[] {
  return Object.entries(requiredValues)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

/**
 * Return rounded latency in milliseconds.
 */
function getLatencyMs(start: number): number {
  return Math.round((performance.now() - start) * 100) / 100;
}

/**
 * Build a redacted, stack-free error diagnostic safe for public health output.
 */
function sanitizeErrorDiagnostic(err: unknown, depth = 0): SanitizedErrorDiagnostic | undefined {
  if (!isRecord(err) || depth > 2) return undefined;

  const diagnostic: SanitizedErrorDiagnostic = {};
  assignSanitizedField(diagnostic, 'name', err.name);
  assignSanitizedField(diagnostic, 'code', err.code);
  assignSanitizedField(diagnostic, 'severity', err.severity);
  assignSanitizedField(diagnostic, 'detail', err.detail);
  assignSanitizedField(diagnostic, 'hint', err.hint);
  assignSanitizedField(diagnostic, 'message', err.message);

  const nestedCause = sanitizeErrorDiagnostic(err.cause, depth + 1);
  if (nestedCause && Object.keys(nestedCause).length > 0) {
    diagnostic.cause = nestedCause;
  }

  return Object.keys(diagnostic).length > 0 ? diagnostic : undefined;
}

/**
 * Copy a diagnostic field only after stringifying and redacting credential-shaped content.
 */
function assignSanitizedField(
  target: SanitizedErrorDiagnostic,
  key: keyof SanitizedErrorDiagnostic,
  value: unknown,
): void {
  if (key === 'cause') return;

  const sanitized = sanitizeDiagnosticString(value);
  if (sanitized) {
    target[key] = sanitized;
  }
}

/**
 * Redact URLs, credentials, and secret-like query values from temporary diagnostics.
 */
function sanitizeDiagnosticString(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const raw = String(value);
  if (!raw) return undefined;

  const redacted = raw
    .replace(/postgres(?:ql)?:\/\/[^\s/@:]+:[^\s/@]+@/gi, 'postgresql://[REDACTED]@')
    .replace(/\/\/[^\s/@:]+:[^\s/@]+@/g, '//[REDACTED]@')
    .replace(/((?:password|pass|pwd|token|secret|apikey|api_key)=)[^&\s]+/gi, '$1[REDACTED]');

  return redacted.length > MAX_DIAGNOSTIC_MESSAGE_LENGTH
    ? `${redacted.slice(0, MAX_DIAGNOSTIC_MESSAGE_LENGTH - 3)}...`
    : redacted;
}

/**
 * Narrow unknown values to objects with string keys for safe diagnostic extraction.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export { health };
