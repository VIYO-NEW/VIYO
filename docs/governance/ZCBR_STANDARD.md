# ZCBR_STANDARD.md

**Document class:** Formal standard for R-spec quality
**Status:** DRAFT — pending PO ratification
**Author:** Architect Claude (Opus 4.7)
**Date:** 2026-05-11
**Repo target:** `/docs/governance/ZCBR_STANDARD.md`
**Becomes:** Foundation Lock 20 candidate ("ZCBR-Validated Specs Required") after PO ratification
**Authority tier:** PO decisions → V8 PRD → FOUNDATION_AUTHORITY.md → VIYO_Master_Build_Sequence.md → **ZCBR_STANDARD.md** → R-spec ZCBR → directives → code

---

## Purpose

ZCBR (Zero-Clarification Builder-Ready) is the quality bar every R-spec must clear before a dependent Bullet ships. Until 2026-05-11 ZCBR was a name without a spec — referenced in PO frustration about Manus output quality, used as shorthand for "the May 3 foundational rewrite was supposed to fix this," but never written down as testable criteria.

This document fixes that. ZCBR is now a binary standard: an R-spec either passes or fails. Failure modes are enumerated. Validation is mechanical, not aesthetic.

The cost of getting this wrong was demonstrated in April–May 2026: Manus-authored thin R-specs produced Manus-quality code, the PO rejected it, and the team paid the cost of a ZCBR foundational rewrite. The cost of getting it right is ~10-20 min validation per spec before a Bullet ships, which prevents 60-120 min wasted Composer Queue cycles + 30-60 min Reviewer Claude + PO review time on rejected output.

ZCBR exists to make first-pass acceptance the default at §9 Gate.

---

## 1. The Core Definition

An R-spec is **Zero-Clarification Builder-Ready** when both of these are simultaneously true:

1. **Zero-Clarification (ZC).** A senior builder (Kimi K2.6, Reviewer Claude, Manus, or any future executor) can implement every component the spec defines without asking the Architect any clarifying question. The spec is self-contained.

2. **Builder-Ready (BR).** A builder can execute the spec inside the Portal Composer Queue (or directly via Manus) without architectural improvisation. Every decision the builder would otherwise have to invent has already been made in the spec and is cited by source authority.

Both conditions must hold. A spec can be perfectly clear (ZC pass) but require the builder to invent the schema (BR fail). A spec can have every schema locked (BR pass) but use ambiguous language about which schema applies when (ZC fail). Both states fail ZCBR.

---

## 2. The Zero-Clarification (ZC) Conditions

A spec satisfies ZC when **all** of the following are demonstrably true. Each is binary — a checklist item either holds or it doesn't.

### ZC-1. No ambiguous language

Forbidden phrases that automatically fail ZC if present in any normative section of the spec (excluding examples, rationale prose, or explicitly-flagged TBDs that cite a tracking ID):

- "as appropriate"
- "as needed"
- "if necessary"
- "various"
- "etc." (when ending a list that should be exhaustive)
- "may include"
- "could include"
- "should consider"
- "potentially"
- "where applicable"
- "as required" (without naming the requirement)
- "handle gracefully" (without specifying the failure mode)
- "best effort"
- "future work" (without an OD-XXX or B-X.YY tracking ID)
- "TODO" / "TBD" / "FIXME" without a tracking ID
- "depending on context" (without naming the contexts)
- "or similar"
- "and so on"

Permitted: these phrases inside `<example>` blocks, inside historical context, or when the spec explicitly cites a tracking ID resolving the ambiguity (e.g. "TBD per OD-013").

### ZC-2. Every referenced entity is defined or cited

When the spec mentions any of the following, it either defines them in-spec OR cites an authoritative source by full identifier:

- Database table names → cite migration ID or define schema in-spec
- Field names → cite schema location or define in-spec
- Foundation Lock numbers → cite Lock # (e.g. "per Lock 6")
- Conflict Resolutions → cite C-XX (e.g. "per C-01")
- Decisions → cite D-XX (e.g. "per Notion D11")
- Other R-specs → cite Rxx + section (e.g. "per R29 PAL §3.2") and reference the ZCBR status of the cited R-spec
- Bullets → cite B-X.YY from Master Build Sequence
- Features → cite Feature ID from Inventory v002 (e.g. "T70-CACHE-ROUTE-META")
- External APIs → cite vendor documentation URL or internal API path
- Models → cite via Provider Registry interface (per Lock 19 — no hardcoded model name strings)
- Skills → cite by exact skill name as loaded via `skills.pickForTask()` API from Portal product per D63 Path E (e.g. "loads `pattern-cache-lookup`"). Skills do NOT live in any git repo per D63 reaffirmed 2026-05-15.

A spec that mentions "the assets table" without citing R20 or defining the schema fails ZC-2.

### ZC-3. Every API contract is fully specified

For every API endpoint, RPC, event payload, or function interface defined in the spec:

- Request shape: Zod schema or equivalent type definition with every field's type, optionality, validation rules
- Response shape: same level of detail for success + error responses
- HTTP status codes: every status code returnable is enumerated with the condition that triggers it
- Authentication: required scope / role / token type explicitly named
- Idempotency behavior: stated explicitly (idempotent / not / conditional with key)
- Rate limit: stated as quantity per time window or marked "no limit" with rationale
- Side effects: enumerated (DB writes, event emissions, external API calls, file system writes)

A spec saying "the API returns the asset" without specifying the JSON shape, status codes, or auth requirement fails ZC-3.

### ZC-4. Every failure mode is named

For every named operation in the spec:

- Failure modes enumerated by category: validation failure, authorization failure, dependency failure (downstream service down), state failure (record not found / record locked), constraint failure (token budget exceeded / quota hit), provider failure (AI generation failed)
- For each failure mode: error code/message returned, side effects rolled back, retry semantics defined, logging/observability behavior named
- Partial-failure scenarios named: what happens if step 2 of 5 fails — does the whole transaction rollback, or do partial side effects persist? Define explicitly.

A spec saying "on error, return 500" fails ZC-4. A spec saying "transient failures retried 3x with exponential backoff (5s, 30s, 5m); after 3 failures, write DLQ entry and emit `studio.generate.failed` event with `reason: 'provider_unavailable'`; partial side effects (Pattern DB cache write, Visual Intent Router classification write) are NOT rolled back because they have independent value" passes ZC-4.

### ZC-5. Every edge case is named

The spec enumerates edge cases relevant to its scope. The criterion for "relevant" is: any input or state that the builder might reasonably encounter but for which the happy path doesn't produce a clear answer.

Examples of edge cases that must be named if relevant:

- Empty inputs (empty prompt, empty array, null vs absent)
- Maximum-size inputs (longest prompt, largest asset, maximum batch)
- Concurrent operations on same entity (two users editing same asset)
- Cross-tenant scenarios (asset shared, brand switch mid-operation)
- Race conditions (cache write vs read, webhook delivery vs retry)
- Stale data scenarios (asset deleted before edit completes, brand deleted with active session)
- Provider degradation (Tier 1 down → fallback to Tier 2 — when does this fire, what triggers it)
- Token budget at exact boundary (request that would exceed by 1 token)
- RLS boundary (operation that touches multiple brand_ids — must fail loudly per Lock 13)

A spec that defines only the happy path fails ZC-5.

### ZC-6. Every dependency is named with version pin or version policy

For every external library, service, or skill the spec depends on:

- Library: package name + version constraint (e.g. `@mastra/core@^0.1.0`) or "use whatever is in package.json with a follow-up Bullet to pin"
- Service: service name + endpoint + auth method (e.g. "Supabase Realtime via @supabase/realtime-js v2.x")
- Skill: exact skill name loaded via `skills.pickForTask()` API from Portal product per D63 Path E + version if applicable (e.g. "loads `pattern-cache-lookup` v1.0.0"). Skills do NOT live in any git repo per D63 reaffirmed 2026-05-15.
- Model: cited via Provider Registry abstraction only (Lock 19) — no model name strings in spec
- R-spec: cited as `Rxx vN` with note on whether the cited R-spec is itself ZCBR-validated

A spec saying "uses Flux for inpainting" fails ZC-6 (violates Lock 19 by naming model directly and provides no Provider Registry interface citation). Correct: "Calls `provider.execute({ task: 'image_inpainting', context })`; Provider Registry resolves to current best-fit model per Lock 19 + Conflict Resolution C-05 tier strategy."

### ZC-7. Every locked decision is invoked by reference

The spec lists Foundation Locks, Conflict Resolutions, and Decisions it operates under. Builder reads this list before implementing and verifies their work doesn't violate any.

Format: a `## Locks & Decisions Invoked` section near the top of the spec. Example:
```
- Lock 4 (Single Image Generation Trace) — cache-first lookup required
- Lock 6 (Brand Vault Organization) — bytes in R2, lineage in DB
- Lock 13 (Tenant Isolation via RLS) — every query scoped to brand_id
- Lock 19 (Provider Agnosticism) — no hardcoded model names
- C-01 (Studio Editing Text Edit Lovart-style) — lazy extraction
- C-04 (Empirical Scoring Matrix) — Art Director scores from RLHF, not pre-determined
- D11 (Webhook Architecture) — supersedes T48
```

A spec without this section fails ZC-7.

---

## 3. The Builder-Ready (BR) Conditions

A spec satisfies BR when **all** of the following are demonstrably true.

### BR-1. Every component has a concrete file location

For every code artifact the spec produces or modifies:

- Repo path stated (e.g. `apps/web/app/api/studio/generate/route.ts`)
- File creation vs modification stated explicitly
- Adjacent files affected (imports, exports, registrations) listed
- For monorepo: which `packages/` or `apps/` workspace

A spec saying "implement the API endpoint" without naming the file path fails BR-1.

### BR-2. Every database change has a migration plan

For every schema change:

- Migration file location (e.g. `packages/db/migrations/`)
- Migration timestamp prefix convention to use
- Up + down migration both specified (or "irreversible — destructive change" with rationale)
- RLS policy preservation explicitly addressed (Lock 13 — new columns inherit parent RLS, new tables require new RLS)
- Index strategy stated (which columns get indexed, why)
- Foreign key relationships diagrammed (text or table format)
- Backfill strategy if existing rows need values (or "no backfill — column nullable for existing rows")

### BR-3. Every test scenario is stated

For every component in the spec:

- Happy path test stated with setup + action + assertion
- At least N failure mode tests stated (where N ≥ ZC-4 failure mode count)
- Test type stated: unit / integration / behavioral / E2E
- Test framework stated (Vitest / Playwright / Inngest dev server / etc.)
- What's mocked vs real stated explicitly (per `writing-behavioral-tests` skill)
- CI integration stated (which pipeline stage runs these)

A spec saying "tested via behavioral tests" without naming scenarios fails BR-3.

### BR-4. Every observability hook is stated

For every operation:

- OpenTelemetry span name + attributes
- Sentry error capture: which exceptions get reported, with what context
- PostHog event name + properties (if user-facing event)
- Structured log fields at step boundaries (must include `generation_id` correlation per P0-03)
- Metric names if custom metrics emitted

### BR-5. Every external interaction is specified

For every external API call or third-party service interaction:

- Authentication mechanism (OAuth scope, API key location, JWT issuer)
- Request/response shapes
- Rate limits + backoff strategy
- Failure escalation (when does this fail loudly vs silently retry)
- Timeout values
- Provider Registry interface citation (Lock 19) for any AI/ESP/e-commerce/payment call

### BR-6. Every concurrency concern is addressed

If the spec's operations could race:

- Transaction boundaries stated (which operations happen in single DB transaction)
- Lock strategy stated (row-level vs advisory vs none, with rationale)
- Idempotency keys defined for retries
- Realtime broadcast ordering guaranteed or "best-effort with stated implications"

### BR-7. Acceptance criteria are mechanical

The spec's "this is done when" section reads as a list of binary checks, not subjective qualities. "Code is good" fails. "Lint passes + typecheck passes + all 4 named failure mode tests pass + no hardcoded provider names found via grep + RLS test passes for all 5 roles" passes.

---

## 4. ZCBR Acceptance Checklist (for validators)

Every R-spec is run through this checklist by the validator. Each item is binary pass/fail. Spec is ZCBR-compliant only when every item passes.

```
## Zero-Clarification Conditions
[ ] ZC-1: No ambiguous language (no forbidden phrases in normative sections)
[ ] ZC-2: Every referenced entity is defined or cited by full identifier
[ ] ZC-3: Every API contract is fully specified (shapes + codes + auth + idempotency + rate limit + side effects)
[ ] ZC-4: Every failure mode is named (category + error + rollback + retry + logging)
[ ] ZC-5: Every relevant edge case is named (empty / max / concurrent / cross-tenant / race / stale / degraded / boundary / RLS)
[ ] ZC-6: Every dependency is version-pinned or version-policy-stated (libraries + services + skills + models via registry + R-specs)
[ ] ZC-7: Every locked decision is invoked by reference (Locks & Decisions Invoked section present)

## Builder-Ready Conditions
[ ] BR-1: Every component has a concrete file location
[ ] BR-2: Every database change has a migration plan (file + RLS + indexes + FKs + backfill)
[ ] BR-3: Every test scenario is stated (type + framework + mocks + CI)
[ ] BR-4: Every observability hook is stated (OTel + Sentry + PostHog + structured logs + metrics)
[ ] BR-5: Every external interaction is specified (auth + shapes + rate limits + failure + timeout + registry)
[ ] BR-6: Every concurrency concern is addressed (transactions + locks + idempotency + ordering)
[ ] BR-7: Acceptance criteria are mechanical (binary pass/fail list, no subjective qualities)

## Overall
[ ] Spec is ZCBR-compliant — pass on all 14 items above
[ ] Spec includes ZCBR pass date + validator identity in header
[ ] Spec includes diff against prior version if rewriting an existing spec
```

If any single item fails, the spec is **not** ZCBR-compliant. Use of the spec by any Bullet directive is forbidden until validation passes.

---

## 5. Validation Protocol

ZCBR validation happens at three checkpoints. All three must pass before a Bullet directive citing the spec is accepted into Composer Queue.

### Checkpoint 1 — Architect self-validation (mandatory before spec commit)

After authoring or rewriting an R-spec, Architect Claude runs the ZCBR Acceptance Checklist against the spec.

Procedure:
1. Architect re-reads the spec from top to bottom, treating themselves as a builder who has never seen it before
2. For each of the 14 checklist items, Architect marks pass or fail with a one-sentence reason
3. Any fail → Architect rewrites the failing section and re-runs the checklist
4. Once all 14 pass, Architect adds the ZCBR pass header to the spec:
```
**ZCBR Status:** PASSED 2026-MM-DD by Architect Claude self-validation
**ZCBR Checklist version:** v1
```
5. Spec is committed to repo

Architect self-validation alone is not sufficient. Two more checkpoints follow.

### Checkpoint 2 — Reviewer Claude validation (mandatory at §9 Gate)

Before Reviewer Claude validates any Kimi Bullet output, Reviewer Claude first validates the cited R-spec.

Procedure (lives in updated `§9-code-review-protocol` skill):
1. Reviewer Claude reads the Bullet directive
2. Reviewer Claude identifies every R-spec cited by the directive
3. For each cited R-spec, Reviewer Claude reads the ZCBR Status header
4. If header missing or status fail → Reviewer Claude rejects the Bullet directive (does not validate code) and reports back to Architect
5. If header passes, Reviewer Claude re-runs the ZCBR Acceptance Checklist as a sanity check (full reread not required — spot-check 3 random items from ZC + 3 from BR)
6. If sanity check fails → reject + report
7. Only if both pass → Reviewer proceeds to code validation per existing §9 protocol

### Checkpoint 3 — Kimi pre-flight validation (mandatory at Composer Queue intake)

Before Kimi starts code on a Bullet, Kimi runs the new `zcbr-spec-validation` skill against every cited R-spec.

Procedure (lives in new `zcbr-spec-validation` skill — 12th Tier 1 skill):
1. Kimi parses the Bullet directive's `R-spec:` references
2. For each, Kimi reads the R-spec file from repo at the cited version
3. Kimi greps the spec for the `ZCBR Status: PASSED` header
4. If missing or not passed → Kimi fails loudly with: `ZCBR_VALIDATION_FAIL: R-spec {Rxx} cited by directive {B-X.YY} has no ZCBR pass — refuse to start code`
5. Kimi additionally grep-checks for forbidden ZC-1 phrases in normative sections — if found, fails loudly
6. Only if every cited R-spec passes both checks → Kimi proceeds to code

This three-checkpoint protocol exists because each catches different failure modes:
- Architect self-validation catches authoring errors at source
- Reviewer Claude catches drift between spec and ZCBR over time
- Kimi pre-flight catches version mismatch (spec updated after directive sent without re-validation)

---

## 6. Examples — Pass and Fail

### Example 1 — ZCBR-PASSING spec snippet (synthetic for illustration)

```markdown
## 3.2 Pattern DB Cache Lookup

Locks & Decisions Invoked: Lock 4 (cache-first), Lock 5 (Pattern Recipe schema), Lock 13 (RLS), C-04 (empirical scoring)

### 3.2.1 API: POST /api/studio/pattern-cache/lookup

Auth: JWT required with brand_id claim. Role: Editor or higher.
Idempotency: Idempotent (read-only query).
Rate limit: 60/min per brand_id.

Request body (Zod):
{
  brief_embedding: number[1536] (OpenAI text-embedding-3-small dimensions, required),
  brand_id: string (UUID, required, must match JWT claim),
  niche_filter: string (optional, must match enum from /packages/core-types/niches.ts)
}

Response 200 (cache hit):
{
  cache_status: "hit",
  pattern_id: string (UUID),
  pattern_recipe: PatternRecipe (per Lock 5 schema, R20 v2 §4),
  confidence_score: number (0.0-1.0)
}

Response 200 (cache miss):
{
  cache_status: "miss",
  closest_match_pattern_id: string (UUID, nullable),
  closest_match_distance: number (0.0-2.0, cosine distance)
}

Response 401: missing/invalid JWT
Response 403: JWT brand_id mismatches request brand_id (Lock 13 violation)
Response 422: Zod parse failure with field-level errors
Response 429: rate limit (60/min) exceeded

Side effects: none (read-only)
Logging: structured JSON with generation_id (from request header X-Generation-ID), cache_status, lookup_duration_ms
OTel: span name studio.pattern_cache.lookup, attributes brand_id (hashed), cache_status, top_k_distance

### 3.2.2 Implementation

File: apps/web/app/api/studio/pattern-cache/lookup/route.ts (new)
Dependencies: @supabase/supabase-js@^2.39, drizzle-orm@^0.30, pgvector via @neondatabase/serverless

Algorithm:
1. Validate JWT, extract brand_id claim
2. Compare claim to request body brand_id; mismatch → 403
3. Parse request with Zod; failure → 422
4. Query image_prompt_patterns via cosine similarity (pgvector <=> operator) WHERE brand_id = $1 AND (niche_filter IS NULL OR niche = niche_filter) ORDER BY embedding <=> $2 LIMIT 5
5. Top result with distance < 0.3 → cache_status = hit; return with pattern_recipe
6. Top result with distance >= 0.3 → cache_status = miss; return closest_match metadata only
7. Emit OTel span + structured log

Failure modes:
- DB connection failure: 503 with retry-after header (10s); log via Sentry with severity "warning"; no retry on this layer (caller retries)
- pgvector extension missing: 500 with body { error: "pattern_substrate_unavailable" }; Sentry severity "fatal"; alert PagerDuty
- Concurrent vacuum on patterns table: read may return stale result up to 5min — acceptable (cache lookup tolerates staleness); no special handling
- brand has zero patterns: returns cache_status = miss with closest_match_pattern_id = null; not an error

Edge cases:
- Empty brief_embedding array: 422 (Zod min length 1536)
- niche_filter = "" (empty string): treated as null; query without niche filter
- brand_id of deleted brand: RLS returns 0 rows; cache_status = miss with null closest_match

Tests: 5 behavioral tests in __tests__/lookup.test.ts
1. Happy path cache hit (distance < 0.3) — uses Supabase test schema + 1 seeded pattern
2. Happy path cache miss (distance > 0.3) — same setup, dissimilar brief
3. Cross-tenant denial — JWT for brand A queries brand B id, expect 403
4. Empty patterns for brand — fresh brand, expect miss with null closest_match
5. Niche filter applied — 2 patterns seeded (matching + non-matching niche), expect filter applied

CI: pipeline stage "behavioral_tests", runs against Supabase test schema in container.

Acceptance: Lint pass + typecheck pass + all 5 tests green + no hardcoded model names found via `grep -E "(gpt|claude|flux|nano-banana|ideogram|seedream)" apps/web/app/api/studio/pattern-cache/` (zero hits) + RLS test confirms 403 on cross-tenant attempt.
```

**Why this passes ZCBR:**
- ZC-1: No forbidden phrases anywhere normative
- ZC-2: Every entity cited (Lock 4, Lock 5, Lock 13, C-04, R20 v2 §4, brand_id, image_prompt_patterns table)
- ZC-3: Full API contract (auth, idempotency, rate limit, all status codes, request + response shapes, side effects, observability)
- ZC-4: Failure modes named (DB connection, pgvector missing, concurrent vacuum, zero patterns) with rollback/retry/logging behavior
- ZC-5: Edge cases named (empty embedding, empty string niche, deleted brand)
- ZC-6: Dependencies version-pinned (@supabase/supabase-js@^2.39, drizzle-orm@^0.30, pgvector via @neondatabase/serverless). Provider Registry not needed because this is a DB query not an AI call.
- ZC-7: Locks & Decisions Invoked section present (Lock 4, 5, 13, C-04)
- BR-1: File location stated (`apps/web/app/api/studio/pattern-cache/lookup/route.ts`)
- BR-2: No DB migration in this slice (read-only query), so BR-2 trivially passes
- BR-3: 5 behavioral tests stated by name + setup, framework implicit (Vitest from convention)
- BR-4: OTel span + structured log fields + Sentry severities stated
- BR-5: External interaction = Supabase only, auth via JWT + RLS, no rate limit issue
- BR-6: Concurrency addressed (concurrent vacuum), staleness tolerance stated
- BR-7: Acceptance is mechanical grep-able commands

### Example 2 — ZCBR-FAILING spec snippet (synthetic for illustration, with annotation)

```markdown
## Pattern Cache

The system checks the cache before generating new images. This should be fast and reliable.

When a user submits a brief, look it up in the patterns table. If a similar pattern exists, return it. Otherwise route to the Art Director.

Use whatever embedding model is appropriate. Handle errors gracefully and log as needed. Make sure to respect tenant boundaries.
```

**Why this fails ZCBR (annotation):**

- ZC-1 FAIL: "should be fast and reliable" (subjective), "whatever embedding model is appropriate" (no decision made), "Handle errors gracefully" (forbidden), "log as needed" (forbidden), "make sure to respect tenant boundaries" (no mechanism stated)
- ZC-2 FAIL: "patterns table" referenced without citing R20 schema; "Art Director" referenced without citing R24 or B-X.YY
- ZC-3 FAIL: No API shape, no auth, no status codes, no idempotency, no rate limit, no side effects
- ZC-4 FAIL: "Handle errors gracefully" — no failure modes named, no retry, no logging, no rollback
- ZC-5 FAIL: No edge cases (empty brief? cross-tenant query? deleted brand? concurrent writes?)
- ZC-6 FAIL: "whatever embedding model is appropriate" violates Lock 19 (no Provider Registry citation); no library versions; no service citations
- ZC-7 FAIL: No Locks & Decisions Invoked section
- BR-1 FAIL: No file location stated
- BR-2 FAIL: No migration plan even though patterns table is referenced
- BR-3 FAIL: No test scenarios
- BR-4 FAIL: No observability hooks ("log as needed" is not specification)
- BR-5 FAIL: No external interaction details
- BR-6 FAIL: No concurrency concerns addressed
- BR-7 FAIL: No acceptance criteria

This is the kind of spec that would have produced the Manus-quality output that the PO rejected in May 2026. ZCBR exists specifically to make this kind of spec impossible to commit.

---

## 7. ZCBR Compliance Lifecycle

A spec moves through these states:

1. **Drafting** — Architect Claude is writing or rewriting the spec. Not yet ZCBR-validated. Cannot be cited by any Bullet directive.

2. **Self-validation in progress** — Architect Claude is running the 14-item checklist. Spec exists in /docs/research_specs/ but with `ZCBR Status: DRAFT — self-validation in progress`. Still cannot be cited.

3. **Self-validation passed** — All 14 items pass. Header reads `ZCBR Status: PASSED YYYY-MM-DD by Architect Claude self-validation`. Spec can now be cited by Bullet directives, which will trigger Checkpoints 2 + 3 downstream.

4. **In use** — Spec is cited by an active Bullet directive. Reviewer Claude has run Checkpoint 2 + Kimi has run Checkpoint 3 at directive intake.

5. **Superseded** — Spec replaced by newer version. Header updated to `ZCBR Status: SUPERSEDED by Rxx v2 on YYYY-MM-DD`. Bullets citing this version must update to new version before next directive.

6. **Deprecated** — Spec no longer relevant. Marked with `ZCBR Status: DEPRECATED — see [replacement] or [removed entirely]`. No new Bullet may cite.

State transitions are tracked in the spec header and in Notion Decisions Database (cataloged at session end per standing rule).

---

## 8. Anti-Patterns That Fail ZCBR Even Without Triggering Specific Conditions

Some spec patterns are intrinsically un-ZCBR even if they happen to pass the 14-item checklist by accident. Validator rejects on sight:

- **Wall of prose with no structure.** If the spec is 10 paragraphs with no headers, no tables, no enumeration — it fails ZCBR regardless of content quality. Builders need scan-able structure.
- **Architecture rationale presented as implementation spec.** A document that explains *why* something is the right architecture without specifying *what* the builder writes is a design rationale doc, not an R-spec. Move rationale to a separate "Background" section; keep the spec normative.
- **Spec depends on a non-existent or non-ZCBR R-spec.** "Implementation follows R29 PAL §3" when R29 PAL has ZCBR Status: DRAFT means this spec is also non-ZCBR by transitive closure. Either rewrite the dependency first or include the dependency content inline.
- **Spec defines a system without defining the trigger.** "When a brief is submitted, the system does X." Who calls this? What's the entry point? Trigger must be stated (HTTP endpoint, Inngest event, scheduled job, manual admin action).
- **Spec uses passive voice for actions.** "The asset is saved to Brand Vault." Who saves it? The DAG step? The API route? The frontend? Active voice with named actors required.
- **Spec has placeholder examples with `<TBD>` or `foo bar baz`.** All examples must be realistic enough that the builder could copy-paste them as a starting point.

---

## 9. ZCBR for Existing R-specs (transitional rule)

The repo currently contains 37 R-specs authored or re-authored by Manus during the May 3 ZCBR foundational rewrite. None of these have been validated against this formal ZCBR_STANDARD because this standard didn't exist until now.

Transitional rule:
1. Existing R-specs are marked `ZCBR Status: PENDING RE-VALIDATION` until Architect Claude validates each against this standard.
2. No new Bullet directive can cite an R-spec with status `PENDING RE-VALIDATION` until the spec passes validation.
3. Bullets currently scoped against pre-existing R-specs (i.e. nothing has shipped yet against them) wait until validation completes.
4. The audit + rewrite work is the subject of Part 3 of the original directive (Master Build Sequence v1.1 Cross-cutting Bullets B-XC.17 onward — to be added after PO ratifies this standard).

---

## 10. Becoming Foundation Lock 20

Upon PO ratification of this document, the following text becomes **Foundation Lock 20: ZCBR-Validated Specs Required**:

> No Bullet ships against an unvalidated R-spec. Every R-spec referenced by any Bullet directive must carry a `ZCBR Status: PASSED` header from Architect Claude self-validation. Reviewer Claude rejects Bullet directives that cite non-passing R-specs at §9 Gate intake. Kimi pre-flight validation refuses to start code on Bullets whose cited R-specs do not pass the `zcbr-spec-validation` skill check. Manus-authored R-specs are reference inputs only; the canonical authoritative version of any R-spec is the Architect Claude version.

This lock is added to `/docs/governance/FOUNDATION_LOCK.md` and cataloged to the Notion Foundation Locks Database with Category: Process.

---

## 11. Update Authority

This document is updated by Architect Claude only, with PO ratification logged in Notion. Updates produce:
1. Diff against previous version
2. New version commit by Manus to `/docs/governance/ZCBR_STANDARD.md`
3. Notion Decisions Database entry capturing the change
4. CLAUDE.md authority chain updated if hierarchy changes

The 14-item checklist itself (Section 4) is the most stable part of this standard. Changes to the checklist require PO re-ratification because every existing ZCBR-PASSED spec must be re-validated under the new checklist.

---

## 12. Acceptance Criteria for This Document

PO ratifies ZCBR_STANDARD.md by confirming:

1. The Core Definition (Section 1) accurately captures what "Zero-Clarification" and "Builder-Ready" should mean for VIYO
2. The 14-item checklist (Section 4) is exhaustive enough to catch the kind of weak Manus output that triggered the May 2026 frustration, without being so strict that it blocks legitimate work
3. The validation protocol (Section 5) covers Architect + Reviewer + Kimi without redundancy
4. Examples (Section 6) clearly demonstrate pass and fail patterns
5. The transitional rule (Section 9) handles existing R-specs sensibly
6. Foundation Lock 20 wording (Section 10) is accepted as authoritative

If PO finds gaps: adjust this document, don't redefine ZCBR from scratch. If a checklist item is too strict or too loose, edit it specifically with rationale.

---

*End of ZCBR_STANDARD.md v1.0*
