# Architecture Lock: Art Director Routing Suite

**Document Version:** 3.0 (PRD Product Architect Depth)
**Update Description:** Replaced the prior v1 repository lock with the PO-approved v3.0 architecture lock, including the corrected operator-precedence scoring formula, tRPC route contract, token economics integration, observability, and rollback contract.
**Update Reason:** PO instruction dated 2026-04-27 directed replacement of the earlier architecture-lock content before T45 proceeds.
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T46
**Covered Implementation Tasks:** T21, T22, T23
**Primary Replacement Source:** `/home/ubuntu/upload/Architecture_Lock_Art_Director_Routing_Suite_(T46).docx`

> This file supersedes the prior Art Director Routing architecture-lock content in this repository. Builders must use this v3.0 document for Sprint 2 implementation planning and must not rely on the earlier score formula or older routing assumptions.

## 1. Source Declaration

| Source ID | Source Path or Title | Authority Status | Sections Read | Facts Extracted | Gaps or Conflicts |
|---|---|---|---|---|---|
| S1 | `/home/ubuntu/upload/PO_Instruction_Architecture_Lock_Corrections_&_Source-of-Truth_Enforcement.docx` | approved source opened | Full correction instruction | The four v1 architecture locks must be discarded and replaced before T45 proceeds. | None for this replacement action. |
| S2 | `/home/ubuntu/upload/Architecture_Lock_Art_Director_Routing_Suite_(T46).docx` | approved source opened | Full v3.0 lock | Corrected scoring formula, tRPC API contract, token economics integration, observability metrics, release flag, and rollback rule. | None. |

## 2. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| Objective | Implement a multi-model router that scores and selects the optimal AI model for image generation tasks based on a 4D scoring matrix: Quality, Cost, Freshness, and Tier. |
| Builder outcome | Complete routing logic, fallback mechanism, and zero-shot caching loop. |
| Acceptance checks | The router correctly selects a cached pattern over a frontier model when the score is higher; the router falls back to Tier 2 if Tier 1 fails or times out; the scoring formula calculates correctly according to explicitly defined operator precedence. |
| Non-goals | Building new image generation models. |
| Constraints | All routing must execute synchronously within the generation request. |
| Source-confirmed assumptions | The router is exposed through `artDirector.routeGeneration`, returns selected-model and scoring metadata, and integrates with token deduction for frontier generation. |
| Open decisions | None for architecture-lock replacement. |

## 3. Prior-Artifact Back-Propagation Register

| Affected Artifact | Issue Discovered | Root Source of Truth | Required Correction | Build Blocking | Owner | Verification Evidence |
|---|---|---|---|---|---|---|
| `docs/architecture/art-director-routing-suite.md` | The prior v1 lock contained an ambiguous scoring formula with the previous multiplication-precedence bug. | S1, S2 | Replace with the v3.0 lock and corrected parenthesized score formula. | Yes | Manus AI | This file has been overwritten with v3.0 content. |
| T46 builder prompt assumptions | Any builder plan using the older unparenthesized score formula would produce incorrect routing behavior. | S2 | Use the exact formula in Section 4. | Yes | Builder assigned to T46 | This lock defines the canonical score calculation. |

## 4. Scoring Formula

The score must be implemented with exact operator precedence to avoid the previous multiplication bug. The additive quality and cost-efficiency subtotal is calculated first, then multiplied by freshness and tier factors.

```ts
const score = (
  (baseQualityScore * 0.4) +
  (costEfficiencyScore * 0.3)
) * freshnessPenalty * tierMultiplier;
```

| Formula Component | Locked Weight or Role | Implementation Note |
|---|---|---|
| `baseQualityScore` | Weighted by `0.4` | Contributes to the additive subtotal before freshness and tier multiplication. |
| `costEfficiencyScore` | Weighted by `0.3` | Contributes to the additive subtotal before freshness and tier multiplication. |
| `freshnessPenalty` | Multiplicative factor | Applied after the additive subtotal is computed. |
| `tierMultiplier` | Multiplicative factor | Applied after the additive subtotal is computed. |

## 5. API Contract

### 5.1 `artDirector.routeGeneration`

| Field | Locked Contract |
|---|---|
| API style | tRPC procedure |
| Procedure name | `artDirector.routeGeneration` |
| Execution timing | Synchronous within the generation request. |
| Response purpose | Return the selected model, whether the selection used cache, the score, and token cost. |

#### Request

```ts
{
  prompt: string;
  brandId: string;
  aspectRatio: string;
  styleId?: string;
}
```

#### Response

```ts
{
  selectedModel: string;
  isCached: boolean;
  score: number;
  costTokens: number;
}
```

## 6. Token Economics Integration

| Action | Cost Source | Deduction Call | Fallback |
|---|---|---|---|
| Frontier Generation | User balance | `atomic_token_deduction(cost, 'image_gen')` | Return `insufficient_balance` error. |
| Cached Pattern | Free | Not applicable | Not applicable. |

The routing implementation must not bypass token economics for billable frontier generation. Cached pattern routing remains free under the v3.0 lock.

## 7. Observability and Analytics

| Category | Locked Requirement |
|---|---|
| Metrics | Log every routing decision, selected model, score, cache hit or miss, and generation duration. |
| Alerts | Trigger a PagerDuty alert if the Tier 1 fallback rate exceeds 15% in a 1-hour window. |

## 8. Release and Rollback Plan

| Release Control | Locked Decision |
|---|---|
| Feature flag | `enable_art_director_router` |
| Rollback | Disable the flag to route all requests directly to the default model, Tier 1. |

## 9. Supersession Rule

This v3.0 architecture lock supersedes the earlier v1 repository lock and conflicting draft context for T21, T22, T23, and T46. If any implementation task, handoff note, formula draft, route contract, or builder prompt conflicts with this file, the builder must stop and follow this v3.0 lock unless a later PO-approved source explicitly supersedes it.
