/**
 * QuickTopUpModal — T9 Master Spec §6.3
 *
 * Modal for quick token top-up purchases.
 * Shows pack options and redirects to Stripe Checkout.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §6.3
 */
import { useState } from 'react';
import { createTopUp } from '../../lib/billing-api';

interface QuickTopUpModalProps {
  currentBalance: number;
  onClose: () => void;
  onPurchased: () => void;
}

const TOP_UP_PACKS = [
  { id: 'small', tokens: 5_000_000, price: '$9.99', label: '5M Tokens' },
  { id: 'medium', tokens: 15_000_000, price: '$24.99', label: '15M Tokens' },
  { id: 'large', tokens: 50_000_000, price: '$69.99', label: '50M Tokens' },
];

export function QuickTopUpModal({ currentBalance, onClose, onPurchased }: QuickTopUpModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePurchase(packId: string) {
    setLoading(packId);
    try {
      const result = await createTopUp(packId);
      if (result.data.url) {
        window.location.href = result.data.url;
      }
      onPurchased();
    } catch (err) {
      console.error('[VIYO] Top-up failed:', err);
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Top Up Tokens
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Current balance: {new Intl.NumberFormat().format(currentBalance)} tokens
        </p>

        <div className="space-y-3">
          {TOP_UP_PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              disabled={loading !== null}
              onClick={() => void handlePurchase(pack.id)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-viyo-500 hover:bg-viyo-50 disabled:opacity-50 dark:border-slate-700 dark:hover:border-viyo-400 dark:hover:bg-slate-800"
            >
              <div className="text-left">
                <p className="font-semibold text-slate-900 dark:text-white">{pack.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Intl.NumberFormat().format(pack.tokens)} tokens
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-viyo-600 dark:text-viyo-400">{pack.price}</p>
                {loading === pack.id && (
                  <p className="text-xs text-slate-400">Redirecting...</p>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg py-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
