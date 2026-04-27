/**
 * Defines the VIYO web application root component and preserves the T12 Sentry error boundary while mounting the T15 router provider.
 * This file implements the approved T15 router integration without changing Sentry initialization order from `main.tsx`.
 * Wiring layer: Layer 6 Frontend UI, Layer 7 State/Navigation, Layer 12 Observability.
 */
import * as Sentry from '@sentry/react';
import { AppRouterProvider } from './router.js';

/**
 * T12: Sentry Error Boundary fallback UI.
 * Shown when an unhandled React error is caught by Sentry.
 */
function SentryFallback({ error, resetError }: { error: unknown; componentStack: string; eventId: string; resetError: () => void }) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mb-4 text-gray-600">{message}</p>
      <button
        type="button"
        onClick={resetError}
        className="rounded bg-viyo-700 px-4 py-2 text-white hover:bg-viyo-800"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * VIYO Web App — Root Component
 * T12: Wrapped in Sentry.ErrorBoundary for automatic error capture.
 * T15: TanStack Router provider is mounted inside Sentry so global React
 * errors remain captured while route-level fallbacks handle route states.
 */
export function App() {
  return (
    <Sentry.ErrorBoundary fallback={SentryFallback} showDialog>
      <AppRouterProvider />
    </Sentry.ErrorBoundary>
  );
}
