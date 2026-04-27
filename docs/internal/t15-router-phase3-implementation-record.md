# T15-ROUTER Phase 3 Implementation Record

**Task:** T15 — Install TanStack Router in Web App  
**Feature ID:** T15-ROUTER  
**Protocol Phase:** VIYO Development Protocol v2 — Phase 3 Foundational Implementation  
**Status:** Implementation complete; formal Phase 4 review pending  
**Prepared:** 2026-04-27

## 1. Approval Inputs

Product Owner approved Phase 1 with `APPROVED PHASE 1` and approved Phase 2 with `APPROVED PHASE 2`. Implementation began only after both approval gates were satisfied. The Product Owner also reaffirmed the Sprint 2 execution constraint: **no UI placeholders for unwired features, and no exposed mode or tool unless connected to backend wiring**.

## 2. Implementation Sequence

| Step | File | Action | Result |
|---|---|---|---|
| 1 | `apps/web/src/router.tsx` | Created the manual TanStack Router module first, per approved sequence. | Added root route, index route, brand-scoped studio route boundary, route pending/error/not-found surfaces, router instance, provider export, and TanStack type registration. |
| 2 | `apps/web/src/App.tsx` | Updated the existing web root second. | Preserved `Sentry.ErrorBoundary` as the outer app boundary and mounted `AppRouterProvider` inside it. |
| 3 | `apps/web/src/router.tsx` | Corrected preserved home scaffold action surface. | Removed the inherited `Get Started` button because it was an unwired CTA. Replaced it with non-interactive scaffold status text to satisfy the Product Owner’s no-fake-actions rule. |

## 3. Route Tree Implemented

| Route | Component | Purpose | UI Exposure |
|---|---|---|---|
| `/` | `HomeRouteComponent` | Preserves the public VIYO scaffold landing surface under TanStack Router. | Visible, but no unwired CTA remains. |
| `/brand/$brandId/studio` | `BrandStudioRouteComponent` | Establishes the brand-scoped Studio route boundary and reads `brandId` through TanStack route params. | Direct URL only; no nav link, no tool picker, no generation control, no editing tools, no prompt library. |
| unmatched | `RouteNotFoundComponent` | Provides deterministic 404 behavior under the router. | Includes only a safe return link to `/`. |

## 4. Constraint Compliance

| Constraint | Implementation Evidence |
|---|---|
| TanStack Router foundation | `createRootRoute`, `createRoute`, `createRouter`, and `RouterProvider` are used in `apps/web/src/router.tsx`. |
| Sentry preserved | `AppRouterProvider` is mounted inside the existing `Sentry.ErrorBoundary` in `apps/web/src/App.tsx`. |
| Brand param propagation | `/brand/$brandId/studio` calls `brandStudioRoute.useParams()` and renders the direct URL parameter for validation only. |
| No backend changes | No database, Supabase, Worker, billing, or API files were modified. |
| No unwired UI | The route tree exposes no Studio navigation, no mode picker, no prompt library, no editing tool, no generation button, and no fake home CTA. |
| Lockfile consistency | Dependency inspection showed `@tanstack/react-router` is already present in `apps/web/package.json`; frozen install was used and no version changes were made. |

## 5. Validation Evidence Completed During Phase 3

| Validation | Result | Evidence File |
|---|---|---|
| Frozen dependency install | Passed; no lockfile changes required. | `/home/ubuntu/viyo_t15_validation/pnpm_install.stdout`, `/home/ubuntu/viyo_t15_validation/pnpm_install.stderr` |
| Type-check after final CTA correction | Passed. | `/home/ubuntu/viyo_t15_validation/type_check_3.stdout`, `/home/ubuntu/viyo_t15_validation/type_check_3.stderr` |
| Lint after final CTA correction | Passed. | `/home/ubuntu/viyo_t15_validation/lint_2.stdout`, `/home/ubuntu/viyo_t15_validation/lint_2.stderr` |
| Production build after final CTA correction | Passed; Vite built 425 modules successfully. | `/home/ubuntu/viyo_t15_validation/build_3.stdout`, `/home/ubuntu/viyo_t15_validation/build_3.stderr` |

## 6. Implementation Notes for Phase 4 Review

The initial production build failed because workspace package artifacts for `@viyo/ui` were not present in `dist`, while the package export map points to built artifacts. Building `@viyo/shared` and `@viyo/ui` resolved the monorepo prerequisite. After the no-unwired-CTA correction removed the runtime `@viyo/ui` usage from the new route tree, the web production build passed cleanly. This was a validation-environment prerequisite issue rather than a router implementation defect.

Phase 4 should review the final diff, verify that no dormant page components were newly routed, confirm `App.tsx` still wraps the router with Sentry, and confirm that direct Studio-route content remains a route-boundary surface rather than a product placeholder.
