/**
 * BillingSettings Page — T9 Master Spec §6
 *
 * Settings > Billing page showing:
 * - Current plan and token balance
 * - Token ledger history
 * - Auto top-up settings
 * - Manage subscription link
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §6
 */
import { useState, useEffect } from 'react';
import { TokenLedgerTable } from '../components/billing/TokenLedgerTable';
import { fetchTokenBalance } from '../lib/billing-api';
import type { TokenBalance } from '../lib/billing-api';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  agency: 'Agency',
};

export function BillingSettings() {
  const [balance, setBalance] = useState<TokenBalance | null>(null);

  useEffect(() => {
    void fetchTokenBalance().then(setBalance).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your subscription, view token usage, and purchase top-ups.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Current Plan</h2>
        {balance ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
              <p className="text-lg font-bold text-viyo-600 dark:text-viyo-400">
                {TIER_LABELS[balance.subscriptionTier] ?? balance.subscriptionTier}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Token Balance</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat().format(balance.balance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lifetime Used</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat().format(balance.lifetimeConsumed)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Loading...</p>
        )}
      </div>

      {/* Token History */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Token History</h2>
        <TokenLedgerTable />
      </div>
    </div>
  );
}
