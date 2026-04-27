# Architecture Lock: Art Director Routing Suite

**Author:** Manus AI
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T46
**Covered Implementation Tasks:** T21, T22, T23
**Primary Source:** `/home/ubuntu/upload/Pre-Approved_Architecture_Lock_Art_Director_Routing_Suite.docx`

> This file records the Product Owner-approved architecture lock for the Art Director Routing Suite. The source attachment used legacy wording that described the document as a Phase 1 architecture plan. Per PO confirmation on 2026-04-27, that label maps to the updated VIYO protocol as **Phase 2 — Architecture Lock**. Builders may reference this file as the authoritative repository source when preparing Phase 2 wiring and Phase 4 implementation work for the covered tasks.

## 1. Subsystem Purpose

The **Art Director Routing Suite** replaces basic image-generation routing with an intelligent, multi-dimensional decision layer. It evaluates incoming generation requests against historical prompt patterns, selects the most cost-effective provider tier that can satisfy the request, and provides a zero-shot fallback path when historical patterns do not produce an acceptable match.

| Scope Element | Locked Decision |
|---|---|
| Primary module | `src/lib/ai/image-router.ts` |
| Core data source | `image_prompt_patterns` with pgvector similarity search |
| Embedding model | `OpenAI text-embedding-3-small` |
| Candidate search size | Top 20 prompt-pattern candidates |
| Acceptance threshold | `SCORE >= 0.75` |
| Fallback model class | Frontier prompt-synthesis model, for example `GPT-4o` |
| Composite execution wrapper | T46 |

## 2. Locked Components

### 2.1 4D Scoring Matrix — T21

The 4D Scoring Matrix is implemented in `src/lib/ai/image-router.ts`. It generates request embeddings, queries the `image_prompt_patterns` table for the top 20 pgvector candidates, and calculates the locked composite score:

```text
SCORE = (Quality * 0.4) + (Cost_Efficiency * 0.3) * Freshness_Penalty * Tier_Multiplier
```

The router selects the top candidate when the resulting score is greater than or equal to `0.75`. Scores below that threshold must fall through to the zero-shot fallback path rather than being treated as a confident pattern match.

### 2.2 Zero-Shot Fallback — T22

The Zero-Shot Fallback is implemented in `src/lib/ai/image-router.ts` and is triggered when no 4D Scoring Matrix candidate reaches `SCORE >= 0.75`. The fallback invokes a frontier model, such as `GPT-4o`, to synthesize a novel generation prompt. Successful fallback patterns must be flagged for later evaluation and potential seeding into `image_prompt_patterns` after successful generation and user acceptance.

### 2.3 Provider Tier Routing — T23

Provider Tier Routing is implemented in `src/lib/ai/image-router.ts`. It evaluates request complexity, including typography requirements and product-integration needs, then routes simple requests to lower-cost tiers such as standard SDXL or basic Ideogram. More complex requests, especially those requiring strict typography or high-fidelity product placement, are routed to premium tiers such as Ideogram 3.0 or suitable custom fine-tunes.

## 3. API and Data Flow

| Step | Locked Flow |
|---|---|
| 1 | `POST /api/studio/generate` receives the generation request. |
| 2 | The request is embedded and compared against `image_prompt_patterns`. |
| 3 | The 4D Scoring Matrix evaluates candidate patterns. |
| 4 | If `SCORE >= 0.75`, Provider Tier Routing selects the optimal provider from the accepted pattern requirements. |
| 5 | If `SCORE < 0.75`, Zero-Shot Fallback synthesizes a new prompt and defaults to a safe mid-tier provider unless complexity requires another tier. |
| 6 | The selected provider executes the generation request. |

## 4. Updated VIYO Protocol Mapping

| Directive Label in Source Attachment | Updated Protocol Phase | Operational Meaning |
|---|---:|---|
| Legacy “Phase 1 Architecture Plan” | Phase 2 | This file is the locked architecture source of truth. |
| Legacy “Phase 2 Wiring Blueprint” | Phase 3 | Builders prepare the narrow wiring plan from this lock. |
| Legacy implementation sequencing | Phase 4 | Builders execute implementation under the composite task wrapper. |
| Legacy post-build tracking | Phase 9 | Builders complete post-build, Airtable, and delivery records. |

## 5. Implementation Sequence Within Composite T46

The covered tasks are executed as a single composite protocol run under **T46**. The locked implementation sequence is **T21 → T23 → T22**. Builders must first implement the 4D Scoring Matrix, then implement Provider Tier Routing so the selected pattern can be acted upon, and finally implement the Zero-Shot Fallback for cases where the matrix fails.

## 6. Supersession Rule

This architecture lock supersedes conflicting instructions in individual task descriptions for T21, T22, or T23. If a future implementation detail appears to conflict with this lock, the builder must stop and request PO clarification before modifying the architectural intent.
