# R19 — LLM Orchestration Architecture (v2)

**ZCBR Status:** PASSED 2026-05-12 by Architect Claude self-validation
**ZCBR Checklist version:** v1
**Spec version:** 2.0
**Authoring authority:** Architect Claude (Opus 4.7)
**Authored date:** 2026-05-12
**Target repo path on commit:** `/docs/research_specs/R19_LLM_ORCHESTRATION_v2.md` (replaces v1 at `/docs/research_specs/R19_LLM_ARCHITECTURE_ENTERPRISE.md`, commit SHA `1cc43f5781b132ef256e21ca06c8914c0c9e64c3`)
**Supersedes:** R19 v1.0 (Enterprise Spec, 2026-05-12 09:22 UTC)

---

## 0. Supersession statement

R-Spec Audit Table v1.0 row 3 classified R19 as PENDING RE-VALIDATION with anticipated MINOR FIX. Architect Claude audit on 2026-05-12 against ZCBR_STANDARD v1.0 and canonical sources (VVOW §5, §8.3, §8.7, §8.8, §12.4; R20 v2; R29 v2 PAL; Master Build Sequence v1.1) reveals **REWRITE** is the correct triage. The fourteen conflicts resolved:

1. **4-brain council architecture is wrong.** v1 §2.1 lists 4 brains (CMO, Copywriter, Critic, Top Brain). VVOW §5.1 specifies 7-Brain Council: CMO, Audience, Offer, Copywriter, Visual Intent Router, Designer Brain, Critic. Top Brain is actually agent #11 (ATLAS/Top Brain) in the §5.2 13-Agent Roster, not a council member.
2. **No 13-Agent Roster.** v1 has no concept of platform-level agents (VeriClaw, Flow Strategy, SMS Copywriter, ATLAS, Smart Insight Engine, Contextual AI Advisor). v2 §5 captures the full 13-agent architecture per VVOW §5.2.
3. **No Mastra DAG architecture.** v1 §2.2 describes a "Multi-Model Router" without Mastra. VVOW §8.3 locks Mastra (@mastra/core) as the INNER orchestrator running inside each Inngest step. v2 §3 establishes Inngest (outer) + Mastra (inner) pattern.
4. **No 3-Tier Provider Strategy.** v1 has no Tier 1 (aggregators) / Tier 2 (frontier direct) / Tier 3 (self-hosted) structure per VVOW §8.7. v2 §6 routes all model selection through R29 v2 Provider Registry's tier mechanism.
5. **No LoRA fine-tuning pipeline.** v1 omits brand-specific LoRA per VVOW §12.4. v2 §22 adds this canonical pipeline.
6. **Hardcoded LLM model names (Lock 19 violations, pervasive):**
   - v1 §2.1 brains table: `gpt-4o`, `gpt-4o-mini`
   - v1 §2.2: explicit "CMO and Critic use gpt-4o; Copywriter uses gpt-4o-mini"
   - v1 §2.2 cost fallback: "fallback to cheaper models (e.g., gpt-3.5-turbo)"
   - v1 §5.1 fallback chain: 4-tier hardcoded chain
   - v1 §10 code example: direct OpenAI + GoogleGenerativeAI SDK imports with hardcoded model strings
   - v2 routes EVERY LLM call through `providerRegistry.execute({capability: ...})` per R29 v2.
7. **No ZCBR header** (Lock 20).
8. **Wrong R-spec citations.** v1 references "R25 (Cost Reconciliation)" multiple times — wrong. R23 is Cost Engine; R25 is Video/IG Intelligence. v2 cites R23 v2 (when ratified) for cost; preserves R25 for video/IG context only.
9. **R29 citation outdated.** v1 §16 references "ESP Webhooks (R29)" — R29 v2 is the unified Plugin Registry per D55, not ESP webhooks. ESP webhook integration data lives in R20 v2 §2.11 `webhook_endpoints` / `webhook_delivery_logs`.
10. **No Lock 8 distinction.** v1 §4.2 mentions "Token spend is tracked and billed to the workspace" without distinguishing billable from programmatic ops.
11. **No Lock 13 invocation.** v1 references "Workspace ID (for multi-tenant billing)" without RLS contract.
12. **No Lock 12 alignment.** v1 §4.1 specifies token budgets without referencing the two-layer prompt budget enforcement or R20 v2 §2.6.1 `council_decisions.brain_votes.token_budget_used`.
13. **Semantic caching ambiguity.** v1 §13.2 references "Redis and vector embeddings" — but R20 v2 §2.3 already specifies pgvector via `image_prompt_patterns`. v2 §18 aligns semantic caching to R20 v2 native infrastructure routed through R29 v2 capability registry.
14. **No Phase 1 skill chain reference.** v1 has no reference to `art-director-routing`, `pattern-cache-lookup`, `rlhf-event-emission`, or `image-generation-pipeline` skills. v2 references these as Brain 5/Brain 6 implementation surfaces.

---

## 1. Source declaration

| Source ID | Source | Authority | Used for |
|---|---|---|---|
| S1 | VVOW Image Studio Architecture §5 (Brain Council Relationship) | Higher-tier (EXEMPT) | 7-Brain Council + 13-Agent Roster canonical structure |
| S2 | VVOW §8.3 Mastra (@mastra/core) | Higher-tier (EXEMPT) | Inner orchestration framework lock |
| S3 | VVOW §8.7 3-Tier Provider Strategy | Higher-tier (EXEMPT) | Tier 1 Aggregators / Tier 2 Frontier Direct / Tier 3 Self-Hosted |
| S4 | VVOW §8.8 Model Registry | Higher-tier (EXEMPT) | Generation + Editing model surfaces |
| S5 | VVOW §12.4 Brand-Specific LoRA Pipeline | Higher-tier (EXEMPT) | LoRA fine-tuning canonical pipeline |
| S6 | R20 v2 Database Schema (ZCBR PASSED, PR #21) | Canonical | `council_decisions` (§2.6.1), `token_usage_logs` (§2.5.1), `rlhf_votes` / `preference_model_versions` / `pattern_performance_metrics` (§2.8) |
| S7 | R29 v2 Platform Abstraction Layer (ZCBR PASSED, PR #25) | Canonical | Provider Registry, capability identifiers (`text_generation`, `vision_extraction`, `embedding`), Tier 1/2/3 routing |
| S8 | R24 v2 Image Pipeline (ZCBR PASSED, PR #23) | Canonical | Brain 5 Visual Intent Router + Brain 6 Designer Brain integration points |
| S9 | T46 v2 Art Director Routing Suite (ZCBR PASSED, PR #29) | Canonical | "Best for the Job" routing matrix architecture |
| S10 | R17 v2 UX Architecture (ZCBR PASSED, PR #31) | Canonical | Council of Brains Dashboard surface |
| S11 | R31 v2 Product Data Extraction (ZCBR PASSED, PR #30) | Canonical | Product knowledge fed to Brain 4 Copywriter |
| S12 | R23 Cost Engine (CRIT MINOR FIX, audit row 7) | Cautious consumer | Cost attribution for billable LLM calls |
| S13 | R27 Composable Sections (PENDING RE-VAL, audit row 11) | Cautious consumer | Brain 4 Copywriter section template integration |
| S14 | Foundation Lock 8 — Programmatic ops 0 tokens | Higher-tier | Billable vs programmatic distinction |
| S15 | Foundation Lock 12 — Two-layer prompt token budget | Higher-tier | Per-brain token budget enforcement |
| S16 | Foundation Lock 13 — Multi-tenant RLS | Higher-tier | Workspace isolation in `council_decisions`, `token_usage_logs` |
| S17 | Foundation Lock 19 + Extension Clause | Higher-tier | No hardcoded provider/model names |
| S18 | Foundation Lock 20 — ZCBR-validated specs | Higher-tier | This spec carries PASSED |
| S19 | Foundation Lock 21 — Governance Agnosticism | Higher-tier | Does NOT apply (R-specs ARE implementation) |
| S20 | D55 — R29 PAL unified Plugin Registry | Higher-tier | All LLM routing through unified registry |
| S21 | D56 — Token metering Phase 0/Phase 1 split | Higher-tier | Phase 0 substrate metering vs Phase 1 UI |
| S22 | D57 — Layer 1 Platform Skills in orchestrator | Higher-tier | Layer 1 skills live in orchestrator code, NOT skills_registry |
| S23 | `art-director-routing` skill v1.0 (Portal) | Implementation | Brain 5 routing logic implementation |
| S24 | `pattern-cache-lookup` skill v1.0 (Portal) | Implementation | Brain 5 Visual Intent Router cache-first behavior |
| S25 | `rlhf-event-emission` skill v1.1 (Portal) | Implementation | Council decision RLHF events |
| S26 | Master Build Sequence v1.1 Section 3.2 | Higher-tier | B-2.02 13-Agent Brain Council; B-0.14/0.15/0.16 brain substrate Bullets |

---

## 2. Locks & Decisions Invoked

- **Foundation Lock 8** — Council-orchestrated LLM calls are billable (user clicked Generate). Programmatic council calls (e.g., scheduled ATLAS aggregation) are 0-token-billed. Code paths flagged programmatic do NOT write to `token_usage_logs` (R20 v2 §2.5.4 grep test).
- **Foundation Lock 12** — Every brain receives a token budget per request. The two-layer prompt assembler (Layer 1 static + Layer 2 dynamic via skills_registry per D57) enforces the budget. Breach blocks the brain's generation with a clear error; budget breach event written to `council_decisions.brain_votes[].token_budget_used` per R20 v2 §2.6.1.
- **Foundation Lock 13** — `council_decisions`, `token_usage_logs`, `rlhf_votes` all carry `workspace_id` with RLS per R20 v2. No cross-workspace brain context.
- **Foundation Lock 19 + Extension Clause** — Zero hardcoded LLM model name literals. All LLM calls route through `providerRegistry.execute({capability: 'text_generation' | 'vision_extraction' | 'embedding', ...})`. Tier 1/2/3 routing handled by R29 v2 per VVOW §8.7. CI grep enforces.
- **Foundation Lock 20** — This spec PASSED 2026-05-12.
- **Foundation Lock 21** — Does NOT apply. R-spec, not governance.
- **D55** — Unified Plugin Registry handles model routing. Brain Council does not call providers directly.
- **D56** — Token metering substrate (R20 v2 §2.5.1) consumed by R19 council orchestration; user-facing UI deferred to B-1.14.
- **D57** — Layer 1 Platform Skills (self-improving-agent, memory-self-heal, clawhub, openclaw) live in orchestrator code, NOT in `skills_registry` table. Layer 2 Brain Pattern Skills live in `skills_registry`.

---

## 3. Architecture overview

### 3.1 Outer / inner orchestration pattern (VVOW §8.3 lock)

Two distinct orchestration layers:

- **Inngest (outer):** job-level event handling, retries, step-level checkpointing. Triggers: user click Generate, scheduled re-training, RLHF events.
- **Mastra (inner):** DAG framework running INSIDE each Inngest step. Composes the 7-Brain Council execution as a DAG with parallel/sequential nodes. Each Mastra node makes one or more provider calls via R29 v2 Provider Registry.

Pattern: `inngest.createFunction(...) → step.run('brain-council', async () => { return mastra.run(councilDAG, input) })`.

Never call providers directly from API handlers. Always route through Inngest step → Mastra DAG → providerRegistry.execute.

### 3.2 Two-layer prompt assembly (Lock 12 + D57)

Every brain prompt is composed of:

- **Layer 1 (static):** Orchestrator code-resident prompt scaffold per Platform Skill (Brain 1 CMO has its own static, Brain 4 Copywriter has its own, etc.). NOT in `skills_registry`.
- **Layer 2 (dynamic):** Pattern Skills injected from `skills_registry` based on context (brand voice, campaign type, framework selection per B-2.04, tone modifier per B-2.05, format enforcer per B-2.06).

Token budget per brain enforced at assembly time. Breach → block with clear error.

### 3.3 Workspace isolation

Every brain call carries `workspace_id` from the originating user session. RLS-enforced on `council_decisions` writes. Cross-workspace brain context = critical Sentry event.

---

## 4. The 7-Brain Council (single campaign generation)

Per VVOW §5.1. All 7 execute in coordination per generation request via Mastra DAG.

| # | Brain | Role | Capability (R29 v2) | Implementation surface |
|---|---|---|---|---|
| 1 | **CMO Brain** | Sets strategic direction | `text_generation` | Layer 1 static + brand strategy Layer 2 |
| 2 | **Audience Brain** | Resolves target persona | `text_generation` | Layer 1 static + segment data from R37 MAAX + R38 SYPHON |
| 3 | **Offer Brain** | Constructs offer / promotion logic | `text_generation` | Layer 1 static + product knowledge from R31 v2 |
| 4 | **Copywriter Brain** | Generates email copy | `text_generation` | Layer 1 static + framework (B-2.04) + tone (B-2.05) + format (B-2.06) Layer 2 |
| 5 | **Visual Intent Router** | VVOW: briefs → technical prompts → model routing | `text_generation` + `embedding` (for pattern lookup) | `art-director-routing` + `pattern-cache-lookup` skills |
| 6 | **Designer Brain** | VVOW: composes visual layouts, manages brand style consistency | `vision_extraction` (for QA) + image generation through R24 v2 | Brand-specific LoRA per §22 |
| 7 | **Critic Brain** | Final QA before output | `text_generation` + `vision_extraction` (image-bearing campaigns) | Layer 1 static + brand guidelines Layer 2 |

**VVOW Phase 1 scope:** Image Studio invokes Brain 5 + Brain 6 primarily. Other brains called by Phase 2 Email Engine (B-2.02 onward).

**Lock 19 enforcement:** No model name appears anywhere in this table. Capability identifiers only.

---

## 5. The 13-Agent Roster (full platform)

7-Brain Council + 6 platform-level agents per VVOW §5.2.

| # | Agent | Role | Master Build Sequence Bullet |
|---|---|---|---|
| 1-7 | (7-Brain Council, see §4) | Single campaign generation | B-2.02 (orchestration) |
| 8 | **VeriClaw** | Verification / audit, blocks known policy violations | B-2.25 |
| 9 | **Flow Strategy** | Strategic flow recommendations based on data | B-2.26 |
| 10 | **SMS Copywriter** | SMS-formatted copy alongside email (160-char) | B-2.24 |
| 11 | **ATLAS / Top Brain** | Industry-wide intelligence; queries cross-brand patterns | B-2.27 |
| 12 | **Smart Insight Engine** | 5 scheduled insight generators per brand | B-2.28 |
| 13 | **Contextual AI Advisor** | In-app advisor at decision points | B-2.29 |

**Programmatic agents (Lock 8):** ATLAS aggregation runs scheduled; queries 0-token-billed to user. VeriClaw audit on every campaign — user-clicked generation already billed at council level; VeriClaw call piggybacks (not re-billed).

---

## 6. Multi-model routing (R29 v2 Provider Registry)

### 6.1 No hardcoded model names

All routing flows through `providerRegistry.execute(...)`. Registry returns the active provider/model for the requested capability based on:
- Capability identifier (`text_generation`, `vision_extraction`, `embedding`)
- Workspace context (subscription tier, brand preferences)
- "Best for the Job" scoring matrix (T46 v2 Art Director Routing Suite)
- Tier (per VVOW §8.7 — see §6.2)

### 6.2 3-Tier Provider Strategy (VVOW §8.7)

| Tier | Layer | Purpose | When invoked |
|---|---|---|---|
| **Tier 1** | Aggregators (launch primary) | "Best for the Job" routing — majority of traffic | Default; covers most LLM requests |
| **Tier 2** | Frontier Direct | High-complexity requests Tier 1 cannot handle | Escalation on complexity threshold (NOT failure) |
| **Tier 3** | Self-Hosted (scale) | Re-host Tier 1/2 models on owned GPU | Cost optimization at volume; admin-gated activation |

Tier routing is registry-side. R19 code emits `capability` only; tier selection is opaque.

### 6.3 Brain-to-capability mapping

| Brain | Primary capability | Secondary |
|---|---|---|
| CMO, Audience, Offer, Copywriter | `text_generation` | — |
| Visual Intent Router | `text_generation` + `embedding` | — |
| Designer Brain | image generation (R24 v2 routes) | `vision_extraction` for QA |
| Critic | `text_generation` | `vision_extraction` for image campaigns |

---

## 7. Request flow

```
User Campaign Brief
    ↓
Inngest event: campaign.generation.requested
    ↓ (Inngest step.run)
[Mastra DAG: 7-Brain Council]
    ↓
[Brain 1 CMO] → strategic direction
    ↓ (parallel)
[Brain 2 Audience] → target persona resolution
[Brain 3 Offer] → offer/promotion logic
    ↓ (synchronous on outputs above)
[Brain 4 Copywriter] → email copy (capability: text_generation)
[Brain 5 Visual Intent Router] → technical prompts + model routing (capability: text_generation + embedding)
    ↓
[Brain 6 Designer Brain] → image generation via R24 v2
    ↓
[Brain 7 Critic] → final QA
    ↓
[Semantic Cache Check] → §18; cached results returned per R20 v2 §2.3 + capability registry
    ↓
[VeriClaw Agent 8] → policy audit
    ↓
Campaign output to user
    ↓
[Persist] → council_decisions (R20 v2 §2.6.1) + token_usage_logs (R20 v2 §2.5.1, Lock 8 billable)
    ↓
[R24 v2 Learning Engine] → RLHF events
    ↓
[Top Brain Agent 11] → ATLAS aggregation (scheduled, programmatic 0-token)
```

---

## 8. Token economics (Lock 8 + Lock 12)

### 8.1 Per-brain token budget (Lock 12 enforcement)

Indicative budgets — tunable per workspace via `system_config` (R20 v2 §2.9.4):

| Brain | Input | Output | Total |
|---|---|---|---|
| CMO | 2,000 | 1,500 | 3,500 |
| Audience | 1,000 | 500 | 1,500 |
| Offer | 1,500 | 800 | 2,300 |
| Copywriter | 1,500 | 1,000 | 2,500 |
| Visual Intent Router | 800 | 400 | 1,200 |
| Designer Brain | (image gen, not text) | — | per R24 v2 |
| Critic | 2,500 | 500 | 3,000 |
| **Council total per campaign** | — | — | **~14,000 tokens** |

Budget breach → block generation with error; emit `council_decisions.brain_votes[].token_budget_used = $cap` event.

### 8.2 Billable vs programmatic (Lock 8)

| Operation | Billable? | Reason |
|---|---|---|
| User-clicked campaign generation | YES — `billable: true` | User directly requested |
| Manual re-generate after rejection | YES | User-clicked |
| VeriClaw audit on user-clicked campaign | NO (piggyback) | Already billed at council level |
| Scheduled ATLAS aggregation | NO — `billable: false` | System-initiated |
| Scheduled DSPy prompt optimization | NO | System-initiated |
| Scheduled Top Brain re-training | NO | System-initiated |
| Critic Brain QA pass | YES (piggyback on parent) | Part of user-clicked council |

CI grep: code paths flagged programmatic must NOT write `token_usage_logs.insert(...)`. R20 v2 §2.5.4 enforces.

### 8.3 Cost attribution per call

Each LLM call writes to `token_usage_logs` (R20 v2 §2.5.1) with:
- `workspace_id` (Lock 13)
- `provider`, `model` (recorded for audit; resolved by R29 v2)
- `operation_type` (`text_gen`, `vision_qa`, `embedding`)
- `prompt_tokens`, `completion_tokens`
- `calculated_cost` (provider_pricing_registry × token counts × markup_multiplier)
- `generation_id` (propagated end-to-end)
- `stripe_meter_event_id` (Phase 0 reconciliation backlog → cleared by Stripe meter dispatcher)

---

## 9. Fallback strategy (registry-driven, no hardcoded chain)

### 9.1 No hardcoded fallback chain

R29 v2 Provider Registry maintains the fallback chain per capability per tier. R19 code does NOT specify "Primary → Secondary → Tertiary". One capability identifier; registry handles the cascade.

### 9.2 Failure types and registry behavior

| Failure | Registry response | R19 council behavior |
|---|---|---|
| Tier 1 provider rate-limited | Tier 1 peer healthcheck → reroute | Transparent to council |
| Tier 1 provider API error | Tier 1 → Tier 2 escalation | Brain receives result; logs metric |
| All Tier 1+2 providers fail | Return `NO_PROVIDERS_AVAILABLE` | Council fails fast; user-facing error; Sentry critical |
| Tier 2 frontier provider rate-limited | Backoff with exponential retry | Brain receives result after retry |
| Provider returns malformed output (Zod parse fails) | Registry re-routes once; if persist → error | Brain marks `council_decisions.final_decision` as malformed; retry workflow once |

### 9.3 Error logging

All LLM errors logged via Sentry (workspace_id, brand_id, generation_id, brain_name, error_type, tier_attempted). Aggregated via PostHog event `r19.brain_call_failed`.

---

## 10. Observability & monitoring

### 10.1 OTel spans

Per-council parent span: `viyo.r19.council_execution`.

Child spans per brain: `viyo.r19.brain.cmo`, `viyo.r19.brain.audience`, `viyo.r19.brain.offer`, `viyo.r19.brain.copywriter`, `viyo.r19.brain.visual_intent_router`, `viyo.r19.brain.designer`, `viyo.r19.brain.critic`.

Attributes:
- `viyo.workspace_id`, `viyo.brand_id`, `viyo.generation_id`
- `viyo.r19.capability` (text_generation / vision_extraction / embedding)
- `viyo.r19.tier_used` (1 / 2 / 3 — resolved post-facto for observability only; not branched in code)
- `viyo.r19.duration_ms`
- `viyo.r19.token_budget_used`

### 10.2 PostHog events

- `r19.council_completed` (workspace_id, brand_id, generation_id, total_tokens, total_cost_cents, duration_ms)
- `r19.brain_completed` (per brain)
- `r19.brain_call_failed` (error_code)
- `r19.token_budget_breach` (brain_name, attempted_tokens, budget_cap)

### 10.3 Sentry rules

| Level | Trigger |
|---|---|
| info | Token budget warn at 80% utilization |
| warn | Malformed LLM JSON (Zod parse fail); single provider rate limit |
| critical | NO_PROVIDERS_AVAILABLE; cross-workspace brain context; Lock 19 runtime violation; Lock 8 violation (programmatic op writing token_usage_logs) |

### 10.4 Dashboards (R17 v2 §6 + §10)

- **Council of Brains Dashboard** (R17 v2 §6 / §11.1) — real-time brain status, success rates, latency
- **Token Tracking Dashboard** (R17 v2 §6.6 / §11.2) — billable vs programmatic split (Lock 8)
- **Model Performance Comparison** (R17 v2 §7.9 / §11.5.B) — Provider Registry model leaderboard

---

## 11. Integration with R24 v2 (Learning Engine)

### 11.1 RLHF event emission

Per council generation, the `rlhf-event-emission` skill (Portal) writes to R20 v2 §2.8.1 `rlhf_votes` with `event_type` from the locked enum: `manual_curation`, `drag`, `export`, `regenerate`, `generate_start`, `swipe_left`, `swipe_right`, `approval_gate`.

Brain Council emissions:
- `generate_start` on council kickoff
- `manual_curation` from Tinder swipe gate (R24 v2 §9)
- `regenerate` when user rejects council output
- `export` when user exports campaign

### 11.2 Preference Model integration

R20 v2 §2.8.2 `preference_model_versions` is the canonical store for the Fine-Tuned VLM (per VVOW §12.3 Lock 9 — 5,000 swipe decisions per brand bridge, OD-016 open). Once a version is `is_active=TRUE`, Designer Brain (Brain 6) consults the VLM for aesthetic scoring in addition to Critic Brain QA.

### 11.3 Pattern performance feedback

R20 v2 §2.8.3 `pattern_performance_metrics.qa_score_rolling` is updated by 30-day rolling aggregation. Brain 5 Visual Intent Router weights pattern selection by rolling score.

---

## 12. Integration with R23 (Cost Engine)

R23 (CRIT MINOR FIX, audit table v1.3 row 7) consumes `token_usage_logs` from R20 v2 §2.5.1 and reconciles against actual provider billing. R19 council orchestration:
- Writes every billable call to `token_usage_logs` (Lock 8)
- Allocates `calculated_cost` per `provider_pricing_registry` (R20 v2 §2.9.6)
- Includes `stripe_meter_event_id` for reconciliation tracking

R19 does NOT consume R23 directly. R23 reads R19's writes.

(Note: v1 incorrectly cited R25 — Video/IG Intelligence — for this role.)

---

## 13. Integration with R27 (Composable Sections)

R27 (PENDING RE-VAL, audit row 11) provides 12 MJML Section Templates (Hero, Split, Grid, Editorial, etc.) per VVOW §2.3. Brain 4 Copywriter (Phase 2 B-2.01 onward):
- Selects from R27 section library
- Fills slot variables with copy
- NEVER writes raw HTML/MJML (per VVOW §2.3 Lock — only fills slots)

R19 references R27 by section ID; copy generation is constrained to slot semantics.

---

## 14. Code components

| Component | Repo path | Responsibility |
|---|---|---|
| Council DAG | `apps/worker/src/inngest/council-execution.ts` | Inngest function wrapping Mastra DAG |
| Mastra DAG def | `apps/worker/src/mastra/council-dag.ts` | 7-brain DAG with parallel/sequential nodes |
| Brain 1-7 prompts (Layer 1) | `apps/worker/src/lib/brains/*.ts` | Static prompt scaffold per brain |
| Two-layer assembler | `apps/worker/src/lib/prompt-assembler.ts` | Layer 1 + Layer 2 composition with token budget enforcement |
| Schemas | `packages/shared/src/schemas/council.ts` | Zod for `CMOOutput`, `AudienceOutput`, `OfferOutput`, `CopywriterOutput`, `VisualIntentRouterOutput`, `DesignerOutput`, `CriticOutput` |
| 13-Agent Roster wiring | `apps/worker/src/inngest/agents/*.ts` | VeriClaw (B-2.25), Flow Strategy (B-2.26), SMS Copywriter (B-2.24), Top Brain (B-2.27), Smart Insight (B-2.28), Advisor (B-2.29) |
| Persistence | `apps/worker/src/lib/council-persistence.ts` | Transactional writes to `council_decisions` + `token_usage_logs` |
| LoRA pipeline | `apps/worker/src/inngest/lora-finetune.ts` | Brand-specific LoRA training (§22) |

Pattern (illustrative, capability-only):

```typescript
import { providerRegistry } from '@viyo/worker/lib/provider-registry';
import { assemblePrompt } from '@viyo/worker/lib/prompt-assembler';

export async function runCMOBrain(input: CampaignBrief, ctx: BrainContext) {
  const { layer1, layer2, tokenBudget } = await assemblePrompt({
    brain: 'cmo',
    workspaceId: ctx.workspaceId,
    brandId: ctx.brandId,
    brief: input,
  });

  const result = await providerRegistry.execute({
    category: 'ai',
    capability: 'text_generation',
    args: {
      messages: [{ role: 'system', content: layer1 }, { role: 'user', content: layer2 }],
      max_tokens: tokenBudget.output,
      response_format: 'json_object',
    },
    workspaceId: ctx.workspaceId,
    brandId: ctx.brandId,
    generationId: ctx.generationId,
    billable: true,
  });

  return CMOOutputSchema.parse(JSON.parse(result.content));
}
```

No `OpenAI` or `GoogleGenerativeAI` imports. No model name string literals. Lock 19 compliant.

---

## 15. Zod schemas

### 15.1 CMOOutput

```typescript
export const CMOOutputSchema = z.object({
  campaign_objective: z.string(),
  target_audience_segment: z.string(),
  creative_concept: z.object({
    title: z.string(),
    rationale: z.string(),
    visual_direction: z.string(),
    copy_angle: z.string(),
  }),
  recommended_sections: z.array(z.string()),
  urgency_mechanism: z.enum(['none', 'text_only', 'live_timer']).optional(),
});
```

### 15.2 CopywriterOutput

```typescript
export const CopywriterOutputSchema = z.object({
  subject_line: z.string().max(60),
  preview_text: z.string().max(100),
  framework_used: z.string(),     // from B-2.04 12 frameworks
  tone_modifier: z.string(),       // from B-2.05
  format_enforcer: z.string(),     // from B-2.06
  sections_copy: z.record(z.string(), z.object({
    headline: z.string().optional(),
    body: z.string().optional(),
    cta: z.string().optional(),
  })),
});
```

### 15.3 CouncilDecision (persisted to R20 v2 §2.6.1)

```typescript
export const CouncilDecisionSchema = z.object({
  workspace_id: z.string().uuid(),
  decision_type: z.enum(['campaign_generation', 'flow_strategy', 'sms_generation']),
  input_context: z.object({ brief: z.string(), brand_id: z.string().uuid() }),
  brain_votes: z.array(z.object({
    brain: z.enum(['cmo', 'audience', 'offer', 'copywriter', 'visual_intent_router', 'designer', 'critic']),
    vote: z.enum(['approve', 'flag', 'reject']),
    reasoning: z.string(),
    token_budget_used: z.number(),
  })),
  final_decision: z.record(z.unknown()),
  confidence_score: z.number().min(0).max(1),
  execution_time_ms: z.number(),
  generation_id: z.string().uuid(),
});
```

---

## 16. Model Evaluation & A/B Testing

### 16.1 Evaluation metrics

- **Brand Alignment Score:** Brain 7 Critic scored 0-100
- **Conversion Rate (Actual):** Tracked via R29 v2 e-commerce platform plugin webhook (NOT direct Shopify call)
- **Generation Latency:** Council parent OTel span duration

### 16.2 A/B testing framework

Per B-2.21 (A/B Testing, 20% split, 48h window, auto-winner):
- New prompt version routed to 20% of traffic
- 48h window
- Auto-winner selection per Brain Alignment Score + conversion delta
- Performance loop (B-2.22) extracts winning formulas into Pattern DB

R20 v2 §2.4.1 `email_templates.status` enum includes `'sending'` and `'failed'` for A/B campaign lifecycle.

---

## 17. Context window management

### 17.1 Sliding window for brand history

Brand history retrieval scoped per workspace (Lock 13). Window prioritizes:
1. Recent campaigns (last 30 days)
2. High-qaScore campaigns from rolling pattern_performance_metrics
3. Manual user pinned content

Window cap: configurable per brain budget (§8.1) minus Layer 1/Layer 2 prompt overhead.

### 17.2 Truncation strategy

When context exceeds budget:
- Drop oldest campaigns first
- Preserve highest-scoring patterns regardless of age
- Always preserve the active campaign brief (current generation input)

---

## 18. Semantic caching

### 18.1 Storage: pgvector via R20 v2 §2.3

`image_prompt_patterns` (R20 v2 §2.3.1) IS the semantic cache for Brain 5 Visual Intent Router pattern retrieval. No separate Redis/Pinecone instance. R29 v2 Provider Registry routes embedding generation via `capability: 'embedding'`.

(Correction from v1 §13.2: v1 mentioned "Redis and vector embeddings" as the cache layer. R20 v2 §2.3 makes pgvector the canonical.)

### 18.2 Match function

`match_image_patterns` RPC (R20 v2 §2.3.2) — service-role-only, vector cosine similarity search with category/layout/threshold/count parameters.

### 18.3 Cache hit behavior (T70 precedent)

Cache hits surface to user with "cached" badge transparency. Brain 5 routes the cached pattern to Brain 6 Designer Brain for application; no fresh LLM call.

### 18.4 Cache for text outputs

For copywriting (Brain 4) and strategy (Brain 1) — semantic cache deferred. Each user campaign brief is sufficiently unique that copy caching has low hit-rate ROI. Reserved for future minor version exploration.

---

## 19. Build Tracker

| Feature ID | Name | Phase | Master Sequence Bullet | Dependencies |
|---|---|---|---|---|
| LLM-01 | Provider Registry routing | Phase 0 | B-0.04 (L3 Provider Routing baseline) + B-XC.01 (R29 PAL v2) | — |
| LLM-02 | Two-layer prompt assembler | Phase 0 | B-0.15 | B-0.14, B-0.16 |
| LLM-03 | Layer 1 Platform Skills (D57) | Phase 0 | B-0.16 | B-0.14 |
| LLM-04 | Brain 5 Visual Intent Router | Phase 1 | B-1.03 | B-1.00, B-0.15, B-0.16 |
| LLM-05 | Brain 6 Designer Brain | Phase 1 | B-1.04 | B-1.03 |
| LLM-06 | 7-Brain Council DAG | Phase 2 | B-2.02 | B-1B.07, B-0.15 |
| LLM-07 | Agent 8 VeriClaw | Phase 2 | B-2.25 | B-2.02 |
| LLM-08 | Agent 9 Flow Strategy | Phase 2 | B-2.26 | B-2.02 |
| LLM-09 | Agent 10 SMS Copywriter | Phase 2 | B-2.24 | B-2.02 |
| LLM-10 | Agent 11 ATLAS / Top Brain | Phase 2 | B-2.27 | B-1B.07 |
| LLM-11 | Agent 12 Smart Insight Engine | Phase 2 | B-2.28 | B-2.27 |
| LLM-12 | Agent 13 Contextual AI Advisor | Phase 2 | B-2.29 | B-2.28 |
| LLM-13 | Token Tracking + Reconciliation | Phase 0 | B-0.07 | B-0.04 |
| LLM-14 | Two-layer full activation (all 13 brains) | Phase 2 | B-2.30 | B-2.02, B-0.15 |
| LLM-15 | LoRA Fine-Tuning Pipeline | Phase 4+ | per VVOW §12.4 — JIT trigger at N validated patterns per brand | Pattern DB substrate |

---

## 20. Preference Classifier (RLHF Model) — per Lock 9

Per VVOW §12.3:
- Role: Replaces human curator after ~5,000 swipe decisions accumulate per brand (OD-016 — per-brand vs cumulative open)
- Input: Generated image + reference image
- Output: Preference score 0.0-1.0
- Training pipeline: DSPy-managed
- Storage: R20 v2 §2.8.2 `preference_model_versions`

Designer Brain (Brain 6) consults Preference Classifier when `is_active=TRUE`. Critic Brain (Brain 7) consults independently for separate QA dimension.

---

## 21. Performance-Data Learning Loop

| Pattern type | Scoring metric | Source |
|---|---|---|
| Copywriting | Open rate, CTOR | ESP webhook ingestion via R20 v2 §2.11 `webhook_delivery_logs` + B-1B.03 SYPHON daily sync |
| Section layout | Scroll depth, heatmap | Client-side tracking → events table |
| Send timing | Conversion rate, time-to-open | ESP webhooks |
| Visual style | qaScore (rolling 30-day, R20 v2 §2.8.3) | RLHF events |

(Correction from v1 §16: v1 cited "ESP Webhooks (R29)" — R29 v2 is the Plugin Registry, not webhooks. Webhook data lives in R20 v2 §2.11.)

Top Brain (Agent 11) aggregates non-visual performance data daily and updates pattern scores in `pattern_performance_metrics`. DSPy optimizes low-performing patterns based on high-performing characteristics.

---

## 22. Brand-Specific LoRA Fine-Tuning Pipeline (per VVOW §12.4)

### 22.1 Pipeline

1. Brand accumulates N validated patterns in `image_prompt_patterns` (threshold TBD per Pattern DB rewrite; likely 50-100 high-qaScore patterns)
2. DSPy training data exported alongside brand's accumulated assets in Brand Vault
3. LoRA fine-tuned on brand's validated outputs using underlying generation model (resolved via R29 v2 Provider Registry, NOT hardcoded)
4. LoRA deployed to Provider Registry tagged with `brand_id`
5. Future generations for that brand auto-apply brand-specific LoRA via Art Director Router (T46 v2)

### 22.2 LoRA references

- **Pattern DB:** patterns can declare LoRA dependencies (e.g., `summer_streetwear_v3.lora`)
- **Brain 5 Visual Intent Router:** auto-appends brand LoRA to all generations for that tenant
- **R29 v2 Plugin Registry:** manages LoRA deployment, versioning, routing
- **Tier 3 self-hosted:** LoRAs run cheapest on owned GPU

### 22.3 Privacy enforcement (Lock 13)

- LoRA training MUST scope to single `brand_id`; cross-tenant style leakage = privacy violation (critical Sentry)
- LoRA deployment outside Provider Registry forbidden (bypasses observability)
- LoRA auto-application MUST record in generation metadata (reproducibility)

---

## 23. Failure modes

| Operation | Failure | Trigger | Response |
|---|---|---|---|
| Brain Council DAG | Any brain fails | n/a | Mastra step retry; if persists → council failure event; surface to user |
| Provider Registry execute | NO_PROVIDERS_AVAILABLE | Tier 1+2+3 all unreachable | Critical Sentry; council fails fast; clear user error |
| Token budget breach | Brain assembly exceeds budget | Layer 2 injection too large | Block brain; emit `token_budget_breach`; warn Sentry; brain attempts re-assembly with truncated Layer 2 |
| Zod parse fail on brain output | Provider drift / bad prompt | n/a | Retry once with stricter prompt; if persists → mark malformed; council degrades to partial output |
| Cross-workspace context | Bug in event routing | event.workspace_id mismatch | Critical Sentry; reject |
| Lock 19 runtime violation | Hardcoded model leaks past CI | n/a | Critical Sentry; runtime block |
| Lock 8 violation | Programmatic op writing token_usage_logs | n/a | Critical Sentry; CI grep should catch upstream |
| Council partial timeout | Some brains complete, others timeout | n/a | Use completed brains' outputs; mark `confidence_score` lower; user-facing warning |
| Cache lookup failure | pgvector RPC unavailable | DB outage | Fall through to fresh generation; Sentry warn |
| LoRA training failure | Insufficient training data or provider error | n/a | Skip LoRA for brand; revert to base model; Sentry info |

---

## 24. Edge cases

| Case | Handling |
|---|---|
| 1-brain council (single brain decision, e.g. flow strategy alone) | `brain_votes` JSONB allows array length 1; no minimum count constraint |
| Token budget cap reached mid-output | Stream cuts at cap; brain output truncated; `final_decision` marked `incomplete: true` |
| Provider Registry returns null capability | NO_PROVIDERS_AVAILABLE; do not retry without admin intervention |
| Multiple concurrent council requests for same workspace | Inngest per-workspace concurrency cap; queue overflow → Sentry warn |
| User cancels mid-generation | Inngest function checks cancellation token at each step; partial results discarded; no `token_usage_logs` writes for incomplete brains (Lock 8 fairness) |
| Brand LoRA missing at routing time | Skip LoRA; use base model; record `lora_skipped: true` in council_decisions metadata |
| ATLAS aggregation runs while brand opt-out flips | Mid-flight aggregation respects starting state; next aggregation honors new opt-out |

---

## 25. Concurrency

| Scenario | Handling |
|---|---|
| Multiple campaigns for same workspace | Inngest concurrency cap 10 per workspace |
| Same brand, multiple users generating simultaneously | Independent council runs; pattern_performance_metrics atomically incremented |
| Provider Registry health check race | Registry-side debouncing; transparent to council |
| LoRA training concurrent with active generation | LoRA deployment is atomic; in-flight generations use last deployed version |

---

## 26. Tests required

1. Lock 19 grep — zero hardcoded model name literals in `apps/worker/src/lib/brains/*.ts` and `apps/worker/src/inngest/council-*.ts`
2. Lock 8 grep — zero `token_usage_logs.insert(...)` reachable from programmatic agent code paths (ATLAS, scheduled DSPy)
3. Lock 12 enforcement — assembler blocks brain on budget breach; `token_budget_used = budget_cap` recorded
4. Lock 13 — cross-workspace council context attempt → reject + critical Sentry
5. 7-brain DAG happy path — all 7 brains complete; `council_decisions` row written with 7 entries in `brain_votes`
6. Partial council failure — 5 brains complete, 2 fail → council marks `incomplete: true`; user sees graceful degradation
7. Provider Registry fallback — Tier 1 fail → Tier 2 succeeds → council completes
8. NO_PROVIDERS_AVAILABLE — Tier 1+2+3 all fail → critical Sentry; council fails fast
9. Zod parse fail on brain output → retry stricter prompt → success on retry
10. Persistent Zod fail → council degrades; `final_decision.malformed = true`
11. Idempotency — same `generation_id` retry returns cached council_decision row
12. 13-Agent Roster — each agent (8-13) executes independently; programmatic agents emit zero `token_usage_logs`
13. RLHF event emission — council kickoff emits `generate_start`; export emits `export`; regenerate emits `regenerate`
14. Preference Classifier integration — when `preference_model_versions.is_active=TRUE`, Designer Brain consults VLM
15. Pattern Performance feedback — 30-day rolling qa_score_rolling updates after RLHF events
16. Two-layer assembly — Layer 1 + Layer 2 produces budget-compliant prompt; Layer 2 truncates if injection too large
17. LoRA pipeline — brand reaches N patterns → fine-tune triggers; LoRA deployed; next generation uses LoRA
18. Cross-tenant LoRA prevention — attempt LoRA train with multi-brand data → reject + critical Sentry
19. Semantic cache via pgvector — `match_image_patterns` returns ranked patterns; cache hit short-circuits Brain 5
20. A/B testing — 20% traffic to new prompt version; 48h winner selection; pattern_performance_metrics updates
21. Token usage logging — every billable LLM call writes one row to `token_usage_logs` with `generation_id`
22. Workspace deletion mid-council — RLS denial caught; clean rollback
23. Inngest cancellation token — user cancels → partial brains discarded; no orphan token_usage_logs rows
24. Mastra DAG observability — every brain emits an OTel child span under the council parent
25. Long-running aggregation (Top Brain) — runs daily; `billable: false`; no token_usage_logs writes

---

## 27. Acceptance criteria (mechanical / binary)

- [ ] Repo file `/docs/research_specs/R19_LLM_ORCHESTRATION_v2.md` created via Manus directive
- [ ] Old file `/docs/research_specs/R19_LLM_ARCHITECTURE_ENTERPRISE.md` marked SUPERSEDED with pointer header (v1 content preserved)
- [ ] ZCBR Status header present: `PASSED 2026-05-12 by Architect Claude self-validation`
- [ ] 7-Brain Council section (§4) lists exactly 7 brains matching VVOW §5.1
- [ ] 13-Agent Roster section (§5) lists agents 8-13 matching VVOW §5.2
- [ ] No hardcoded LLM model name literals (Lock 19 grep on `apps/worker/src/lib/brains/`)
- [ ] No hardcoded OpenAI/Google/Anthropic SDK imports in brain code paths (Lock 19 grep)
- [ ] R-spec citations verified: R20 v2, R29 v2 PAL, R24 v2, T46 v2, R17 v2, R31 v2 (NOT R25 for cost)
- [ ] Lock 8/12/13/19/20/21 invocations present in §2
- [ ] LoRA pipeline section (§22) present per VVOW §12.4
- [ ] Mastra DAG architecture documented (§3.1) per VVOW §8.3
- [ ] Audit Table v1.4 row 3 status updates from PENDING RE-VAL to PASS

---

## 28. Migration plan (v1 → v2 REWRITE)

The v1.0 was authored 2026-05-12 09:22 UTC and replaced before significant LLM orchestration code was written against it. The 4-brain → 7-brain restructuring has no production code impact at this stage. Migration is a clean spec swap.

**Rollout sequence:**

1. Architect commits R19 v2 via Manus directive R19-V2-REWRITE-001
2. R-Spec Audit Table v1.4 row 3 status updates from PENDING RE-VAL to PASS at merge confirmation
3. B-XC.19 closes
4. Future B-0.14/0.15/0.16 substrate Bullets cite R19 v2
5. B-2.02 13-Agent Brain Council orchestration implements per this spec

No data migration required.

---

## 29. Open items

1. **7-brain vs 13-agent terminology consistency.** VVOW §5.1 calls the first 7 "the Council"; §5.2 calls the broader 13 the "Roster". v2 follows that vocabulary. Future minor version may refine if Master Build Sequence diverges.
2. **OD-016 — Preference Classifier threshold (per-brand vs cumulative).** VVOW §12.3 says "5,000 swipe decisions"; PO recommendation per OD-016 is per-brand. R19 v2 §20 follows per-brand. Locked when OD-016 ratifies formally.
3. **R23 v2 alignment.** R23 is CRIT MINOR FIX (audit row 7). When R23 v2 ships, R19 v2.x minor bump may align cost attribution wording.
4. **R32 (Email Engine) coordination.** R32 is IMPT REWRITE (audit row 16). When R32 v2 enters next-3 window, R19 v2.x minor bump aligns Phase 2 council execution semantics.
5. **LoRA training threshold (N validated patterns).** §22.1 leaves N TBD. Refinement deferred to R24 v2 minor bump or new R-spec.
6. **Programmatic agent metering policy.** §8.2 marks scheduled aggregations as `billable: false`. If subscription tier feature gating eventually distinguishes "premium aggregation" from "standard", a refinement may be needed.
7. **A/B testing statistical significance threshold.** §16.2 references 20% split + 48h window. Significance computation method (Bayesian vs frequentist) left to B-2.21 implementation.

---

## 30. Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion audit log.

**Version triggers:**
- Major (v3): breaking change to brain roster (add/remove brain), breaking change to `council_decisions` schema, breaking change to two-layer assembler contract
- Minor (v2.x): additive (new agents, new capabilities, new LoRA refinements, R23 v2 alignment, R32 v2 alignment, OD-016 ratification)
- Patch (v2.x.y): clarifications, typo fixes, citation updates

**Re-validation:** Every 180 days per ZCBR HEADER_STALE rule, or immediately when any cited spec (VVOW §5, R20 v2, R29 v2, R24 v2, T46 v2, R17 v2, R31 v2) bumps minor or major version.

**Companion spec alignment:**
- R23 v2 → R19 v2.x cost attribution alignment
- R32 v2 → R19 v2.x Phase 2 council semantics
- OD-016 ratification → R19 v2.x Preference Classifier threshold lock

---

*End of R19 LLM Orchestration v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
