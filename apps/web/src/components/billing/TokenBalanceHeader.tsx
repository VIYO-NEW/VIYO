/**
 * TokenBalanceHeader — T9 Master Spec §6.1
 *
 * Persistent header component showing current token balance.
 * Color-coded: default (slate), <20% yellow, <5% red.
 * Clicking opens the QuickTopUpModal.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §6.1
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchTokenBalance } from '../../lib/billing-api';
import type { TokenBalance } from '../../lib/billing-api';
import { QuickTopUpModal } from './QuickTopUpModal';

const MONTHLY_GRANTS: Record<string, number> = {
  free: 1_000_000,
  starter: 6_000_000,
  growth: 23_000_000,
  agency: 100_000_000,
};

export function TokenBalanceHeader() {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [error, setError] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const data = await fetchTokenBalance();
      setBalance(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void loadBalance();
    // Refresh every 30 seconds
    const interval = setInterval(() => void loadBalance(), 30_000);
    return () => clearInterval(interval);
  }, [loadBalance]);

  if (error || !balance) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-400">
        <span>✨</span>
        <span>{error ? '—' : '...'}</span>
      </div>
    );
  }

  const monthlyGrant = MONTHLY_GRANTS[balance.subscriptionTier] ?? 1_000_000;
  const ratio = balance.balance / monthlyGrant;

  let colorClass = 'text-slate-200';
  if (ratio < 0.05) {
    colorClass = 'text-red-400';
  } else if (ratio < 0.2) {
    colorClass = 'text-yellow-400';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowTopUp(true)}
        className={`flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-slate-700 ${colorClass}`}
      >
        <span>✨</span>
        <span>{new Intl.NumberFormat().format(balance.balance)}</span>
      </button>

      {showTopUp && (
        <QuickTopUpModal
          currentBalance={balance.balance}
          onClose={() => setShowTopUp(false)}
          onPurchased={() => {
            setShowTopUp(false);
            void loadBalance();
          }}
        />
      )}
    </>
  );
}
