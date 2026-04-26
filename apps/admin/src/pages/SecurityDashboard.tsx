/**
 * SecurityDashboard — Security Monitoring
 *
 * Placeholder for: Failed Login Heatmap, Threat Detection.
 * Implements: R17 §10.2A (R22, R29).
 * Wiring Layer: Layer 7 (UI)
 */

export function SecurityDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        R17 §10.2A — Failed login heatmap, threat detection, and audit logs.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Login Heatmap</h3>
          <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            Geographic heatmap of failed authentication attempts. Highlights
            brute-force patterns and suspicious IP ranges.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: R22</p>
        </div>

        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Threat Detection</h3>
          <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time alerts for credential stuffing, token replay attacks,
            and anomalous API usage patterns.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: R29</p>
        </div>

        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log</h3>
          <p className="mt-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            Immutable log of all superadmin actions: impersonation events,
            configuration changes, and manual overrides.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Spec: R22, R29</p>
        </div>
      </div>
    </div>
  );
}
