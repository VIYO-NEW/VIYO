/**
 * Sidebar — Collapsible Admin Navigation
 *
 * Renders grouped navigation items from the centralized config.
 * Implements: R17 §10.1–10.6 (nav groups), Doc9 Part 10 (collapsible sidebar).
 * Wiring Layer: Layer 7 (UI Components)
 *
 * WHY grouped navigation:
 * R17 §10 defines 6 distinct functional sections for the admin portal.
 * Grouping nav items by section helps superadmins find tools quickly
 * and mirrors the spec structure for traceability.
 *
 * Responsive behavior:
 * - >= 1024px (lg): Sidebar visible, collapsible to icon-only mode
 * - < 1024px: Sidebar hidden, toggled via hamburger in TopBar
 * Minimum supported viewport: 768px (tablet). No mobile layout for admin.
 */

import { Link, useLocation } from '@tanstack/react-router';
import { ADMIN_NAV_ITEMS, NAV_GROUP_LABELS } from '../../config/navigation.js';
import type { AdminNavGroup } from '@viyo/shared';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile overlay mode — shown/hidden via TopBar hamburger */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  // Group nav items by their R17 section group
  const groups = ADMIN_NAV_ITEMS.reduce<Record<string, typeof ADMIN_NAV_ITEMS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  // Ordered group keys to match R17 §10 section order
  const groupOrder: AdminNavGroup[] = [
    'Overview',
    'Intelligence',
    'Infrastructure',
    'Business',
    'ContentOps',
    'Performance',
    'BrandIntelligence',
  ];

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {groupOrder.map((groupKey) => {
        const items = groups[groupKey];
        if (!items || items.length === 0) return null;

        return (
          <div key={groupKey} className="mb-2">
            {/* Group heading — hidden when sidebar is collapsed */}
            {!collapsed && (
              <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {NAV_GROUP_LABELS[groupKey]}
              </h3>
            )}
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  } ${item.status === 'placeholder' ? 'opacity-50' : ''}`}
                  title={item.status === 'placeholder' ? `${item.label} (coming soon)` : item.label}
                >
                  {/* Icon placeholder — uses the icon name as text when collapsed */}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">
                    {item.icon.charAt(0)}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.status === 'placeholder' && (
                    <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950 ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo / brand area */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 dark:text-white">VIYO HQ</span>
          )}
          <button
            onClick={onToggle}
            className="hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Scrollable navigation */}
        <div className="flex-1 overflow-y-auto">{navContent}</div>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {!collapsed && (
            <p className="text-xs text-gray-400 dark:text-gray-500">VIYO Admin v0.1.0</p>
          )}
        </div>
      </aside>
    </>
  );
}
