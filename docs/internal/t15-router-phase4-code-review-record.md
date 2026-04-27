# T15-ROUTER Phase 4 Code Review and Wiring Verification Record

**Task:** T15 — Install TanStack Router in Web App  
**Feature ID:** T15-ROUTER  
**Protocol Phase:** VIYO Development Protocol v2 — Phase 4 Code Review and Wiring Verification  
**Status:** Passed Phase 4 review; live browser validation pending  
**Prepared:** 2026-04-27

## 1. Review Scope

This review covered the final T15 implementation diff after Phase 3. The reviewed implementation files were `apps/web/src/router.tsx` and `apps/web/src/App.tsx`. The review also checked `apps/web/src/main.tsx` to verify that Sentry bootstrap order was unchanged, and checked package/lockfile diffs to confirm that no dependency changes were introduced by T15.

## 2. Changed Code Surfaces

| Surface | Status | Review Finding |
|---|---:|---|
| `apps/web/src/router.tsx` | New | Manual TanStack Router route tree was added with root, index, brand-scoped Studio boundary, pending, error, and not-found components. |
| `apps/web/src/App.tsx` | Modified | Existing `Sentry.ErrorBoundary` remains the outer wrapper and now renders `AppRouterProvider` inside the boundary. |
| `apps/web/src/main.tsx` | Unchanged | Sentry bootstrap import remains first before React rendering. |
| `apps/web/package.json` | Unchanged | No router dependency addition or version change was required. |
| `pnpm-lock.yaml` | Unchanged | Frozen lockfile install and validation did not introduce lockfile churn. |

## 3. Thirteen-Layer Wiring Verification

| VIYO Layer | T15 Impact | Verification Result |
|---|---|---|
| Layer 1 — Database Schema | None | No migrations, tables, or database clients were modified. |
| Layer 2 — Auth | None | No auth store, Supabase auth listener, or protected-route policy was changed. |
| Layer 3 — Authorization/RLS | None | No RLS, permission, or role logic was changed. |
| Layer 4 — Domain Services | None | No shared service layer was changed. |
| Layer 5 — API/Backend | None | No API routes, Workers, webhooks, or backend handlers were changed. |
| Layer 6 — Frontend UI | Affected | Web root now renders through TanStack Router while preserving the existing public scaffold content without an unwired CTA. |
| Layer 7 — State Management | Future-facing only | `brandId` is exposed through route params for T24+ consumption; no store state was introduced. |
| Layer 8 — AI/Brain | None | No Art Director, Pattern DB, or generation logic was exposed or called. |
| Layer 9 — Background Jobs | None | No job queue or Inngest logic was changed. |
| Layer 10 — Billing/Entitlements | None | No token deduction, plan, billing, or entitlement logic was changed. |
| Layer 11 — Notifications/Integrations | None | No notification dispatch was added; Sprint 3 backlog covers that deferred gap. |
| Layer 12 — Observability/Analytics | Preserved | Sentry import-first bootstrap and outer error boundary are preserved. Route-level fallback components are nested under Sentry. |
| Layer 13 — Testing/Validation | Affected | Static validations passed; live browser validation remains required in Phase 5. |

## 4. No-Unwired-UI Review

The route tree does **not** expose navigation into future Sprint 2 features. It adds a direct route boundary at `/brand/$brandId/studio`, but it does not show mode pickers, image-generation controls, editing tools, prompt libraries, collaboration panels, webhook controls, billing actions, or fake Studio CTAs. The inherited home `Get Started` button was removed during Phase 3 because it was an unwired action surface. The home route now contains only the existing VIYO identity and a non-interactive scaffold status label.

## 5. Sentry and Error-Boundary Review

`apps/web/src/main.tsx` remains unchanged and still imports `./lib/sentry.js` before React renders. `apps/web/src/App.tsx` keeps `Sentry.ErrorBoundary` as the outer application boundary. The TanStack router provider is mounted inside that boundary, so route-level pending, error, and not-found components do not replace Sentry; they operate below it.

## 6. Dependency and Lockfile Review

The Product Owner’s Phase 1 observation about router version consistency was checked before implementation. `@tanstack/react-router` was already present for the web app, the workspace install used the existing frozen lockfile, and no package manifest or lockfile diff was introduced by the T15 implementation.

## 7. Static Validation Evidence Reviewed

| Validation | Result | Evidence |
|---|---:|---|
| `pnpm --filter @viyo/web type-check` | Passed | `/home/ubuntu/viyo_t15_validation/type_check_3.stdout`, `/home/ubuntu/viyo_t15_validation/type_check_3.stderr` |
| `pnpm --filter @viyo/web lint` | Passed | `/home/ubuntu/viyo_t15_validation/lint_2.stdout`, `/home/ubuntu/viyo_t15_validation/lint_2.stderr` |
| `pnpm --filter @viyo/web build` | Passed | `/home/ubuntu/viyo_t15_validation/build_3.stdout`, `/home/ubuntu/viyo_t15_validation/build_3.stderr` |

## 8. Open Review Items Entering Phase 5

Phase 5 must still verify the runtime behavior in a browser for `/`, `/brand/demo-brand/studio`, and an unmatched route such as `/missing-route`. The browser run must confirm that the home page renders without the unwired CTA, the Studio route boundary displays the route parameter without loading unwired modules, and the 404 surface is deterministic.

## 9. Phase 4 Decision

Phase 4 review passes. The implementation is ready for live browser/runtime validation under Phase 5. No foundational defect was found in the routing, Sentry boundary, dependency, or no-unwired-UI wiring.
