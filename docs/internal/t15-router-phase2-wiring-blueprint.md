# T15-ROUTER Phase 2 Global Wiring Blueprint

**Task:** T15 — Install TanStack Router in Web App  
**Feature ID:** T15-ROUTER  
**Protocol Phase:** VIYO Development Protocol v2 — Phase 2 Global Wiring Blueprint  
**Status:** Awaiting Product Owner approval before code changes  
**Phase 1 Approval:** Approved by Product Owner on 2026-04-27  
**Prepared:** 2026-04-27  

## 0. Purpose and Approval Boundary

This document maps **T15-ROUTER** across all thirteen VIYO wiring layers before implementation begins. The approved Phase 1 architecture states that T15 is a **frontend routing foundation**: it adds a TanStack Router instance to the web app, preserves the current `/` surface, defines `/brand/:brandId/studio` as a brand-scoped route boundary, keeps Sentry as the outer error boundary, and exposes no unwired Studio, editing, prompt-library, notification, or fake CTA surfaces.

No code changes are included in this document. Implementation may begin only after the Product Owner approves this Phase 2 blueprint.

> **Product Owner constraint carried forward:** No UI placeholders for unwired features. If a mode or tool is not connected to the backend, it must not be exposed in the UI.

## 1. Global Wiring Summary

T15 affects the web application routing layer, TypeScript route typing, route-level error handling, documentation, and validation coverage. It deliberately does **not** affect database schema, Supabase RLS, backend Workers, API routes, AI brains, billing logic, webhook behavior, or admin portal functionality.

| Layer | Affected? | Summary |
|---|---:|---|
| 1. Database Schema & Migrations | No | No tables, columns, indexes, migrations, pgvector, or RLS-backed records are introduced. |
| 2. Supabase Auth, Roles & Policies | No | No auth flow, role, policy, session, or Supabase client behavior changes are introduced. |
| 3. Shared Types & Contracts | Yes | App-local router typing and typed route params are introduced; no shared package contract changes. |
| 4. Backend Services & Workers | No | No Worker, webhook, Inngest, queue, or service logic changes are introduced. |
| 5. API Routes & Validation | No | No HTTP endpoint, request payload, response shape, validation middleware, or rate-limit behavior changes are introduced. |
| 6. Frontend UI & State | Yes | The web SPA mounts `RouterProvider`, preserves `/`, and adds a non-linked brand-scoped route boundary. |
| 7. Admin Portal | No | Admin is unchanged; its existing router is used only as implementation precedent. |
| 8. AI Brains & Prompts | No | No prompt, model, Council of Brains, fal.ai, Pattern DB, or generation behavior changes are introduced. |
| 9. Analytics & Audit Trail | No | No event tracking or audit logging is added in T15; there is no user action instrumentation scope. |
| 10. Config & Feature Flags | Yes | Dependency and lockfile consistency are verified; no new environment variable or feature flag is planned. |
| 11. Logs, Monitoring & Error Handling | Yes | Sentry remains the outer boundary and route-level pending/error/not-found surfaces are added. |
| 12. Documentation & Runbooks | Yes | Internal architecture/wiring records are updated; Phase 8 docs sync will record final build state. |
| 13. Tests | Yes | Type-check, build, lint, runtime route checks, 404 behavior, and bundle budget evidence are required. |

## 2. Thirteen-Layer Wiring Blueprint

| Layer | Affected? | What Changes | Depends On | Spec Reference | Risk |
|---|---:|---|---|---|---|
| 1. Database Schema & Migrations | No | T15 introduces no persistence. No migration files, Supabase tables, SQL functions, indexes, pgvector columns, token ledger rows, notification preference rows, Pattern DB fields, or brand records are changed. | Existing database remains unchanged. | Architecture Lock V3; R20 only as a non-applicability check. | Low. The risk is accidental scope creep; mitigation is to reject any DB change during T15. |
| 2. Supabase Auth, Roles & Policies | No | T15 does not add login, logout, session initialization, role checks, RLS policies, or workspace/brand authorization. The `/brand/:brandId/studio` route is only a client route boundary and must not fetch sensitive brand data. | Existing Supabase client remains unchanged. | R22 only as a non-applicability check; Phase 1 decision to keep T15 frontend-only. | Medium. A direct brand route can be mistaken for authorization. Mitigation: render no sensitive data and document that T24+ must add server-validated access before loading brand assets. |
| 3. Shared Types & Contracts | Yes | Add TanStack Router type registration and typed route param access for `brandId`. Types remain app-local in `apps/web/src/router.tsx`; no `@viyo/shared` contract is altered. | `@tanstack/react-router`; TypeScript; current web package constraints. | Architecture Lock V3 frontend stack; Doc9 frontend architecture. | Medium. Incorrect route typing could reduce future safety. Mitigation: compile with `pnpm --filter @viyo/web type-check` and avoid `any`. |
| 4. Backend Services & Workers | No | No Worker route, webhook handler, Inngest function, queue consumer, billing service, generation service, notification dispatcher, or background process is introduced. | Existing backend packages remain unchanged. | R18/R21 only as non-applicability checks. | Low. Scope creep into backend would violate T15 dependency-free status. Mitigation: no backend file changes. |
| 5. API Routes & Validation | No | No API path, request schema, response schema, validation middleware, rate limiter, or error code is changed. | Existing API contracts remain unchanged. | R18 only as non-applicability check. | Low. Any API call from the route boundary would create premature coupling. Mitigation: studio boundary reads only URL params. |
| 6. Frontend UI & State | Yes | Add a web router module, mount `RouterProvider` inside the existing Sentry-wrapped `App`, preserve the current `/` home/scaffold surface, add `/brand/:brandId/studio`, and add controlled pending/error/not-found route components. No Zustand store is changed. No navigation link to Studio is added. | `apps/web/src/App.tsx`; `apps/web/src/main.tsx`; `@tanstack/react-router`; current `Button` and home scaffold UI. | Architecture Lock V3; Doc9 frontend architecture; Product Owner no-unwired-UI instruction. | High. The main risk is accidentally exposing incomplete product surfaces. Mitigation: the route boundary contains no tools, modes, library, edit controls, or fake CTAs and is not linked from visible UI. |
| 7. Admin Portal | No | No files under `apps/admin` are modified. The existing admin router pattern remains only an architectural precedent for manual route tree construction, route-level fallback components, and explicit route declarations. | Existing admin app implementation as reference only. | Current repository state where it does not conflict with higher authority. | Low. Risk is accidentally changing admin while copying patterns. Mitigation: no admin file changes. |
| 8. AI Brains & Prompts | No | T15 does not wire Art Director Router, Pattern DB, prompt selection, fal.ai calls, image generation, editing tools, prompt history, or community library features. | Future T21/T23/T25/T26/T27-T30 tasks. | Doc2/R19 only as non-applicability checks; Product Owner Sprint 3 gap decisions. | Medium. Route naming may invite placeholder AI UI. Mitigation: no generation UI or AI affordances in T15. |
| 9. Analytics & Audit Trail | No | No click tracking, product analytics, audit events, route-change telemetry, or Sentry custom breadcrumbs are added in T15. Existing Sentry integration remains unchanged. | Existing monitoring stack. | Architecture Lock V3; observability expectations only as non-applicability checks. | Low. Route analytics can be added later when product events are defined. Mitigation: do not invent tracking schema now. |
| 10. Config & Feature Flags | Yes | Verify that `@tanstack/react-router` is already present in `apps/web/package.json`, confirm lockfile consistency after package-manager operations, and avoid adding env vars or flags. If a monorepo version mismatch appears, resolve it structurally rather than accepting duplicate router bundles. | `apps/web/package.json`; root lockfile; existing admin dependency graph. | Product Owner Phase 1 observation; Architecture Lock V3 stack decision. | Medium. Duplicate package versions could increase bundle size or type inconsistency. Mitigation: run dependency/lockfile inspection and include results in validation evidence. |
| 11. Logs, Monitoring & Error Handling | Yes | Preserve Sentry import-first bootstrap in `main.tsx`, keep `Sentry.ErrorBoundary` in `App.tsx`, mount the router inside that boundary, and add route-level `pendingComponent`, `errorComponent`, and `notFoundComponent`. | Existing `@sentry/react`; existing `./lib/sentry.js`; TanStack Router error surfaces. | T12 Sentry behavior in current code; Architecture Lock V3; Doc9 frontend reliability expectations. | High. Misplacing the provider could weaken error capture or create confusing duplicate fallbacks. Mitigation: Sentry remains outermost for React runtime errors while router handles route states. |
| 12. Documentation & Runbooks | Yes | Preserve Phase 1 and Phase 2 internal records, update resilience checkpoint, and in Phase 8 record final implementation evidence. Source-of-truth docs are not committed or copied; any required docs sync is done via the approved docs sync process only after build completion. | `docs/internal/`; memory checkpoint; Phase 8 docs sync rule. | VIYO protocol internal records and docs sync rules. | Medium. Documentation can drift from implementation. Mitigation: final Phase 8 report must reconcile built files, validation evidence, and source-of-truth update notes. |
| 13. Tests | Yes | Run web type-check, lint, build, runtime browser validation for `/`, runtime browser validation for `/brand/test-brand/studio`, runtime browser validation for unmatched route, and bundle-budget evidence at deploy gate. Add or adjust tests only if existing test structure supports route assertions without creating artificial placeholders. | `pnpm --filter @viyo/web type-check`; `pnpm --filter @viyo/web lint`; `pnpm --filter @viyo/web build`; dev server/browser validation. | VIYO protocol Phase 5 and Phase 7; Doc9 bundle-budget rule. | High. A router can compile but fail at runtime. Mitigation: browser checks are mandatory before completion and failed checks trigger foundational fix handling, not patching. |

## 3. Route-Level Wiring Details

The implementation will route browser paths through the existing Vite SPA without changing backend request handling. The router will be app-local and explicit.

| Route | Purpose | UI Exposure | Data Access | Validation Requirement |
|---|---|---|---|---|
| `/` | Preserve current VIYO web scaffold/landing surface. | Visible as existing root surface. | None beyond current compile-time workspace import and UI component rendering. | Must render successfully in browser after router mount. |
| `/brand/:brandId/studio` | Establish brand-scoped Studio route boundary for T24+ and T26/T33 consumers. | Direct URL only; no visible link or navigation added in T15. | Reads only `brandId` from URL params; no brand fetch or sensitive data. | Must render safely and show that `brandId` is recognized without exposing tools or fake actions. |
| `*` unmatched | Controlled web not-found behavior. | Visible only when user visits invalid path. | None. | Must render deterministic not-found UI and allow return to `/`. |

The direct-access Studio route surface must be operational rather than promotional. It may state that the route boundary is installed and awaiting wired Sprint 2 dependencies, but it must not include buttons, mode cards, editing options, prompt library entries, generation flows, or navigation to unavailable functionality.

## 4. Component-to-Layer Wiring Matrix

| Component | Layer 3 Types | Layer 6 Frontend | Layer 10 Config | Layer 11 Error Handling | Layer 12 Docs | Layer 13 Tests |
|---|---:|---:|---:|---:|---:|---:|
| `apps/web/src/router.tsx` | Yes | Yes | No direct config | Yes | Yes | Yes |
| `apps/web/src/App.tsx` | No | Yes | No | Yes | Yes | Yes |
| `apps/web/src/main.tsx` | No | Verification only | No | Verification only | Yes | Yes |
| Root/index route component | No | Yes | No | Covered by router/Sentry | Yes | Yes |
| Brand studio route boundary | Yes | Yes | No | Covered by router/Sentry | Yes | Yes |
| Not-found/error/pending components | No | Yes | No | Yes | Yes | Yes |
| Root package/lockfile inspection | No | No | Yes | No | Yes | Yes |

## 5. Wiring Sequence

| Step | Action | Layer Coverage | Stop Condition |
|---:|---|---|---|
| 1 | Confirm Phase 2 approval and update task tracking/checkpoint. | 12 | Stop if approval is not explicit. |
| 2 | Inspect dependency versions and lockfile state before editing. | 10, 13 | Stop if router dependency is missing or duplicate-version resolution requires a scope decision. |
| 3 | Create `apps/web/src/router.tsx` with documented route tree and route fallbacks. | 3, 6, 11 | Stop if implementation would require backend/auth/data access. |
| 4 | Modify `apps/web/src/App.tsx` to preserve Sentry boundary and mount `RouterProvider`. | 6, 11 | Stop if Sentry import/error-boundary behavior would be weakened. |
| 5 | Leave `main.tsx` unchanged unless TypeScript/runtime validation proves a necessary provider/bootstrap adjustment. | 6, 11 | Stop if moving logic would violate Sentry import-first ordering. |
| 6 | Run type-check, lint, and build; apply foundational fix gate if failures occur. | 3, 6, 10, 11, 13 | Stop after three failed fix attempts. |
| 7 | Run browser validation for `/`, `/brand/test-brand/studio`, and unmatched URL. | 6, 11, 13 | Stop if any route crashes or exposes unwired UI. |
| 8 | Run deploy-gate bundle/dependency evidence and document results. | 10, 12, 13 | Stop if bundle budget fails or duplicate router bundle is confirmed. |

## 6. Validation Evidence Required Before T15 Completion

| Evidence | Required Artifact | Success Criteria |
|---|---|---|
| TypeScript route typing | Command log for `pnpm --filter @viyo/web type-check` | Zero TypeScript errors and no introduced `any` escape hatches. |
| Lint | Command log for `pnpm --filter @viyo/web lint` | Zero lint errors caused by T15. |
| Production build | Command log for `pnpm --filter @viyo/web build` | Vite build succeeds. |
| Lockfile/dependency consistency | Dependency inspection output | `@tanstack/react-router` resolves consistently; if mismatch exists, it is fixed structurally or escalated before completion. |
| Home route browser proof | Browser validation note/screenshot if available | `/` renders the existing VIYO surface after router mount. |
| Studio boundary browser proof | Browser validation note/screenshot if available | `/brand/test-brand/studio` resolves, reads `brandId`, and exposes no unwired tools, modes, prompt library, generation controls, or fake CTAs. |
| 404 browser proof | Browser validation note/screenshot if available | Unmatched route renders controlled not-found state. |
| Error-boundary preservation | Code review notes plus runtime/build evidence | Sentry remains outer error boundary and route-level errors remain deterministic. |
| Bundle budget evidence | Deploy-gate bundle/dependency output | Initial load remains within the applicable VIYO budget or is fixed before Phase 7 approval. |

## 7. Explicit Non-Changes

T15 will not create or modify database migrations, Supabase RLS policies, backend Worker endpoints, API request validators, billing/token deduction logic, Stripe webhook code, Pattern DB schema, AI prompts, generation endpoints, editing tool APIs, notification dispatch, admin portal routes, or analytics events. These are intentionally excluded to preserve the approved dependency-free scope of T15 and avoid exposing unwired product behavior.

The three Product Owner-approved Sprint 3 backlog gaps remain formally deferred: **Style/Prompt Library UI**, **remaining editing tools**, and **notification dispatch**. T15 must not add routes, navigation, cards, buttons, empty states, or UI references that imply those deferred surfaces are available.

## 8. Product Owner Approval Request

Please approve or revise this Phase 2 thirteen-layer wiring blueprint. If approved, implementation will proceed into Phase 3 using the approved Phase 1 architecture plan and this wiring blueprint, beginning with `apps/web/src/router.tsx` and then `apps/web/src/App.tsx`. No code changes will be made before this approval is received.
