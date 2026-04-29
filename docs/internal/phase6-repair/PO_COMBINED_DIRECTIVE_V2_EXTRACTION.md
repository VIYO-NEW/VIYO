# PO Combined Directive v2 Extraction — Phase 6 Correction + Phased Security

**Author:** Manus AI
**Date:** 2026-04-28
**Status:** Source extraction for execution; not a product-code change.
**Source basis:** `PO_Combined_Directive_v2_—_Phase_6_Correction_+_Phased_Security(1).docx`, Architecture Broadcast record `recqGyk0oIekpYEe9`, downloaded broadcast documents, PRD V5 Addendum, and Architecture Lock v6.1.

## 1. Binding Execution Order

The PO directive supersedes the previous “halt all feature work” order. Feature work is **not permanently halted**, but the current session is blocked by the Architecture Broadcasts handshake. The binding order is as follows.

| Step | Binding Instruction | Current Execution Implication |
|---:|---|---|
| 1 | Run Architecture Broadcasts pre-flight at the start of every task. | Completed for this session. The pending broadcast exists as record `recqGyk0oIekpYEe9`; Airtable text search required the term `Directive` rather than the single-select status text. |
| 2 | If a record has `Status = Pending Builder Ingestion`, halt planned work, download the Google Drive files, run Taskmaster ingestion, write the task graph diff into Airtable, set status to `Diff Proposed`, and stop. | In progress. Product-code work remains blocked until PO changes the broadcast status to `PO Approved`. |
| 3 | After PO approval of the diff, apply four mandatory modifications to the local Taskmaster graph. | Not yet allowed in the active graph until PO approves the proposed diff. The deliverable must present the exact proposed modifications now. |
| 4 | Sync the approved modified graph to the Airtable Build Tracker. | Blocked until PO approval. |
| 5 | Execute Phase 0 Security before the next commit. | Branch protection, pre-commit secret scanning, GitHub secret scanning, and `.env` history audit are immediate blockers after graph approval and before commit. |
| 6 | Continue Image Studio UI work and Phase 1 Security in parallel after the approved planning and Phase 0 security gates. | No product-code implementation before the broadcast diff is approved. |

## 2. Four Mandatory Modifications to the Approved Prior Deliverables

The PO approved the prior explanation, source re-ingestion summary, and proposed T47–T72 todo plan with four required changes.

| Modification | Required Change | Proposed Graph Impact |
|---|---|---|
| A | Break down T51 into T51a, T51b, and T51c. | Replace grouped minimum-security task with three independent hardening tasks: auth, network, and CI. |
| B | Add explicit Taskmaster re-parse task before T52. | Insert a pre-T52 task proving `task-master parse-prd` was run on PRD V5 Addendum and Architecture Lock v6.1. |
| C | Make T59 acceptance criteria explicit for multi-model modes A3, A4, A8, A9, A13, A14, A15, and A16. | T59 must name each v6.1 §3.1.1 multi-step UI flow and cannot treat “22 modes” as a generic checklist. |
| D | Defer T64 and T65 to V1.1. | Remove Freeform Canvas and Collaboration Pins from the active sprint; keep them as deferred V1.1 scope only. |

## 3. Accountability Answer Required in Next Submission

The directive requires a direct answer to: **“Why did you not run task-master parse-prd on the PRD V5 Addendum before building Phase 6?”**

The accurate answer is scenario **4**: **the PRD V5 Addendum was read manually, but its requirements were not operationalized into Taskmaster before Phase 6 UI work proceeded.** The operational failure was not that the source did not exist, nor that parsing was attempted and failed before implementation. The failure was treating the existing task graph as sufficient after manual source review, which allowed PRD §26’s 52-feature standalone Image Studio scope to remain outside the active execution graph.

## 4. Immediate Security Directive

The revised security directive makes Phase 0 the only immediate security blocker. Full security work is phased by attack-surface trigger, but Phase 0 must happen **before the next commit**.

| Security Phase | Trigger | Required Controls |
|---|---|---|
| Phase 0 | Before any more code / before next commit | SEC-18 branch protection, TruffleHog pre-commit hook, GitHub secret scanning, `.env` and secret-history audit. |
| Phase 1 | First auth/database code | Password policy, RLS on every table, AES-256-GCM field encryption, session management, security headers, account-enumeration prevention. |
| Phase 2 | First public deployment | Rate limiting, Cloudflare WAF, MFA enrollment gate, audit logging foundation, CSRF posture. |
| Phase 3 | Image Studio / Brand Vault live with upload or external fetch | SSRF protection, malicious file upload scanning, R2 upload controls. |
| Phase 4 | Before first paying customer | Security settings UI, audit log viewer UI, SAST/SCA in CI, vulnerability scanning, incident response, backup strategy, secrets management migration. |
| V2+ | Post-launch / later maturity triggers | Bug bounty, SOC 2 Type II, internal security dashboard, SBOM generation, zero-trust architecture. |

## 5. Source-Document Requirements That Must Appear in the Diff

The proposed task diff must include the following source obligations.

| Source | Binding Requirement for the Diff |
|---|---|
| PRD V5 Addendum §25 | Visual Engine V2 includes 22+ models, 10 editing tools, three-tier provider strategy, token economics, cache-first Pattern DB routing, zero-shot fallback, and cost reconciliation. |
| PRD V5 Addendum §26 | Image Studio is a standalone design tool with 52 features across generation modes, editing tools, style/prompt library, Brand Vault integration, export/output, and canvas/workspace. |
| PRD V5 Addendum §31.2 | No UI placeholders; billing hard-stop; cache-first routing; provider tier order; RLS; encrypted secrets; ADA compliance. |
| Architecture Lock v6.1 §3.1.1 | A3, A4, A8, A9, A13, A14, A15, and A16 require explicit multi-step pipelines, including input requirements, intermediate model steps, compositing, and output shape. |
| T46 Gap Addendum C-T46-001 | The prior simplified routing artifacts were incomplete; affected backend/shared files must be repaired before Phase 6 UI work can depend on them. |
| Doc 11 Security Phase Triggers Addendum | Security controls are phased by attack-surface trigger, with Phase 0 as immediate pre-commit blocker. |
| Architecture Lock Security Phase Gate Addendum | Architecture and implementation planning must include the phased security gates, not treat security as a later generic hardening task. |

## 6. Known Process Conflict and Resolution

The updated VIYO protocol says to use the GitHub-pushed knowledge base and not directly access Google Drive as a default source path. The PO Combined Directive v2 explicitly requires downloading the Architecture Broadcast Google Drive files using `gws`. Under the authority order, the direct PO instruction for this task is controlling, so the Drive downloads are permitted and required for this ingestion sequence. The conflict should be surfaced in the final handoff, but it does not block execution of the PO directive.

## 7. Current Stop Condition

The current work must stop after writing the task graph diff to the Architecture Broadcast record and setting its status to `Diff Proposed`. No product-code implementation, local active-graph mutation, Airtable Build Tracker sync, or commit may proceed until the PO approves the broadcast diff.
