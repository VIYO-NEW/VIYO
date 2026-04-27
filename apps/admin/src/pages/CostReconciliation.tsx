/**
 * Billing Economics Control Panel — T9 Master Spec §11
 *
 * Admin-only dashboard for managing VIYO's billing economics:
 * - Margin Health Dashboard (real-time margin calculations)
 * - System Config Management (TOKEN_MULTIPLIER, etc.)
 * - Multiplier Simulation (what-if analysis)
 * - Provider Price Registry
 * - Promo Code Manager
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §11
 */
import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface EconomicsData {
  tokenMultiplier: number;
  marginFloorPercent: number;
  amazingEmailBaseline: {
    sections: number;
    images: number;
    revisions: number;
  };
  tierMargins: Record<string, {
    monthlyPrice: number;
    monthlyGrant: number;
    costPerToken: number;
    monthlyProviderCost: number;
    grossMargin: number;
  }>;
}

interface SystemConfigEntry {
  key: string;
  value: unknown;
  description: string | null;
  updatedAt: string;
}

interface PromoCode {
  id: string;
  code: string;
  tokenGrant: number;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
  expiresAt: string | null;
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

/* ──────────────────────────────────────────────
 * Margin Health Dashboard
 * ────────────────────────────────────────────── */
function MarginHealthDashboard({ data }: { data: EconomicsData | null }) {
  if (!data) {
    return <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-400">Loading economics data...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Margin Health Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Token Multiplier</p>
          <p className="text-2xl font-bold text-white">{new Intl.NumberFormat().format(data.tokenMultiplier)}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Margin Floor</p>
          <p className="text-2xl font-bold text-white">{data.marginFloorPercent}%</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Amazing Email Baseline</p>
          <p className="text-sm font-medium text-white">
            {data.amazingEmailBaseline.sections}s / {data.amazingEmailBaseline.images}i / {data.amazingEmailBaseline.revisions}r
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Tier</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Monthly Price</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Monthly Grant</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Provider Cost</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Gross Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {Object.entries(data.tierMargins).map(([tier, margin]) => (
              <tr key={tier} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium capitalize text-white">{tier}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  ${(margin.monthlyPrice / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {new Intl.NumberFormat().format(margin.monthlyGrant)}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  ${margin.monthlyProviderCost.toFixed(2)}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${
                  margin.grossMargin >= data.marginFloorPercent
                    ? 'text-emerald-400'
                    : margin.grossMargin >= 20
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}>
                  {margin.grossMargin.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * System Config Manager
 * ────────────────────────────────────────────── */
function SystemConfigManager() {
  const [configs, setConfigs] = useState<SystemConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConfigs = useCallback(async () => {
    try {
      const res = await adminFetch<{ data: SystemConfigEntry[] }>('/api/v1/admin/billing/config');
      setConfigs(res.data);
    } catch (err) {
      console.error('[VIYO] Failed to load system config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfigs();
  }, [loadConfigs]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">System Configuration</h2>
      <div className="overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Key</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Value</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Description</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading...</td>
              </tr>
            ) : configs.map((config) => (
              <tr key={config.key} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-viyo-400">{config.key}</td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-slate-300">
                  {typeof config.value === 'string' ? config.value : JSON.stringify(config.value)}
                </td>
                <td className="px-4 py-3 text-slate-400">{config.description ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(config.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Promo Code Manager
 * ────────────────────────────────────────────── */
function PromoCodeManager() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPromos = useCallback(async () => {
    try {
      const res = await adminFetch<{ data: PromoCode[] }>('/api/v1/admin/billing/promos');
      setPromos(res.data);
    } catch (err) {
      console.error('[VIYO] Failed to load promo codes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPromos();
  }, [loadPromos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Promo Codes</h2>
        <button
          type="button"
          className="rounded-lg bg-viyo-600 px-4 py-2 text-sm font-medium text-white hover:bg-viyo-700"
        >
          Create Promo Code
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Code</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Token Grant</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Redemptions</th>
              <th className="px-4 py-3 text-center font-medium text-slate-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No promo codes yet</td>
              </tr>
            ) : promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono font-bold text-white">{promo.code}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {new Intl.NumberFormat().format(promo.tokenGrant)}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {promo.currentRedemptions}{promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ''}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    promo.isActive
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Main Page Component
 * ────────────────────────────────────────────── */
export function CostReconciliation() {
  const [economics, setEconomics] = useState<EconomicsData | null>(null);

  useEffect(() => {
    void adminFetch<{ data: EconomicsData }>('/api/v1/admin/billing/economics')
      .then((res) => setEconomics(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing Economics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Control VIYO&apos;s billing economics, token multiplier, margins, and promotional codes.
        </p>
      </div>

      <MarginHealthDashboard data={economics} />
      <SystemConfigManager />
      <PromoCodeManager />
    </div>
  );
}
