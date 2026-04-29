# Taskmaster Re-Ingestion Input — Phase 6.2 Image Studio Correction + Phased Security

**Purpose:** Generate the proposed Taskmaster task-graph diff for Product Owner approval before any product-code work.
**Authority order:** Direct PO Combined Directive v2, Architecture Broadcast record `recqGyk0oIekpYEe9`, PRD V5 Addendum, Architecture Lock v6.1, Doc 11 Security Phase Triggers Addendum, Architecture Lock Security Phase Gate Addendum, T46 Gap Addendum C-T46-001.
**Execution rule:** Produce a proposed diff only. Do not execute product code. Do not remove the approval stop: after the diff is written to Airtable and the broadcast status is set to `Diff Proposed`, stop until PO approval.

## 1. Current Problem Statement

Phase 6 Image Studio UI was rejected because prior implementation work treated the existing T24–T34 task graph as sufficient after manual source review. The PRD V5 Addendum §26 was not operationalized into Taskmaster before UI work proceeded. The corrected task graph must represent the Image Studio as a standalone design tool, not a thin API wrapper.

The required accountability answer is scenario 10: the PRD V5 Addendum was read manually, but its requirements were not operationalized into Taskmaster before Phase 6 UI work proceeded.

## 2. Approved Prior Deliverables with Four Mandatory Modifications

The PO approved the prior explanation, source re-ingestion summary, and proposed todo plan T47–T72 with these mandatory changes:

1. Break down the old grouped T51 into three independent tasks:
   - T51a: SEC-14 and SEC-15 auth hardening, including password complexity and brute-force lockout.
   - T51b: SEC-04 and SEC-05 network hardening, including HTTP security headers and rate limiting.
   - T51c: SEC-07 and SEC-08 CI hardening, including secret scanning and SAST.
2. Add an explicit Taskmaster re-parse task before T52: “Run task-master parse-prd on PRD V5 Addendum and Architecture Lock v6.1 to ensure local .taskmaster/ state matches Airtable,” with command-output evidence.
3. T59 must explicitly name the Architecture Lock v6.1 §3.1.1 multi-model pipelines for A3, A4, A8, A9, A13, A14, A15, and A16 in acceptance criteria.
4. Defer T64 Freeform Canvas and T65 Collaboration Pins to V1.1. Remove both from the active sprint.

## 3. Immediate Architecture Broadcast Handshake

At the start of every task session, query the Architecture Broadcasts table. If any record is pending builder ingestion, halt planned work, download its Google Drive files, run Taskmaster ingestion, write the task graph diff into the Builder Diff Output field, set the record status to `Diff Proposed`, and stop. Product-code work cannot resume until PO changes status to `PO Approved`.

## 4. Revised Security Trigger Model

The prior total halt is rescinded. Security controls are phased by the moment the protected attack surface becomes real. However, Phase 0 is an immediate blocker before the next commit.

| Security Phase | Trigger | Required Controls |
|---|---|---|
| Phase 0 | Before any more code / before next commit | SEC-18 branch protection, TruffleHog pre-commit hook, GitHub secret scanning, `.env` and secret-history audit. |
| Phase 1 | First auth/database code | SEC-14/SEC-15 auth hardening, RLS on every table, AES-256-GCM field encryption, session management, security headers, account-enumeration prevention. |
| Phase 2 | First public deployment | Upstash Redis rate limiting, Cloudflare WAF, MFA gate, audit logging foundation, CSRF protection posture. |
| Phase 3 | Image Studio or Brand Vault live with file upload or external URL fetch | SSRF protection, malicious file upload scanning, R2 upload controls. |
| Phase 4 | Before first paying customer | Security settings UI, audit log viewer UI, CodeQL SAST + Dependabot SCA, vulnerability scanning, incident response, backup strategy, secrets management migration. |
| V2+ | Post-launch maturity triggers | Bug bounty, SOC 2 Type II, internal security dashboard, SBOM generation, zero-trust architecture. |

## 5. PRD V5 Addendum Requirements to Operationalize

### 5.1 Visual Engine V2

The corrected task graph must represent Visual Engine V2 as a multi-model, multi-provider system with the three-tier provider strategy, 22+ generation models, 10 editing models, Art Director Router 4D scoring, Pattern DB cache-first lookup, zero-shot fallback, token economics, and cost reconciliation.

### 5.2 Image Studio Standalone Tool

The Image Studio must be built as `/brand/[brandId]/studio`, brand-scoped, and available from main navigation. It shares backend capabilities with the email editor AI panel, but its frontend surface is a standalone design workspace with export options.

### 5.3 Required Image Studio Feature Inventory

The corrected graph must cover the PRD’s 52 features across these categories:

| Category | Required Scope |
|---|---|
| Generation Modes | All 22 modes A1–A22 through conversational natural language, slash commands such as `/mockup` and `/poster`, and a visual mode picker. |
| Editing Tools | 10 tools: Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, and Material Swap. |
| Style/Prompt Library | 5 library features: Pre-Built Templates, Industry Prompt Packs, User-Saved Styles, Brand Style Lock, and Community Styles as V2/deferred marketplace scope. |
| Brand Vault Integration | 6 features: `@` mention system, auto-save to R2/assets table, bidirectional email editor availability, product photo import, brand guidelines PDF export, asset versioning. |
| Export & Output | 5 features: PNG/JPG/WebP/PDF download with resolution choices, direct-to-email insertion, multi-size generation, transparent PNG, Brand Kit save with metadata tags. |
| Canvas & Workspace | Conversational session, version history, and multi-image project organization are active. Freeform infinite canvas is deferred to V1.1 per PO Modification D. |

## 6. Architecture Lock v6.1 Explicit Multi-Model Pipelines

T59 must include acceptance criteria for the following non-generic UI flows:

| Mode | Required UI Acceptance Criteria |
|---|---|
| A3 Compositional Poster | Collect prompt and optional product `@` mention; communicate RMBG background removal, Flux background generation, Ideogram typography overlay, and server-side compositing. |
| A4 Brand Mockup | Collect base image, brand asset `@` mention, target region description; support SAM mask, ControlNet warp, Sharp compositing lifecycle. |
| A8 Social Media Templates | Require target platform such as IG, FB, Pinterest, or YouTube; expose correct aspect ratio/platform sizing before generation; explain template overlay compositing. |
| A9 Color Palette Extraction | Accept image URL/upload or prompt source; surface BLIP-2 semantic extraction, node-vibrant hex extraction, Claude naming output shape. |
| A13 Style Invention | Accept abstract style prompt; present four MCoT prompt branches and selection flow for four generated images. |
| A14 Seasonal/Holiday Themes | Accept base product image and holiday name; surface Pattern DB template lookup before Nano Banana Pro Edit execution. |
| A15 Unified Brand Kit | Accept brand description prompt; present logo, palette, and imagery output grouping from Recraft, Claude palette generation, and Flux imagery. |
| A16 Before/After Comparison | Reuse A4-style mask/warp/composite flow and require side-by-side before/after output handling. |

## 7. T46 Gap Addendum Repair Requirements

The task graph must not assume the backend is complete if prior artifacts remain incomplete. It must track affected artifacts from C-T46-001: provider registry with 22+ models, shared Art Director schema including mode/editing contracts, image router with R2 auto-save and `@` mentions, and editing router for 10 tools.

## 8. Proposed Output Shape for the Diff

Generate a task graph beginning from the previously proposed T47+ range, revised as follows:

- Keep T47 Architecture Broadcasts handshake.
- Keep T48 immediate SEC-18 PR approval gate.
- Keep T49 security blocker graph promotion.
- Keep T50 SEC-02 encryption foundation.
- Replace T51 with T51a/T51b/T51c as required by Modification A.
- Insert a new explicit Taskmaster re-parse evidence task before T52 as required by Modification B.
- Keep Studio foundation tasks T52–T63, but update T59 acceptance criteria for §3.1.1 multi-model modes.
- Defer freeform canvas and collaboration pins to V1.1; do not include them in active sprint execution.
- Preserve validation, accessibility, full verification, and approval-stop tasks.
- End with a task that blocks implementation until PO approval of the Architecture Broadcast diff.

## 9. Non-Negotiable Task Acceptance Rules

Each task must include clear acceptance criteria, dependencies, and source coverage. No active implementation task may expose UI placeholders. No generation/editing task may bypass cache-first routing, token precheck/deduction, Brand Vault auto-save, or tenant isolation where applicable. No code may be committed until Phase 0 security is complete.
