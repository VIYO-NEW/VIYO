/**
 * Router — TanStack Router Configuration for Admin Portal (Code-split)
 *
 * All 12 page components are lazy-loaded via dynamic import().
 * Only the AdminLayout shell (sidebar + topbar) is in the initial bundle.
 * Each page loads on navigation, reducing the initial chunk size.
 *
 * Implements: Doc9 Part 10 (admin routing), PO corrections (PendingComponent,
 *             ErrorComponent), PO bundle size directive (code-splitting).
 * Wiring Layer: Layer 7 (UI) → Layer 2 (Auth via AuthGuard in AdminLayout)
 *
 * Route structure:
 * /login               → Login page (outside AdminLayout, no AuthGuard)
 * /                    → Redirect to /dashboard
 * /dashboard           → Dashboard (inside AdminLayout + AuthGuard)
 * /brands              → BrandsList
 * /users               → UserManagement
 * /learning-engine     → LearningEngine
 * /council-of-brains   → CouncilOfBrains
 * /system-health       → SystemHealth
 * /security            → SecurityDashboard
 * /cost-reconciliation → CostReconciliation
 * /content-ops         → ContentOps (placeholder)
 * /performance         → Performance (placeholder)
 * /brand-intelligence  → BrandIntelligence (placeholder)
 *
 * 404 handling:
 * The rootRoute has a notFoundComponent that renders a generic 404 page.
 * This catches any URL that doesn't match a defined route.
 *
 * AuthGuard placement:
 * AuthGuard wraps AdminLayout (layout-level), so ALL authenticated routes
 * are protected. Login is the only route outside the layout.
 */

import { lazy, Suspense } from 'react';
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from '@tanstack/react-router';
import { AdminLayout } from './components/layout/AdminLayout.js';

// --- Lazy-loaded page components (code-split) ---
const Login = lazy(() => import('./pages/Login.js').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard.js').then((m) => ({ default: m.Dashboard })));
const BrandsList = lazy(() => import('./pages/BrandsList.js').then((m) => ({ default: m.BrandsList })));
const UserManagement = lazy(() => import('./pages/UserManagement.js').then((m) => ({ default: m.UserManagement })));
const LearningEngine = lazy(() => import('./pages/LearningEngine.js').then((m) => ({ default: m.LearningEngine })));
const CouncilOfBrains = lazy(() => import('./pages/CouncilOfBrains.js').then((m) => ({ default: m.CouncilOfBrains })));
const SystemHealth = lazy(() => import('./pages/SystemHealth.js').then((m) => ({ default: m.SystemHealth })));
const SecurityDashboard = lazy(() => import('./pages/SecurityDashboard.js').then((m) => ({ default: m.SecurityDashboard })));
const CostReconciliation = lazy(() => import('./pages/CostReconciliation.js').then((m) => ({ default: m.CostReconciliation })));
const ContentOps = lazy(() => import('./pages/ContentOps.js').then((m) => ({ default: m.ContentOps })));
const Performance = lazy(() => import('./pages/Performance.js').then((m) => ({ default: m.Performance })));
const BrandIntelligence = lazy(() => import('./pages/BrandIntelligence.js').then((m) => ({ default: m.BrandIntelligence })));

/**
 * Global PendingComponent — shown during route transitions and lazy loads.
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

/**
 * 404 Not Found component — catch-all for unmatched routes.
 */
function NotFound() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-4xl font-bold text-gray-300 dark:text-gray-700">404</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Page not found</p>
        <a href="/dashboard" className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

/**
 * Suspense wrapper for lazy-loaded page components.
 * TanStack Router's pendingComponent handles route-level loading,
 * but React.lazy needs Suspense for the component-level fallback.
 */
function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<RouterPending />}>
      <Component />
    </Suspense>
  );
}

// --- Root route (no layout — login renders here) ---
const rootRoute = createRootRoute({
  pendingComponent: RouterPending,
  errorComponent: RouterError,
  notFoundComponent: NotFound,
});

// --- Login route (outside AdminLayout) ---
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <LazyPage Component={Login} />,
});

// --- Layout route (AdminLayout wraps all authenticated routes) ---
// AuthGuard is inside AdminLayout — wraps ALL children.
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

// --- Authenticated page routes (all lazy-loaded) ---
const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: () => <LazyPage Component={Dashboard} />,
});

const brandsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brands',
  component: () => <LazyPage Component={BrandsList} />,
});

const usersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/users',
  component: () => <LazyPage Component={UserManagement} />,
});

const learningEngineRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/learning-engine',
  component: () => <LazyPage Component={LearningEngine} />,
});

const councilRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/council-of-brains',
  component: () => <LazyPage Component={CouncilOfBrains} />,
});

const systemHealthRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/system-health',
  component: () => <LazyPage Component={SystemHealth} />,
});

const securityRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/security',
  component: () => <LazyPage Component={SecurityDashboard} />,
});

const costRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cost-reconciliation',
  component: () => <LazyPage Component={CostReconciliation} />,
});

const contentOpsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/content-ops',
  component: () => <LazyPage Component={ContentOps} />,
});

const performanceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/performance',
  component: () => <LazyPage Component={Performance} />,
});

const brandIntelligenceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brand-intelligence',
  component: () => <LazyPage Component={BrandIntelligence} />,
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
