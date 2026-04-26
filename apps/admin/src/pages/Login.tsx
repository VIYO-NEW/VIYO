/**
 * Login Page — Admin Portal Authentication Gateway
 *
 * Provides magic link login for superadmin users.
 * Implements: R22 §2.1 (Magic Link auth), GAP-T7-002 (Magic Link vs MFA — deferred).
 * Wiring Layer: Layer 2 (Auth) → Layer 7 (UI)
 *
 * WHY magic link for admin:
 * R22 §2.1 specifies magic link as the auth method. GAP-T7-002 logs the
 * open question about whether admin should use higher-friction auth (email/password + MFA).
 * PO approved proceeding with magic links for the skeleton.
 *
 * Security note:
 * This page is the only admin route rendered outside the AuthGuard/AdminLayout.
 * After successful auth, the user is redirected to /dashboard where AuthGuard
 * checks for superadmin role.
 */

import { useState } from 'react';
import { useAuthStore } from '../stores/auth.js';

export function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInWithMagicLink = useAuthStore((s) => s.signInWithMagicLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VIYO HQ</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Admin Portal — Superadmin Access Only
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 inline-flex dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Check your email</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@viyo.new"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Send Magic Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
