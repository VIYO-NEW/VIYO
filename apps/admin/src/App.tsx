import * as Sentry from '@sentry/react';
import type { Workspace } from '@viyo/shared';
import { Button } from '@viyo/ui';

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
 * VIYO Admin Portal — Root Component
 * T12: Wrapped in Sentry.ErrorBoundary for automatic error capture.
 * Placeholder for Phase 0 scaffold validation.
 */
export function App() {
  // Type validation: ensure cross-package import works at build time
  void (0 as unknown as Workspace);

  return (
    <Sentry.ErrorBoundary fallback={SentryFallback} showDialog>
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
        <h1 className="mb-4 text-4xl font-bold text-viyo-700">VIYO Admin</h1>
        <p className="mb-6 text-lg text-gray-600">Internal Administration Portal</p>
        <Button variant="secondary" size="lg">
          Dashboard
        </Button>
        <p className="mt-8 text-sm text-gray-400">
          Phase 0 Scaffold — admin.viyo.new
        </p>
      </div>
    </Sentry.ErrorBoundary>
  );
}
