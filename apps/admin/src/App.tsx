/**
 * App — Root Component for VIYO Admin Portal
 *
 * Composes the three-tier error handling stack:
 * 1. Sentry.ErrorBoundary (top-level — catches everything, reports to Sentry)
 * 2. TanStack Router defaultErrorComponent (route-level — per-route errors)
 * 3. Per-page error states (component-level — handled inline)
 *
 * Implements: T12 (Sentry), PO Phase 1 review item #1 (Sentry integration),
 *             PO Phase 1 review item #2 (error/loading states).
 * Wiring Layer: Layer 7 (UI) → Layer 11 (Observability via Sentry)
 */

import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router.js';
import { useThemeStore } from './stores/theme.js';

/**
 * Sentry Error Boundary fallback UI.
 * This is the last-resort error screen. If this renders, something
 * catastrophic happened that the router's ErrorComponent couldn't catch.
 */
function SentryFallback({
  error,
  resetError,
}: {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 dark:bg-gray-950">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <button
        type="button"
        onClick={resetError}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Root App component.
 * Initializes the theme system on mount and provides the router.
 */
export function App() {
  const initialize = useThemeStore((s) => s.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return (
    <Sentry.ErrorBoundary fallback={SentryFallback} showDialog>
      <RouterProvider router={router} />
    </Sentry.ErrorBoundary>
  );
}
