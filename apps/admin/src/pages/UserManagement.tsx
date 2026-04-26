/**
 * UserManagement — Cross-Brand User Table
 *
 * Displays all users across all brands for superadmin management.
 * Implements: Doc9 Part 10 (cross-brand user management).
 * Wiring Layer: Layer 7 (UI)
 *
 * Mock data strategy:
 * Hardcoded MOCK_USERS array typed to AdminUserEntry[].
 * Trivially replaceable with useQuery() when /api/admin/users is built.
 */

import type { AdminUserEntry } from '@viyo/shared';

const MOCK_USERS: AdminUserEntry[] = [
  { id: 'u1', email: 'alice@acme.com', name: 'Alice Chen', brandName: 'Acme Corp', role: 'admin', lastLogin: '2026-04-24', status: 'active' },
  { id: 'u2', email: 'bob@stylehub.io', name: 'Bob Martinez', brandName: 'StyleHub', role: 'editor', lastLogin: '2026-04-23', status: 'active' },
  { id: 'u3', email: 'carol@freshbrew.co', name: 'Carol Wu', brandName: 'FreshBrew Co', role: 'admin', lastLogin: '2026-04-20', status: 'active' },
  { id: 'u4', email: 'dave@technova.ai', name: 'Dave Patel', brandName: 'TechNova', role: 'viewer', lastLogin: '2026-04-15', status: 'suspended' },
  { id: 'u5', email: 'eve@greenleaf.eco', name: 'Eve Johnson', brandName: 'GreenLeaf', role: 'admin', lastLogin: '2026-03-28', status: 'active' },
];

export function UserManagement() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {MOCK_USERS.length} total
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Brand</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Last Login</th>
              <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.brandName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.lastLogin}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
