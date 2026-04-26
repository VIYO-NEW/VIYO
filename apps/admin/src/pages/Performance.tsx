/**
 * Performance — Performance & Scoring Dashboard
 *
 * Placeholder for: Campaign scoring, A/B test results, engagement metrics.
 * Implements: R17 §10.5.
 * Wiring Layer: Layer 7 (UI)
 */

export function Performance() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Performance & Scoring</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        R17 §10.5 — Campaign performance scoring, A/B test results, and engagement metrics.
      </p>

      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Performance & Scoring Dashboard
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Spec: R17 §10.5 — Implementation deferred to analytics tasks
          </p>
        </div>
      </div>
    </div>
  );
}
