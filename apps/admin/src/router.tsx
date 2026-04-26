/**
 * Router — TanStack Router Configuration for Admin Portal
 *
 * Defines all admin routes with the AdminLayout as root layout.
 * Implements: Doc9 Part 10 (admin routing), PO corrections (PendingComponent, ErrorComponent).
 * Wiring Layer: Layer 7 (UI) → Layer 2 (Auth via AuthGuard in AdminLayout)
 *
 * WHY TanStack Router:
 * The admin app scaffold uses TanStack Router (already installed).
 * It provides type-safe routing, built-in pending/error states, and
 * code-splitting support via lazy routes.
 *
 * Route structure:
 * /login          → Login page (outside AdminLayout, no AuthGuard)
 * /               → Redirect to /dashboard
 * /dashboard      → Dashboard (inside AdminLayout + AuthGuard)
 * /brands         → BrandsList
 * /users          → UserManagement
 * /learning-engine → LearningEngine
 * /council-of-brains → CouncilOfBrains
 * /system-health  → SystemHealth
 * /security       → SecurityDashboard
 * /cost-reconciliation → CostReconciliation
 * /content-ops    → ContentOps (placeholder)
 * /performance    → Performance (placeholder)
 * /brand-intelligence → BrandIntelligence (placeholder)
 */

import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from '@tanstack/react-router';
import { AdminLayout } from './components/layout/AdminLayout.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { BrandsList } from './pages/BrandsList.js';
import { UserManagement } from './pages/UserManagement.js';
import { LearningEngine } from './pages/LearningEngine.js';
import { CouncilOfBrains } from './pages/CouncilOfBrains.js';
import { SystemHealth } from './pages/SystemHealth.js';
import { SecurityDashboard } from './pages/SecurityDashboard.js';
import { CostReconciliation } from './pages/CostReconciliation.js';
import { ContentOps } from './pages/ContentOps.js';
import { Performance } from './pages/Performance.js';
import { BrandIntelligence } from './pages/BrandIntelligence.js';

/**
 * Global PendingComponent — shown during route transitions.
 * PO required this in Phase 1 review (item #2).
 */
function RouterPending() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Global ErrorComponent — shown when a route throws an unhandled error.
 * PO required this in Phase 1 review (item #2).
 * This is the route-level fallback; Sentry.ErrorBoundary (in App.tsx) is the top-level fallback.
 */
function RouterError({ error }: { error: Error }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
    </div>
  );
}

// --- Root route (no layout — login renders here) ---
const rootRoute = createRootRoute({
  pendingComponent: RouterPending,
  errorComponent: RouterError,
});

// --- Login route (outside AdminLayout) ---
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

// --- Layout route (AdminLayout wraps all authenticated routes) ---
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: AdminLayout,
});

// --- Index redirect: / → /dashboard ---
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
});

// --- Authenticated page routes ---
const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: Dashboard,
});

const brandsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brands',
  component: BrandsList,
});

const usersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/users',
  component: UserManagement,
});

const learningEngineRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/learning-engine',
  component: LearningEngine,
});

const councilRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/council-of-brains',
  component: CouncilOfBrains,
});

const systemHealthRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/system-health',
  component: SystemHealth,
});

const securityRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/security',
  component: SecurityDashboard,
});

const costRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cost-reconciliation',
  component: CostReconciliation,
});

const contentOpsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/content-ops',
  component: ContentOps,
});

const performanceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/performance',
  component: Performance,
});

const brandIntelligenceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brand-intelligence',
  component: BrandIntelligence,
});

// --- Build route tree ---
const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    dashboardRoute,
    brandsRoute,
    usersRoute,
    learningEngineRoute,
    councilRoute,
    systemHealthRoute,
    securityRoute,
    costRoute,
    contentOpsRoute,
    performanceRoute,
    brandIntelligenceRoute,
  ]),
]);

// --- Create and export router ---
export const router = createRouter({
  routeTree,
  defaultPendingComponent: RouterPending,
  defaultErrorComponent: RouterError,
});

// --- Type registration for type-safe navigation ---
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
