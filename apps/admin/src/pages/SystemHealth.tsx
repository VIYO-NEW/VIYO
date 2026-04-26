/**
 * SystemHealth — Infrastructure Monitoring
 *
 * Placeholder for: Inngest Queue Monitor, Render Worker Status.
 * Implements: R17 §10.2B (R21).
 * Wiring Layer: Layer 7 (UI)
 *
 * NOTE: R17 §10.2B references "Edge Worker Status" for Cloudflare Workers.
 * PO corrected this to "Render Worker Status" — VIYO uses Render for the
 * Hono API worker, not Cloudflare Workers for the primary API.
 */

export function SystemHealth() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        R17 §10.2B — Inngest queue monitoring and Render worker status.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inngest Queue Monitor</h3>
          <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            Visibility into background jobs (image generation, data scraping).
            Retry failed jobs or pause queues during outages.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: R21</p>
        </div>

        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Render Worker Status</h3>
          <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            Latency and error rate metrics for the Hono API worker running on Render.
            Monitors request throughput, P95 response times, and active connections.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: R21 (corrected from &quot;Edge Worker&quot;)</p>
        </div>
      </div>
    </div>
  );
}
