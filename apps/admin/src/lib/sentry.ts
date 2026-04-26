/**
 * Sentry Error Monitoring — Admin Portal (Lazy-loaded) — T12
 *
 * Dynamically imports @sentry/react to keep it out of the initial bundle.
 * The Sentry SDK (~37KB minified) is loaded asynchronously after the first
 * render, so it doesn't block initial page load.
 *
 * The initSentry() promise resolves once Sentry.init() has been called.
 * App.tsx uses getSentry() to conditionally render ErrorBoundary.
 *
 * Authority: T12, T8 (Vault scrubbing), ARCH_LOCK_V3 §3, PO bundle size directive
 */

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

/**
 * Sentry module reference — stored as `unknown` to avoid inline import()
 * type annotations that violate @typescript-eslint/consistent-type-imports.
 * Consumers cast via getSentry() which returns the properly typed module.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SentryModule: any = null;

/**
 * Initialize Sentry lazily. Dynamically imports @sentry/react and calls init().
 * No-op when VITE_SENTRY_DSN_ADMIN is not set — zero overhead in dev.
 */
export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN_ADMIN as string | undefined;
  const environment = import.meta.env.MODE ?? 'development';
  const release = `viyo-admin@${import.meta.env.VITE_APP_VERSION ?? '0.0.0'}`;

  if (!dsn) {
    console.log('[VIYO] Sentry disabled — VITE_SENTRY_DSN_ADMIN not set');
    return;
  }

  const Sentry = await import('@sentry/react');
  SentryModule = Sentry;

  /**
   * Sentry beforeSend hook — scrubs sensitive fields from error events.
   */
  function scrubObject(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scrubObject(obj[key] as Record<string, unknown>);
      }
    }
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      const scrubbed = JSON.parse(JSON.stringify(event));
      if (scrubbed.extra) {
        scrubObject(scrubbed.extra as Record<string, unknown>);
      }
      if (scrubbed.contexts) {
        scrubObject(scrubbed.contexts as unknown as Record<string, unknown>);
      }
      return scrubbed;
    },
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      /Loading chunk .* failed/,
    ],
  });

  console.log(`[VIYO] Sentry initialized → ${environment} (release: ${release})`);
}

/**
 * Get the loaded Sentry module (null if not yet initialized or DSN not set).
 * Used by App.tsx to conditionally render Sentry.ErrorBoundary.
 *
 * Returns the @sentry/react module with ErrorBoundary, captureException, etc.
 * The `any` type is intentional — the module is dynamically imported and
 * consumers use it for ErrorBoundary which accepts generic props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSentry(): any {
  return SentryModule;
}
