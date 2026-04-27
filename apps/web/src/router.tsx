/**
 * Implements the T15-ROUTER TanStack Router foundation for the VIYO web app.
 * This file maps the Phase 0 public web surface and the brand-scoped Studio route boundary defined by the approved T15 architecture and wiring blueprint.
 * Wiring layer: Layer 6 Frontend UI, Layer 7 State/Navigation, Layer 12 Observability through App-level Sentry wrapping.
 */
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import type { Workspace } from '@viyo/shared';

function RootRouteComponent() {
  return <Outlet />;
}

function RoutePendingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-8" role="status" aria-live="polite">
      <p className="text-sm font-medium text-gray-500">Loading VIYO…</p>
    </div>
  );
}

function RouteErrorComponent({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'An unexpected route error occurred';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold text-red-600">Route failed to load</h1>
      <p className="mb-6 max-w-xl text-gray-600">{message}</p>
      <Link
        to="/"
        className="rounded bg-viyo-700 px-4 py-2 text-sm font-medium text-white hover:bg-viyo-800"
      >
        Return to VIYO Home
      </Link>
    </div>
  );
}

function RouteNotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-viyo-700">404</p>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mb-6 max-w-xl text-gray-600">
        The requested VIYO page does not exist or has not been wired into the application route tree.
      </p>
      <Link
        to="/"
        className="rounded bg-viyo-700 px-4 py-2 text-sm font-medium text-white hover:bg-viyo-800"
      >
        Return to VIYO Home
      </Link>
    </div>
  );
}

function HomeRouteComponent() {
  // Type validation: ensure cross-package import works at build time.
  void (0 as unknown as Workspace);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <h1 className="mb-4 text-4xl font-bold text-viyo-700">VIYO</h1>
      <p className="mb-6 text-lg text-gray-600">AI-Powered Email Marketing Platform</p>
      <p className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500">
        Phase 0 Scaffold — app.viyo.new
      </p>
    </div>
  );
}

function BrandStudioRouteComponent() {
  const { brandId } = brandStudioRoute.useParams();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-8 text-center">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-viyo-700">Brand Studio Route Boundary</p>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Studio routing is ready for brand-scoped wiring</h1>
        <p className="mb-6 text-gray-600">
          This route boundary recognizes the brand context and is reserved for the wired Sprint 2 Studio modules.
          It does not load brand data, generation tools, editing tools, prompt libraries, or collaboration surfaces yet.
        </p>
        <dl className="mx-auto grid max-w-md grid-cols-1 gap-3 text-left">
          <div className="rounded-lg bg-gray-50 p-4">
            <dt className="text-sm font-medium text-gray-500">Brand route parameter</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{brandId}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootRouteComponent,
  pendingComponent: RoutePendingComponent,
  errorComponent: RouteErrorComponent,
  notFoundComponent: RouteNotFoundComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRouteComponent,
});

const brandStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brand/$brandId/studio',
  component: BrandStudioRouteComponent,
});

const routeTree = rootRoute.addChildren([indexRoute, brandStudioRoute]);

// Exported router instance consumed by the web application root and TanStack Router type registration.
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: RoutePendingComponent,
  defaultErrorComponent: RouteErrorComponent,
  defaultNotFoundComponent: RouteNotFoundComponent,
});

export type AppRouter = typeof router;

// Provides the configured TanStack Router to the React tree under the Sentry boundary.
export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
