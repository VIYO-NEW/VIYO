# Open Questions

Unresolved questions, spec gaps, and assumptions made during the build. Each entry is classified as Blocking (requires PO decision) or Non-Blocking (assumption made, logged for review).

## GAP-20260425-0001 — vitest 2.x + vite 6.x Compatibility

- **Phase discovered:** T12 (Dependabot patch)
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** pnpm overrides force vite 6.4.2, but vitest 2.1.9 officially supports only vite 5.x. Build and type-check pass, but test runner behavior is unverified (no test files exist yet).
- **Affected layers:** Build tooling, test infrastructure
- **Proposed plan:** Upgrade to vitest 3.x (which officially supports vite 6) when test files are written. Monitor for regressions.
- **Status:** OPEN

## GAP-20260425-0002 — esbuild ~0.25.0 Pin May Block Future Upgrades

- **Phase discovered:** Security patch (Dependabot)
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** esbuild is pinned to `~0.25.0` via pnpm overrides because 0.27.x breaks destructuring transforms. This pin prevents automatic minor version bumps.
- **Affected layers:** Build tooling
- **Proposed plan:** Remove the override when vitest ships with esbuild >= 0.25 natively, or when esbuild 0.27+ fixes the regression.
- **Status:** OPEN

## GAP-20260425-0003 — Inlined Sensitive Field Patterns in Browser Sentry

- **Phase discovered:** T12 Phase 4 (wiring verification)
- **Category:** Architecture
- **Blocking:** No
- **Description:** `SENSITIVE_FIELD_PATTERNS` are inlined in `apps/web/src/lib/sentry.ts` and `apps/admin/src/lib/sentry.ts` because importing from `@viyo/shared` pulls in `node:crypto` via barrel export. If patterns change in `vault.ts`, the browser files must be manually updated.
- **Affected layers:** Shared package, web app, admin app, security
- **Proposed plan:** Extract patterns into a separate `@viyo/shared/security/patterns.ts` file with no `node:crypto` dependency. This allows both Node.js and browser code to import from the same source.
- **Status:** OPEN

## GAP-20260425-0004 — No Dockerfile in Repository

- **Phase discovered:** T10 audit
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** `render.yaml` references `apps/worker/Dockerfile` but no Dockerfile exists in the repository. The Render deployment will fail without it.
- **Affected layers:** CI/CD, deployment
- **Proposed plan:** Create `apps/worker/Dockerfile` as part of deployment preparation (before first Render deploy). Should be a multi-stage Node.js build with pnpm.
- **Status:** OPEN

## GAP-20260425-0005 — Admin Config Panel Not Yet Built

- **Phase discovered:** T12 (Sentry DSN wiring)
- **Category:** UI/UX
- **Blocking:** No
- **Description:** Sentry DSNs, Stripe keys, R2 credentials, and other service configs are intended to be manageable via the Admin Config panel. The panel does not exist yet (T7 — Admin Portal Skeleton is pending).
- **Affected layers:** Admin app, configuration management
- **Proposed plan:** Wire config panel as part of T7 (Admin Portal Skeleton). All credentials currently managed via `.env.example` and deployment env vars.
- **Status:** OPEN

## GAP-20260425-0006 — No Test Files Exist

- **Phase discovered:** T10 audit
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** `pnpm test` reports "no test files found" across all packages. No unit, integration, or e2e tests have been written yet. CI pipeline runs tests but they are effectively no-ops.
- **Affected layers:** All packages, CI/CD
- **Proposed plan:** Write foundational tests as part of each Phase 1+ feature task. Consider a dedicated test infrastructure task if test count remains zero after T7/T9.
- **Status:** OPEN

## GAP-T7-001 — superadmin Role Not Defined in R22

- **Phase discovered:** T7 Phase 1 (Architecture Plan)
- **Category:** Auth
- **Blocking:** No
- **Description:** R17 §10 references a `superadmin` role for the admin portal ("VIYO HQ"), but R22 (Security & Authentication) does not define this role. The current auth system (`packages/shared/src/auth/live-check.ts`, `apps/worker/src/middleware/auth.ts`) only supports workspace-scoped roles: `owner`, `admin`, `member`, `viewer`. There is no global/platform-level superadmin concept.
- **Affected layers:** Layer 2 (Auth), Layer 5 (API Routes), Layer 7 (Admin Portal)
- **Proposed plan:** Proceed with checking `user_metadata.role === 'superadmin'` from Supabase JWT. This is a safe minimal assumption. When the auth system is extended in a future task, this check can be replaced with a proper platform-level role system.
- **Status:** OPEN

## GAP-T7-002 — Admin Auth Method (Magic Link vs MFA)

- **Phase discovered:** T7 Phase 1 (Architecture Plan)
- **Category:** Auth
- **Blocking:** No
- **Description:** R22 §2.1 specifies Magic Link (passwordless) as the primary login method for the web dashboard, but does not explicitly address whether the admin portal (superadmin access) should use higher-friction auth (email/password + MFA). Doc9 Part 10 mentions "IP allowlisting" for the admin shell but not MFA.
- **Affected layers:** Layer 2 (Auth), Layer 7 (Admin Portal)
- **Proposed plan:** Proceed with Magic Link for the skeleton (consistent with R22 §2.1). The admin portal can be upgraded to email/password + MFA in a future security hardening task. IP allowlisting is an infrastructure concern (Cloudflare/Render) deferred to deployment.
- **Status:** OPEN — PO confirmed proceed with magic links for skeleton.

## GAP-20260427-1455-STYLE-PROMPT-LIBRARY — Style/Prompt Library UI deferred to Sprint 3
- Phase discovered: Sprint 2 Phase 0 approval / T15 Phase 0
- Category: UI/UX, AI/Brain
- Blocking: No
- Description: Product Owner identified that the specs define Style/Prompt Library capabilities not covered by Sprint 2 tasks: pre-built templates, industry prompts, user-saved Style DNA, community gallery, and prompt history.
- Affected layers: Layer 6 Frontend UI, Layer 7 State Management, Layer 8 AI/Brain, Layer 12 Observability/Analytics
- Proposed plan: Backlog as Sprint 3 UI surface on top of the Art Director Router and Pattern DB. Do not expose placeholder library UI in Sprint 2.
- Status: OPEN — PO approved as Sprint 3 backlog on 2026-04-27T14:55:56-04:00

## GAP-20260427-1455-REMAINING-EDITING-TOOLS — Remaining editing tools deferred to Sprint 3
- Phase discovered: Sprint 2 Phase 0 approval / T15 Phase 0
- Category: API, UI/UX, AI/Brain
- Blocking: No
- Description: Sprint 2 covers Touch Edit, Layer Split, and Background Swap only. The remaining editing tools are not covered: Upscale, Remove Object, Outpaint, Text Edit, Color Adjust, Expand, and Object Recolor.
- Affected layers: Layer 5 API/Backend, Layer 6 Frontend UI, Layer 7 State Management, Layer 8 AI/Brain, Layer 10 Billing/Entitlements
- Proposed plan: Backlog as Sprint 3 incremental fal.ai tool integrations after the first three editing pipeline tools prove the architecture. Do not expose unwired tools in Sprint 2 UI.
- Status: OPEN — PO approved as Sprint 3 backlog on 2026-04-27T14:55:56-04:00

## GAP-20260427-1455-NOTIFICATION-DISPATCH — @mention notification dispatch deferred to Sprint 3
- Phase discovered: Sprint 2 Phase 0 approval / T15 Phase 0
- Category: API, Infrastructure, Collaboration
- Blocking: No
- Description: T18 creates notification_preferences, but Sprint 2 has no task that sends in-app, email, or push notifications when a user is @mentioned.
- Affected layers: Layer 1 DB Schema, Layer 5 API/Backend, Layer 9 Background Jobs, Layer 11 Notifications/Integrations, Layer 12 Observability/Analytics
- Proposed plan: Backlog a Sprint 3 Inngest notification dispatcher that reads notification_preferences and routes @mention notifications to enabled channels without schema changes.
- Status: OPEN — PO approved as Sprint 3 backlog on 2026-04-27T14:55:56-04:00
## GAP-2026-04-28-0008 — T45 Comments `brand_id` Foreign-Key Target Missing from Current DB Schema

Phase discovered: T45 Phase 2 Architecture Plan.

Category: DB Schema, Architecture, Auth.

Blocking: Yes.

Description: The PO-authorized Brand Chat and Comments architecture lock requires `comments.brand_id` as a non-null foreign key to `brands.id` and requires brand-level RLS isolation. The current first-party database implementation does not define a `brands` table in `packages/db/src/schema` or `packages/db/drizzle`; existing tenant-scoped tables anchor on `workspace_id`, and the current reusable RLS helper is `public.check_workspace_access(auth.uid(), workspace_id)`. Implementing the locked FK literally is impossible until the `brands` table exists; omitting the FK or replacing brand-level isolation with workspace-only isolation would be a security-relevant architecture deviation.

Affected layers: Layer 1 DB Schema, Layer 2 RLS/Auth, Layer 5 API/Backend, Layer 6 Frontend/UI, Layer 11 Notifications/Integrations, Layer 12 Observability/Analytics, Layer 13 Documentation/Source-of-Truth.

Proposed plan: Pause at the Phase 2 approval gate and request a PO decision. Recommended Option A is to add a minimal `brands` database foundation inside T45 before `comments`, with `id`, `workspace_id`, `name`, timestamps, membership-based workspace RLS, and indexes, so `comments.brand_id` can honor the architecture lock. Option B is to defer `brand_id` FK enforcement and implement workspace-only comments temporarily, but this creates a known security/model deviation and is not recommended.

Status: CLOSED — Product Owner approved Option A on 2026-04-28; T45 implemented the minimal `brands` table before `comments` in `packages/db/drizzle/0007_t45_composite_database_foundation.sql`, with workspace-membership RLS through `check_workspace_access` and Drizzle exports in `packages/db/src/schema/collaboration.ts`.


## 2026-04-28 — T46 Learning Loop Schema Gap Remains Deferred

T46 worker routing can build a zero-shot fallback prompt when cache score is below threshold, but it does not create unapproved curator or learning-loop tables. Persisting new fallback learning events remains a deferred schema decision requiring PO approval.
