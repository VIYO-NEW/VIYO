/**
 * TokenLedgerTable — T9 Master Spec §6.2
 *
 * Paginated token transaction history table.
 * Columns: Date, Description, Amount (+/-), Balance.
 * 20 rows per page, server-side pagination.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §6.2
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchLedger } from '../../lib/billing-api';
import type { LedgerEntry } from '../../lib/billing-api';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatAmount(amount: number): { text: string; className: string } {
  const formatted = new Intl.NumberFormat().format(Math.abs(amount));
  if (amount >= 0) {
    return { text: `+ ${formatted}`, className: 'text-emerald-400' };
  }
  return { text: `- ${formatted}`, className: 'text-slate-300' };
}

export function TokenLedgerTable() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await fetchLedger(p, PAGE_SIZE);
      setEntries(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('[VIYO] Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [page, loadPage]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Date</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Description</th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Amount</th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                Loading...
              </td>
            </tr>
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                No transactions yet
              </td>
            </tr>
          ) : (
            entries.map((entry) => {
              const amount = formatAmount(entry.amount);
              return (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-200">
                    {entry.description}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-mono ${amount.className}`}>
                    {amount.text}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-400">
                    {new Intl.NumberFormat().format(entry.runningBalance)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
