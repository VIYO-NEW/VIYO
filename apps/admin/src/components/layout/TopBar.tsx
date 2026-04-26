/**
 * TopBar — Admin Portal Header Bar
 *
 * Displays breadcrumbs, theme toggle, user info, and mobile hamburger.
 * Implements: Doc9 Part 10 (top bar with user info and logout).
 * Wiring Layer: Layer 7 (UI Components)
 *
 * WHY breadcrumbs:
 * The admin portal has nested sections (R17 §10.1–10.6). Breadcrumbs
 * provide orientation within the hierarchy and match Doc9's spec.
 */

import { useLocation } from '@tanstack/react-router';
import { ThemeToggle } from './ThemeToggle.js';
import { useAuthStore } from '../../stores/auth.js';
import { ADMIN_NAV_ITEMS } from '../../config/navigation.js';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function TopBar({ sidebarCollapsed, onMobileMenuToggle }: TopBarProps) {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  // Derive current page label from nav config
  const currentPage = ADMIN_NAV_ITEMS.find((item) => item.path === location.pathname);
  const pageLabel = currentPage?.label ?? 'Admin';

  return (
    <header
      className={`fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm transition-all dark:border-gray-800 dark:bg-gray-950/80 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      } max-lg:left-0`}
    >
      {/* Left: hamburger (mobile) + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb trail */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <span className="text-gray-400 dark:text-gray-500">VIYO HQ</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-medium text-gray-900 dark:text-white">{pageLabel}</span>
        </nav>
      </div>

      {/* Right: theme toggle + user info + sign out */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {user?.email ?? 'Unknown'}
          </span>
        </div>

        <button
          onClick={() => signOut()}
          className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
