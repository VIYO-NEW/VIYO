/**
 * BrandsList — Tenant Management Page
 *
 * Displays all brands/tenants with impersonation capability (placeholder).
 * Implements: Doc9 Part 10 (brand management with impersonation).
 * Wiring Layer: Layer 7 (UI)
 *
 * Mock data strategy:
 * Hardcoded MOCK_BRANDS array typed to AdminBrandEntry[].
 * Trivially replaceable with useQuery() when /api/admin/brands is built.
 */

import type { AdminBrandEntry } from '@viyo/shared';

const MOCK_BRANDS: AdminBrandEntry[] = [
  { id: 'b1', name: 'Acme Corp', plan: 'Enterprise', userCount: 45, campaignCount: 312, createdAt: '2025-06-15', status: 'active' },
  { id: 'b2', name: 'StyleHub', plan: 'Pro', userCount: 12, campaignCount: 89, createdAt: '2025-08-22', status: 'active' },
  { id: 'b3', name: 'FreshBrew Co', plan: 'Starter', userCount: 3, campaignCount: 15, createdAt: '2026-01-10', status: 'trial' },
  { id: 'b4', name: 'TechNova', plan: 'Enterprise', userCount: 67, campaignCount: 445, createdAt: '2025-03-01', status: 'active' },
  { id: 'b5', name: 'GreenLeaf', plan: 'Pro', userCount: 8, campaignCount: 52, createdAt: '2025-11-30', status: 'suspended' },
];

function StatusBadge({ status }: { status: AdminBrandEntry['status'] }) {
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    trial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function BrandsList() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {MOCK_BRANDS.length} total
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Brand</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Plan</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Users</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Campaigns</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {MOCK_BRANDS.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{brand.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{brand.plan}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{brand.userCount}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{brand.campaignCount}</td>
                <td className="px-6 py-4"><StatusBadge status={brand.status} /></td>
                <td className="px-6 py-4">
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
