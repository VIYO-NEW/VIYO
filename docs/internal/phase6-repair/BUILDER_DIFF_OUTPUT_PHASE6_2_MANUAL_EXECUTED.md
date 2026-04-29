# Builder Diff Output — Phase 6.2 Manual Taskmaster Graph Created

**Prepared by:** Manus AI
**Date:** 2026-04-28
**Architecture Broadcast Record:** `recqGyk0oIekpYEe9`
**Directive:** PO Combined Directive v2 — Phase 6 Correction + Phased Security
**Action Taken:** Manual `task-master add-task` execution, per PO instruction to stop attempting `parse-prd`.

## 1. Execution Summary

The PO instructed: **“Stop trying to make `parse-prd` work. It is not blocking. Manually create the task graph from the PO Combined Directive v2 using `task-master add-task` for each task.”** I followed that instruction and created the Phase 6.2 correction/security task graph manually using Taskmaster’s manual `add-task` fields.

The proposed logical graph in the prior builder diff used PO logical IDs **T47–T72**, but the repository already had top-level Taskmaster tasks **T47–T60** allocated to existing composite/R32 work. To avoid overwriting or duplicating existing tasks, I preserved the PO logical IDs in each title and created the new graph at the next available Taskmaster IDs: **T61–T89**.

| Evidence Artifact | Path |
|---|---|
| Manual add-task script | `docs/internal/phase6-repair/add_phase6_2_manual_tasks.py` |
| Manual add-task command log | `docs/internal/phase6-repair/add_phase6_2_manual_tasks_output.txt` |
| Taskmaster list after manual additions | `docs/internal/phase6-repair/taskmaster_list_after_manual_add.txt` |
| Prior deterministic proposed diff | `docs/internal/phase6-repair/BUILDER_DIFF_OUTPUT_PHASE6_2.md` |

## 2. Actual Taskmaster ID Mapping

| PO Logical Task | Actual Taskmaster ID | Title | Dependencies |
|---|---:|---|---|
| T47 | 61 | Architecture Broadcast Ingestion Handshake | None |
| T48 | 62 | SEC-18 Branch Protection Gate | 61 |
| T49 | 63 | Phase 0 Secret-Exposure Controls | 62 |
| T50 | 64 | SEC-02 Encryption Foundation Readiness | 63 |
| T51a | 65 | SEC-14 and SEC-15 Auth Hardening | 64 |
| T51b | 66 | SEC-04 and SEC-05 Network Hardening | 64 |
| T51c | 67 | SEC-07 and SEC-08 CI Hardening | 63 |
| T51d | 68 | Explicit Taskmaster Re-Parse Evidence Gate | 61 |
| T52 | 69 | T46 Gap Repair — Provider Registry and Shared Contracts | 68 |
| T53 | 70 | T46 Gap Repair — Cache-First Router and Pattern DB Integration | 69 |
| T54 | 71 | Billing and Token Economics Foundation | 69 |
| T55 | 72 | R2 Auto-Save and Brand Vault Asset Contract | 69 |
| T56 | 73 | Editing Router Coverage for 10 Tools | 69 |
| T57 | 74 | Standalone Studio Route, Navigation, and Brand Scope | 69 |
| T58 | 75 | Conversational Studio Shell and Slash Commands | 74 |
| T59 | 76 | Generation Mode Matrix with Explicit v6.1 Multi-Model Flows | 75, 70, 71 |
| T60 | 77 | Aspect Ratio, Platform Sizing, and Output-Shape Controls | 76 |
| T61 | 78 | Style and Prompt Library | 75 |
| T62 | 79 | Error, Timeout, Scoring, and Feature-Flag Visibility | 75, 70 |
| T63 | 80 | Multi-Format Export and Resolution Choices | 72, 76 |
| T64 | 81 | Version History and Multi-Image Project Organization | 74, 72 |
| T65 | 82 | Accessibility and No-Placeholder UI Compliance | 74–81 |
| T66 | 83 | Unit and Integration Test Expansion | 74–82 |
| T67 | 84 | Static Wiring and Type Validation | 69–83 |
| T68 | 85 | Browser Validation and Visual Evidence | 74–84 |
| T69 | 86 | Security Trigger Verification Matrix | 62–85 |
| T70 | 87 | Airtable Build Tracker Sync After PO Diff Approval | 61–86 |
| T71 | 88 | Final Quality Gate and Source-of-Truth Reconciliation | 83–87 |
| T72 | 89 | PO Approval Stop Before Phase 7 | 88 |

## 3. PO Modifications Confirmed in the Created Graph

| PO Required Modification | Created Task Coverage |
|---|---|
| Replace grouped T51 with T51a, T51b, and T51c | Actual tasks **65**, **66**, **67** preserve the split security trigger semantics. |
| Add explicit pre-T52 Taskmaster re-parse evidence gate T51d | Actual task **68** records the parse evidence gate and the PO override that manual task creation is not blocked by provider failure. |
| Update T59 with explicit A3/A4/A8/A9/A13/A14/A15/A16 multi-model UI acceptance criteria | Actual task **76** includes the full v6.1 multi-model acceptance text. |
| Defer T64 Freeform Canvas and T65 Collaboration Pins to V1.1 | Actual task **81** narrows active T64 to version history/multi-image organization; actual task **82** enforces no-placeholder UI and records collaboration pins as V1.1 deferred scope. |

## 4. Security Phasing Confirmed in the Created Graph

The manual graph includes the phased security sequence required by Section 3 of the directive. **Phase 0** security work is represented by branch protection and secret-exposure controls before the next commit. Later security controls remain trigger-bound and must not be prematurely implemented outside their attack-surface trigger.

| Security Area | Actual Taskmaster Coverage | Trigger |
|---|---|---|
| SEC-18 branch protection | 62 | Phase 0 / before next commit |
| Secret-exposure controls | 63 | Phase 0 / before next commit |
| SEC-02 encryption readiness | 64 | Before sensitive-token storage |
| SEC-14/SEC-15 auth hardening | 65 | First auth/database code |
| SEC-04/SEC-05 network hardening | 66 | First auth/database code and first public deployment split trigger |
| SEC-07/SEC-08 CI hardening | 67 | Phase 0 push-time controls; SAST/SCA before first paying customer |
| Security trigger verification matrix | 86 | Verification phase before completion claim |

## 5. Current Approval Boundary

The task graph has now been created locally in Taskmaster. The Architecture Broadcast status was previously moved to **`Diff Proposed`**. Product-code implementation remains subject to the PO approval boundary and the updated VIYO protocol: Phase 0 security controls and Phase 2 architecture/wiring approval must be satisfied before implementation proceeds.
