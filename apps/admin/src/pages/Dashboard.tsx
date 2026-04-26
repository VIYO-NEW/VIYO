/**
 * Dashboard — Admin Overview Page
 *
 * Displays global platform metrics: Total Users, MRR, Campaigns, API Error Rate.
 * Implements: Doc9 Part 10 (admin dashboard overview).
 * Wiring Layer: Layer 7 (UI)
 *
 * Mock data strategy:
 * Hardcoded MOCK_DATA object typed to AdminDashboardMetrics.
 * Trivially replaceable with useQuery() when /api/admin/dashboard is built.
 */

import type { AdminDashboardMetrics } from '@viyo/shared';

const MOCK_DATA: AdminDashboardMetrics = {
  totalUsers: 1_247,
  mrr: 48_500,
  totalCampaigns: 3_892,
  apiErrorRate: 0.23,
};

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{subtext}</p>
    </div>
  );
}

export function Dashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={MOCK_DATA.totalUsers.toLocaleString()}
          subtext="+12% from last month"
        />
        <MetricCard
          label="Monthly Recurring Revenue"
          value={`$${MOCK_DATA.mrr.toLocaleString()}`}
          subtext="+8% from last month"
        />
        <MetricCard
          label="Total Campaigns"
          value={MOCK_DATA.totalCampaigns.toLocaleString()}
          subtext="Across all brands"
        />
        <MetricCard
          label="API Error Rate"
          value={`${MOCK_DATA.apiErrorRate}%`}
          subtext="Last 24 hours"
        />
      </div>

      {/* Placeholder sections for future dashboard widgets */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Recent Activity Feed — coming soon
          </p>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            System Health Summary — coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
