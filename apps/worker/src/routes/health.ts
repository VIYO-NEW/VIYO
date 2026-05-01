/**
 * Health Check Route — R18
 * GET /health — returns service metadata and database connectivity status.
 * The DB check performs a lightweight `SELECT id FROM workspaces LIMIT 1`
 * to verify the connection pool is alive. If DATABASE_URL is not configured
 * or the query fails, the response degrades gracefully to status "degraded".
 */
import { Hono } from 'hono';
import { workspaces } from '@viyo/db';
import { getDb } from '../lib/db.js';

const health = new Hono();

const MAX_DIAGNOSTIC_MESSAGE_LENGTH = 500;

type DatabaseStatus = {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  diagnostic?: SanitizedErrorDiagnostic;
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
  const dbStatus = await checkDatabase();

  const status = dbStatus.connected ? 'ok' : 'degraded';

  return c.json({
    status,
    service: 'viyo-worker',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
    },
  });
});

/**
 * Perform a lightweight DB probe.
 * Returns { connected: true, latencyMs } on success,
 * or { connected: false, error, diagnostic } on failure.
 */
async function checkDatabase(): Promise<DatabaseStatus> {
  const db = getDb();

  if (!db) {
    return { connected: false, error: 'DATABASE_URL not configured' };
  }

  const start = performance.now();
  try {
    await db.select({ id: workspaces.id }).from(workspaces).limit(1);
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    return { connected: true, latencyMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return {
      connected: false,
      error: sanitizeDiagnosticString(message) ?? 'Unknown database error',
      // TEMPORARY DIAGNOSTIC: captures non-secret driver metadata while the
      // production DB connectivity issue is being isolated. Remove after the
      // permanent fix is verified in production.
      diagnostic: sanitizeErrorDiagnostic(err),
    };
  }
}

/**
 * Build a redacted, stack-free error diagnostic safe for temporary production use.
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
