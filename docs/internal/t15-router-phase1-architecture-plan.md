# T15-ROUTER Phase 1 Architecture Plan

**Task:** T15 — Install TanStack Router in Web App  
**Feature ID:** T15-ROUTER  
**Protocol Phase:** VIYO Development Protocol v2 — Phase 1 Architecture Plan  
**Status:** Awaiting Product Owner approval before code changes  
**Prepared:** 2026-04-27  

## 0. Authority and Scope

This architecture plan follows the approved Sprint 2 execution baseline and starts with **T15-ROUTER** because it has no dependencies and unblocks the studio, collaboration, webhook, and integration-test tasks that follow. The highest applicable source is `docs/foundation/VIYO_ARCHITECTURE_LOCK_V3.md`, which fixes the frontend stack as **Vite React SPA + TypeScript + Tailwind CSS + TanStack Router + Zustand** and requires all data to remain scoped to workspaces and brands. The route design also follows `docs/foundation/VIYO_Final_Doc9_Frontend_Architecture.md` for public/auth page architecture and the existing admin app TanStack Router implementation in `apps/admin/src/router.tsx` as the closest in-repository precedent.

The implementation will **not expose unwired UI**. T15 creates the routing foundation and the brand-scoped `/brand/:brandId/studio` route boundary required by later tasks, but it will not add navigation links, studio mode pickers, editing tools, generation controls, prompt libraries, or any route-surface affordance for features whose backend and UI are not yet wired.

| Constraint | Architectural Response |
|---|---|
| Use TanStack Router in the web SPA | Add a web router instance and mount `RouterProvider` through the existing Sentry-wrapped `App` root. |
| Preserve existing visible web behavior | Keep `/` rendering the current VIYO scaffold/landing surface rather than introducing new unfinished screens. |
| Add `/brand/:brandId/studio` route | Define the route boundary and typed param extraction, but do not link to it from visible UI yet. |
| Brand-scoped route requirements | Validate and expose `brandId` through the route component context/params so T24+ can consume it. |
| No unwired UI placeholders | Render only a controlled route-foundation surface for direct URL access, with no studio tools, modes, or fake actions. |
| Existing admin precedent | Mirror admin router patterns: explicit `createRootRoute`, `createRoute`, pending/error/not-found components, and lazy-friendly structure where appropriate. |

## 1. Component Inventory

| # | Component | Type | Path | Purpose | New/Modified |
|---|---|---|---|---|---|
| 1 | Web Router Configuration | TypeScript/React module | `apps/web/src/router.tsx` | Create the TanStack Router tree for the web app, including root, index, and brand-scoped studio route boundary. | New |
| 2 | Router Pending Component | React component inside router module | `apps/web/src/router.tsx` | Provide deterministic route-level loading feedback consistent with admin router precedent. | New |
| 3 | Router Error Component | React component inside router module | `apps/web/src/router.tsx` | Provide route-level error fallback without generic silent failure. | New |
| 4 | Router Not Found Component | React component inside router module | `apps/web/src/router.tsx` | Provide a controlled 404 surface for unmatched web routes. | New |
| 5 | Index/Home Route Component | React component inside router module or extracted only if needed | `apps/web/src/router.tsx` | Preserve the current root page content from `App.tsx` so `/` does not regress. | New via router extraction |
| 6 | Brand Studio Route Boundary | React component inside router module | `apps/web/src/router.tsx` | Accept and expose `brandId` for later T24/T26/T33 use without exposing unwired studio tools. | New |
| 7 | Web App Root | React component | `apps/web/src/App.tsx` | Keep Sentry error boundary and replace hard-coded page content with `RouterProvider`. | Modified |
| 8 | Web Entry Point | React bootstrap | `apps/web/src/main.tsx` | Retain Sentry-first import, StrictMode, CSS import, and root mounting; no routing logic will be placed here unless TypeScript requires a provider import shift. | No planned change |
| 9 | Type Registration | TypeScript declaration inside router module | `apps/web/src/router.tsx` | Register the router type with TanStack Router for typed params and route APIs. | New |

## 2. Data Flow

```text
Browser requests / → Vite SPA bootstraps main.tsx → App mounts Sentry.ErrorBoundary → RouterProvider resolves index route → Home route renders current VIYO scaffold surface.
```

```text
Browser requests /brand/:brandId/studio directly → Vite SPA bootstraps main.tsx → App mounts Sentry.ErrorBoundary → RouterProvider matches brand studio route → route validates/extracts brandId → route boundary exposes brandId for future studio implementation without rendering unwired studio tools.
```

```text
User navigates to an unmatched URL → RouterProvider fails route match → root notFoundComponent renders controlled 404 → user can return to / without relying on broken browser state.
```

```text
Route component throws during render/load → TanStack Router errorComponent handles route-level failure → Sentry.ErrorBoundary remains the outer capture layer → user receives deterministic error UI and Sentry still records the exception.
```

No database writes, external API calls, Supabase mutations, billing calls, or backend Worker routes are introduced by T15. The only data crossing the new routing boundary is the URL path parameter `brandId`.

## 3. Dependency Map

| Component | Depends On | Type | Notes |
|---|---|---|---|
| `apps/web/src/router.tsx` | `@tanstack/react-router` | npm dependency | Already present in `apps/web/package.json` as `^1.92.0`; no package installation expected. |
| `apps/web/src/router.tsx` | React | npm dependency | Existing React 18 dependency. |
| `apps/web/src/router.tsx` | Current App scaffold content | internal UI | The current visible `/` content will move behind the index route to prevent visible regression. |
| `apps/web/src/App.tsx` | `@tanstack/react-router` | npm dependency | Uses `RouterProvider`. |
| `apps/web/src/App.tsx` | `@sentry/react` | npm dependency | Existing outer error boundary remains in place. |
| `apps/web/src/App.tsx` | `@viyo/shared` / `@viyo/ui` | workspace dependencies | Current `Workspace` compile-time validation and `Button` usage remain associated with the preserved home/index surface. |
| T24 Image Studio Layout | T15 Brand Studio Route Boundary | future internal dependency | T24 will replace/extend the direct route boundary with the real three-zone Studio layout. |
| T26 Generation Frontend | T15 Brand Param Propagation | future internal dependency | T26 will consume `brandId` when calling generation endpoints. |
| T33 Brand Chat Panel | T15 Brand Param Propagation | future internal dependency | T33 will rely on brand-scoped route context. |

## 4. Technology Decisions

**Decision:** Use a manual TanStack Router tree in `apps/web/src/router.tsx`.  
**Context:** The admin app already uses explicit `createRootRoute`, `createRoute`, and `createRouter`, and T15 requires a router instance.  
**Options Considered:** File-based route generation, a custom route state switch, or manual route tree.  
**Chosen:** Manual route tree, because it matches the current admin precedent, avoids adding route-generation tooling, and minimizes Sprint 2 risk.  
**Consequences:** Route additions remain explicit and easy to review. If VIYO later standardizes on file-based routing, this module can be migrated after Sprint 2.

**Decision:** Preserve the current Sentry-wrapped `App` root and mount `RouterProvider` inside it.  
**Context:** `App.tsx` currently owns the Sentry error boundary from T12. T15 should not weaken error capture.  
**Options Considered:** Move the router provider to `main.tsx`, remove `App.tsx`, or keep `App.tsx` as the root shell.  
**Chosen:** Keep `App.tsx` and place `RouterProvider` inside `Sentry.ErrorBoundary`.  
**Consequences:** Sentry continues to capture unhandled React errors while TanStack Router handles route-level pending/error/not-found states.

**Decision:** Define `/brand/:brandId/studio` now but do not link to it from public UI.  
**Context:** T15 requires the route and param propagation, while the PO explicitly prohibited UI placeholders for unwired features.  
**Options Considered:** Omit the route until T24, expose a placeholder Studio page, or define a hidden/direct-access route boundary.  
**Chosen:** Define the route boundary for direct URL validation and future wiring, but expose no navigation link, no modes, no tools, no fake generation UI, and no library/editing surfaces.  
**Consequences:** T15 can be tested and downstream tasks can depend on a stable path, without making unfinished capabilities visible in the product navigation.

**Decision:** Keep T15 frontend-only.  
**Context:** The route foundation does not need a database schema, backend endpoint, or Supabase query.  
**Options Considered:** Add brand existence validation now, defer validation, or call a backend brand lookup.  
**Chosen:** Defer brand existence authorization/lookup to T24+ and backend-backed surfaces.  
**Consequences:** T15 remains dependency-free as approved. Later tasks must add server-validated brand/workspace access before any sensitive brand data appears.

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Visible home page regression after replacing hard-coded `App` content | Medium | Medium | Move current scaffold surface into the index route and verify `/` in browser. |
| Exposing unwired Image Studio UI too early | Medium | High | Do not add nav links, mode pickers, generation controls, editing tools, prompt library UI, or fake actions in T15. |
| Route path syntax mismatch with TanStack Router version | Low | Medium | Use the same `@tanstack/react-router` APIs already present in the admin app and validate with type-check/build. |
| Sentry error boundary accidentally bypassed | Low | High | Keep `App.tsx` as the root wrapper and mount `RouterProvider` inside `Sentry.ErrorBoundary`. |
| Brand param not accessible to future components | Medium | High | Implement route component using TanStack `useParams` or route API so `brandId` is explicitly read and testable. |
| Auth and brand authorization expectations become confused | Medium | High | Document that T15 is a route foundation only; sensitive brand data remains absent until backend/RLS-validated tasks wire real surfaces. |
| Creating a route-boundary message that reads as a placeholder feature | Medium | Medium | Keep direct-access content minimal and operational: identify that the route is intentionally disabled until its dependent tasks are wired, with no CTA or tool affordances. |

## 6. Validation Plan

| Validation | Command or Method | Expected Result |
|---|---|---|
| Static type validation | `pnpm --filter @viyo/web type-check` | Web app compiles with router types and no TypeScript errors. |
| Web build validation | `pnpm --filter @viyo/web build` | Vite production build succeeds. |
| Lint validation | `pnpm --filter @viyo/web lint` | No lint errors introduced by router files. |
| Runtime home route validation | Start web dev server and visit `/` | Existing VIYO scaffold/home surface renders without crash. |
| Runtime studio route validation | Visit `/brand/test-brand/studio` | Route resolves without crash and the component reads `brandId = test-brand`; no studio tools or unwired actions are exposed. |
| Runtime 404 validation | Visit an unmatched route | Controlled not-found UI renders and provides a route back to `/`. |

## 7. Product Owner Approval Request

Please approve or revise this Phase 1 architecture plan before implementation begins. If approved, the next protocol step is the Phase 2 thirteen-layer wiring blueprint for T15, followed by its required approval gate before any code is changed.
