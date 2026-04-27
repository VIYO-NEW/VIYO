/**
 * InsufficientTokensModal — T9 Master Spec §6.3
 *
 * Triggered by 402 API interceptor when generation fails due to
 * insufficient tokens. Shows buy options and resumes operation.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §6.3
 */
import { useState } from 'react';
import { createTopUp } from '../../lib/billing-api';

interface InsufficientTokensModalProps {
  estimatedCost?: number;
  currentBalance: number;
  onClose: () => void;
  onPurchased: () => void;
}

export function InsufficientTokensModal({
  estimatedCost,
  currentBalance,
  onClose,
  onPurchased,
}: InsufficientTokensModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleBuy(packId: string) {
    setLoading(packId);
    try {
      const result = await createTopUp(packId);
      if (result.data.url) {
        window.location.href = result.data.url;
      }
      onPurchased();
    } catch (err) {
      console.error('[VIYO] Purchase failed:', err);
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <span className="text-2xl">⚠️</span>
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Insufficient Tokens
        </h2>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {estimatedCost
            ? `This operation requires approximately ${new Intl.NumberFormat().format(estimatedCost)} tokens, but your balance is only ${new Intl.NumberFormat().format(currentBalance)}.`
            : `Your token balance (${new Intl.NumberFormat().format(currentBalance)}) is too low to complete this operation.`}
        </p>

        <div className="space-y-2">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void handleBuy('small')}
            className="w-full rounded-lg bg-viyo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-viyo-700 disabled:opacity-50"
          >
            {loading === 'small' ? 'Redirecting...' : 'Buy 5M Tokens ($9.99)'}
          </button>

          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void handleBuy('medium')}
            className="w-full rounded-lg border border-viyo-300 px-4 py-3 font-semibold text-viyo-600 transition-colors hover:bg-viyo-50 disabled:opacity-50 dark:border-viyo-700 dark:text-viyo-400 dark:hover:bg-slate-800"
          >
            {loading === 'medium' ? 'Redirecting...' : 'Buy 15M Tokens ($24.99)'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg px-4 py-2 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
