/**
 * AuthGuard — Superadmin Access Control
 *
 * Wraps all admin routes to enforce superadmin-only access.
 * Implements: R17 §10 ("restricted to users with the superadmin role"),
 *             R22 (Supabase Auth).
 * Wiring Layer: Layer 2 (Auth) → Layer 7 (UI)
 *
 * WHY client-side guard:
 * This is a UI-level gate that prevents non-superadmin users from seeing
 * admin pages. It is NOT a security boundary — all privileged data access
 * goes through Worker /api/admin/* routes that re-validate the JWT server-side.
 * The SPA uses the anon key only (no service-role key in the browser).
 *
 * HOW superadmin is checked:
 * Reads user_metadata.role from the Supabase JWT. This is set during user
 * creation or via the Supabase admin API. See GAP-T7-001 in open-questions.md
 * for the formal role definition gap.
 */

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../../stores/auth.js';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Loading spinner shown while auth state initializes.
 * Prevents flash of login page on page refresh when session exists.
 */
function AuthLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Access denied screen for authenticated users without superadmin role.
 * Provides a sign-out action so the user can switch accounts.
 */
function AccessDenied() {
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          This portal is restricted to superadmin users. If you believe this is
          an error, contact your system administrator.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Still loading auth state — show spinner
  if (loading || !initialized) {
    return <AuthLoading />;
  }

  // Not authenticated — the router will redirect to /login
  if (!session || !user) {
    return null;
  }

  // Authenticated but not superadmin — show access denied
  const role = user.user_metadata?.role;
  if (role !== 'superadmin') {
    return <AccessDenied />;
  }

  // Superadmin — render admin content
  return <>{children}</>;
}
