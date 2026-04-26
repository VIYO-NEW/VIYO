/**
 * AdminLayout — Root Layout Shell for the Admin Portal
 *
 * Composes Sidebar + TopBar + content area into the admin page structure.
 * Implements: Doc9 Part 10 (admin layout with collapsible sidebar).
 * Wiring Layer: Layer 7 (UI Components)
 *
 * WHY this is a layout component and not in App.tsx:
 * TanStack Router uses layout routes. This component is rendered by the
 * root layout route and wraps all authenticated admin pages. The Login page
 * renders outside this layout (no sidebar/topbar on login).
 *
 * Responsive breakpoints:
 * - >= 1024px (lg): Sidebar visible, collapsible. Content shifts.
 * - 768px–1023px: Sidebar hidden, hamburger toggle, overlay mode.
 * - < 768px: Not officially supported for admin (tablet minimum).
 */

import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { AuthGuard } from '../auth/AuthGuard.js';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Main content area — offset by sidebar width and topbar height */}
        <main
          className={`pt-16 transition-all ${
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
