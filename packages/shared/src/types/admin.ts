/**
 * Admin Portal Shared Types
 *
 * Defines type contracts for the VIYO admin portal (VIYO HQ).
 * Implements: R17 §10 (Admin Architecture), Doc9 Part 10 (Admin Portal)
 * Wiring Layer: Layer 3 (Shared Types & Contracts)
 *
 * These types are consumed by apps/admin for UI rendering and will be
 * consumed by apps/worker for /api/admin/* route validation in a future task.
 */

/** Navigation item for the admin sidebar. Maps to R17 §10.1–10.6 sections. */
export interface AdminNavItem {
  /** Unique route path (e.g., '/dashboard') */
  path: string;
  /** Display label in sidebar */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** R17 section group this item belongs to */
  group: AdminNavGroup;
  /** Whether this page has a real implementation or is a placeholder */
  status: 'active' | 'placeholder';
}

/**
 * Sidebar navigation groups mapped directly to R17 §10 sections.
 *
 * WHY: Each group corresponds to a specific R17 subsection to ensure
 * the admin portal structure matches the spec exactly.
 * - Intelligence → §10.1 (R24, R19, R25)
 * - Infrastructure → §10.2 (R21, R22, R29)
 * - Business → §10.3 (R23)
 * - ContentOps → §10.4 (R27, R28, R30, R31)
 * - Performance → §10.5
 * - BrandIntelligence → §10.6
 */
export type AdminNavGroup =
  | 'Overview'
  | 'Intelligence'
  | 'Infrastructure'
  | 'Business'
  | 'ContentOps'
  | 'Performance'
  | 'BrandIntelligence';

/** Admin route configuration for TanStack Router. */
export interface AdminRoute {
  /** Route path */
  path: string;
  /** Page component name */
  component: string;
  /** Whether the route requires superadmin auth */
  requiresAuth: boolean;
  /** R17 section reference */
  specRef: string;
}

/**
 * Theme preference for the platform-wide theme system.
 *
 * WHY: PO override (2026-04-25) mandates three-state theme across all VIYO apps.
 * Supersedes Doc9 "distinct dark-mode shell" language.
 * See: Arch Lock V3 §6, Doc9 V2 Part 10, R17 V2 §10.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

/** Mock data shape for the admin dashboard overview. */
export interface AdminDashboardMetrics {
  totalUsers: number;
  mrr: number;
  totalCampaigns: number;
  apiErrorRate: number;
}

/** Mock data shape for the brands list. */
export interface AdminBrandEntry {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  campaignCount: number;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial';
}

/** Mock data shape for user management. */
export interface AdminUserEntry {
  id: string;
  email: string;
  name: string;
  brandName: string;
  role: string;
  lastLogin: string;
  status: 'active' | 'suspended';
}
