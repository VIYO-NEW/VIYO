/**
 * Admin Sidebar Navigation Configuration
 *
 * Maps R17 §10.1–10.6 sections to sidebar navigation groups and pages.
 * Wiring Layer: Layer 7 (UI Components) — consumed by Sidebar.tsx
 *
 * WHY this is a separate config file:
 * Centralizes the nav structure so that adding new admin pages only requires
 * editing this file and creating the page component. The Sidebar component
 * reads this config and renders groups/items dynamically.
 *
 * Group mapping to R17 sections:
 * - Overview → Dashboard (standard admin pattern, not in R17)
 * - Intelligence → §10.1 (R24, R19, R25)
 * - Infrastructure → §10.2 (R21, R22, R29)
 * - Business → §10.3 (R23)
 * - ContentOps → §10.4 (R27, R28, R30, R31)
 * - Performance → §10.5
 * - BrandIntelligence → §10.6
 */

import type { AdminNavItem } from '@viyo/shared';

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  // --- Overview (standard admin pattern) ---
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    group: 'Overview',
    status: 'active',
  },
  {
    path: '/brands',
    label: 'Brands',
    icon: 'Building2',
    group: 'Overview',
    status: 'active',
  },
  {
    path: '/users',
    label: 'User Management',
    icon: 'Users',
    group: 'Overview',
    status: 'active',
  },

  // --- Intelligence Layer (R17 §10.1) ---
  {
    path: '/learning-engine',
    label: 'Learning Engine',
    icon: 'Brain',
    group: 'Intelligence',
    status: 'active',
  },
  {
    path: '/council-of-brains',
    label: 'Council of Brains',
    icon: 'Cpu',
    group: 'Intelligence',
    status: 'active',
  },

  // --- Infrastructure Layer (R17 §10.2) ---
  {
    path: '/system-health',
    label: 'System Health',
    icon: 'Activity',
    group: 'Infrastructure',
    status: 'active',
  },
  {
    path: '/security',
    label: 'Security Dashboard',
    icon: 'Shield',
    group: 'Infrastructure',
    status: 'active',
  },

  // --- Business Layer (R17 §10.3) ---
  {
    path: '/cost-reconciliation',
    label: 'Cost Reconciliation',
    icon: 'DollarSign',
    group: 'Business',
    status: 'active',
  },

  // --- Content Operations (R17 §10.4) — placeholder for future task ---
  {
    path: '/content-ops',
    label: 'Content Operations',
    icon: 'FileText',
    group: 'ContentOps',
    status: 'placeholder',
  },

  // --- Performance & Scoring (R17 §10.5) — placeholder for future task ---
  {
    path: '/performance',
    label: 'Performance & Scoring',
    icon: 'BarChart3',
    group: 'Performance',
    status: 'placeholder',
  },

  // --- Brand Intelligence (R17 §10.6) — placeholder for future task ---
  {
    path: '/brand-intelligence',
    label: 'Brand Intelligence',
    icon: 'Sparkles',
    group: 'BrandIntelligence',
    status: 'placeholder',
  },
];

/**
 * Display labels for sidebar group headings.
 * Keys match the AdminNavGroup type from @viyo/shared.
 */
export const NAV_GROUP_LABELS: Record<string, string> = {
  Overview: 'Overview',
  Intelligence: 'Intelligence Layer',
  Infrastructure: 'Infrastructure',
  Business: 'Business',
  ContentOps: 'Content Operations',
  Performance: 'Performance & Scoring',
  BrandIntelligence: 'Brand Intelligence',
};
