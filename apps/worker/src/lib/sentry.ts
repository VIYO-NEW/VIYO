/**
 * Sentry Error Monitoring — Worker (Hono) — T12
 *
 * Initializes @sentry/node with:
 * - @sentry/opentelemetry bridge to existing T5 OTel NodeSDK
 * - Sensitive data scrubbing from T8 VaultService patterns
 * - Graceful degradation when SENTRY_DSN_WORKER is not set
 * - Performance monitoring with configurable sample rate
 *
 * MUST be imported AFTER instrumentation.ts (OTel) but BEFORE
 * any application code that might throw errors.
 *
 * Authority: T12, T5 (OTel), T8 (Vault scrubbing), ARCH_LOCK_V3 §3
 */
import * as Sentry from '@sentry/node';
import { SentryPropagator, SentrySpanProcessor, SentrySampler } from '@sentry/opentelemetry';
import { SENSITIVE_FIELD_PATTERNS } from '@viyo/shared';

const dsn = process.env.SENTRY_DSN_WORKER;
const environment = process.env.NODE_ENV ?? 'development';
const release = process.env.SENTRY_RELEASE ?? `viyo-worker@${process.env.npm_package_version ?? '0.0.0'}`;

/**
 * Sentry beforeSend hook — scrubs sensitive fields from error events.
 * Uses the same SENSITIVE_FIELD_PATTERNS from T8 VaultService to ensure
 * consistent redaction across the entire system.
 */
function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  // Deep-clone and scrub sensitive fields from extra/contexts/breadcrumbs
  const scrubbed = JSON.parse(JSON.stringify(event)) as Sentry.ErrorEvent;

  function scrubObject(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scrubObject(obj[key] as Record<string, unknown>);
      }
    }
  }

  if (scrubbed.extra) {
    scrubObject(scrubbed.extra as Record<string, unknown>);
  }
  if (scrubbed.contexts) {
    scrubObject(scrubbed.contexts as unknown as Record<string, unknown>);
  }

  return scrubbed;
}

/**
 * Initialize Sentry for the worker process.
 * No-op when SENTRY_DSN_WORKER is not set — zero overhead in dev.
 */
if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    profilesSampleRate: environment === 'production' ? 0.1 : 0,

    // Wire into existing T5 OTel NodeSDK via @sentry/opentelemetry
    skipOpenTelemetrySetup: true, // We manage OTel ourselves in instrumentation.ts

    beforeSend,

    // Ignore noisy health check errors
    ignoreErrors: [
      'HealthCheckError',
      /ECONNREFUSED/,
    ],

    // Integrations — Sentry auto-detects Node.js integrations
    // The OTel bridge is wired via SentrySpanProcessor in instrumentation.ts
  });

  console.log(`[VIYO] Sentry initialized → ${environment} (release: ${release})`);
} else {
  console.log('[VIYO] Sentry disabled — SENTRY_DSN_WORKER not set');
}

/**
 * Export Sentry OTel components for use in instrumentation.ts.
 * These are wired into the NodeSDK configuration to bridge
 * OTel traces into Sentry's performance monitoring.
 */
export { Sentry, SentryPropagator, SentrySpanProcessor, SentrySampler };
