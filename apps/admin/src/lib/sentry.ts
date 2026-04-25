/**
 * Sentry Error Monitoring — Admin Portal (Vite React SPA) — T12
 *
 * Initializes @sentry/react with:
 * - Browser error capture (unhandled exceptions + rejections)
 * - Performance monitoring via BrowserTracing
 * - Session replay for production debugging
 * - Sensitive data scrubbing from T8 VaultService patterns
 * - Graceful degradation when VITE_SENTRY_DSN_ADMIN is not set
 *
 * MUST be imported in main.tsx BEFORE React renders.
 *
 * Authority: T12, T8 (Vault scrubbing), ARCH_LOCK_V3 §3
 */
import * as Sentry from '@sentry/react';
/**
 * Sensitive field patterns for Sentry scrubbing.
 * Duplicated from @viyo/shared/security/vault.ts to avoid pulling
 * node:crypto into the browser bundle via barrel imports.
 * Keep in sync with packages/shared/src/security/vault.ts.
 */
const SENSITIVE_FIELD_PATTERNS = [
  /key/i,
  /secret/i,
  /credential/i,
  /password/i,
  /token/i,
  /vault/i,
  /api_key/i,
  /apikey/i,
] as const;

const dsn = import.meta.env.VITE_SENTRY_DSN_ADMIN as string | undefined;
const environment = import.meta.env.MODE ?? 'development';
const release = `viyo-admin@${import.meta.env.VITE_APP_VERSION ?? '0.0.0'}`;

/**
 * Sentry beforeSend hook — scrubs sensitive fields from error events.
 * Uses the same SENSITIVE_FIELD_PATTERNS from T8 VaultService.
 */
function beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
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
 * Initialize Sentry for the admin portal.
 * No-op when VITE_SENTRY_DSN_ADMIN is not set — zero overhead in dev.
 */
if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and block all media in replays for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0, // Always capture replay on error

    beforeSend,

    // Ignore common browser noise
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      /Loading chunk .* failed/,
    ],
  });

  console.log(`[VIYO] Sentry initialized → ${environment} (release: ${release})`);
} else {
  console.log('[VIYO] Sentry disabled — VITE_SENTRY_DSN_ADMIN not set');
}

export { Sentry };
