# Phase 6 Root Cause Correction Deliverables

**Author:** Manus AI
**Project:** VIYO
**Date:** 2026-04-28
**Status:** **Blocked pending PO approval**
**Scope:** Root-cause explanation, source re-ingestion summary, proposed Taskmaster todo.md plan, and corrective governance gates. No product code was changed, and no new tasks were synced to Airtable.

## 1. Executive Explanation

The linked PO directive was read in detail. It states that the prior Phase 6 Image Studio UI delivery is accepted only as **Phase 6.1 — Schema-Bound API Foundation**, while the actual standalone product UI remains incomplete because the active Taskmaster graph was generated from an outdated scope. The directive identifies a tasking failure rather than a narrow implementation defect: the old T24–T34 graph asked for a page layout, backend flow, frontend generation flow, selected editing tools, Brand Vault mentions, auto-save, and comments, but it did not encode the full PRD V5 Addendum §26 requirement for a **52-feature standalone Image Studio**.[1] [5]

> “You cannot build what Taskmaster does not know about.” — PO Directive, Phase 6 Root Cause Correction.[1]

My direct answer to the required question is as follows: based on the repository evidence and current task history, the most accurate failure mode is **option 3 plus option 4** from the PO’s list. The PRD V5 Addendum was present, and the Architecture Lock v6.1 references it as a source, but the active Taskmaster todo graph was not re-generated from PRD V5 Addendum §26 before the Phase 6 frontend implementation began. The builder then treated the old T24–T34 task graph as the complete executable scope. That task graph operationalized only a thin subset of the product surface and therefore led to an API-bound form rather than the standalone design tool.[1] [5]

I cannot honestly claim proof of the builder’s intent or private reading state. What the evidence does support is this: the implementation incorporated enough Architecture Lock v6.1 schema knowledge to bind modes and editing tools, but it did not translate the full PRD V5 Addendum §26 feature inventory into implementation tasks. The defect was therefore **source-of-truth ingestion and task graph incompleteness**, not merely missing UI polish.[1] [2] [3]

## 2. Source Re-Ingestion Summary

The directive required re-ingesting PRD V5 Addendum §26, Architecture Lock v6.1 §3.1.1 and UI-related requirements, and Doc 11 Security Architecture before any corrective code. Those sources were reviewed and reconciled into the proposed todo plan below. The resulting corrective plan deliberately separates security blockers, handshake governance, and Image Studio product completion so PO approval can happen before execution.

| Source | Required Facts Extracted | Effect on Corrective Plan |
|---|---|---|
| PO Directive: Phase 6 Root Cause Correction | Phase 6 UI is blocked; old delivery is only Phase 6.1 foundation; new task graph must cover 52 features and six UI gaps; no Airtable sync or code before PO review. | Establishes the current halt, the required explanation, and the approval gate. |
| PRD V5 Addendum §26 | Image Studio is a standalone tab with 52 features across generation modes, editing tools, style/prompt library, Brand Vault integration, export/output, and canvas/workspace. | Drives Phase 6.2–6.5 product task graph. |
| Architecture Lock v6.1 | Router supports 22 modes, 10 editing tools, 4D scoring, cache threshold >= 0.75, zero-shot fallback, token economics, feature flag `enable_art_director_router`, and explicit multi-model pipelines for A3, A4, A8, A9, A13, A14, A15, and A16. | Adds UI dependencies for scoring visibility, feature-flag state, platform/aspect behavior, token precheck, and route metadata. |
| Doc 11 Security Architecture | Security is Tier 1 and cannot be deferred; Restricted data requires AES-256-GCM; CI requires vulnerability controls; production flow requires formal change management and auditability. | Promotes SEC tasks into hard prerequisites before more feature work. |
| Sprint 2 Handoff / Existing Task Graph | T24–T34 were generated as a limited active sprint; handoff records that parse-prd previously failed and a fallback script created T15–T40. | Confirms how the outdated graph became the working scope and why the 52-feature inventory was missed. |
| Airtable Build Tracker Check | SEC records including SEC-02, SEC-04, SEC-05, SEC-07, SEC-08, SEC-14, SEC-15, and SEC-18 are present and marked `Not Started`; `Architecture Broadcasts` table was not present in the listed base at check time. | Confirms the security blocker and records a setup dependency for the new handshake table. |

## 3. Six Rejection Gaps Mapped to Corrective Tasks

The proposed graph treats the six PO ruling gaps as mandatory acceptance dimensions rather than optional follow-ups. Each gap is represented by at least one task with explicit dependencies and acceptance checks.

| PO Gap | Corrective Task Coverage | Acceptance Evidence Required Before Done |
|---|---|---|
| Missing Aspect Ratio Selector | T56 and T59 | Mode-aware platform/aspect selector exists before generation; A8 exposes platform-specific sizing; multi-size generation can request parallel output sizes. |
| Missing Token Economics & Billing UI | T51 and T57 | Pre-generation token estimate is visible; cached pattern is shown as free; insufficient balance blocks generation gracefully with recovery path. |
| Missing Conversational Interface | T54 and T55 | Chat-based Studio command surface supports natural language, slash commands such as `/mockup` and `/poster`, and a mode picker as an alternative control. |
| Missing Error States & Scoring Visibility | T52 and T58 | UI surfaces cache hit vs zero-shot, scoring threshold, selected model/tier, feature-flag state, failure, timeout, and retry states. |
| Missing Style/Prompt Library | T60 | Pre-built templates, industry packs, user-saved styles, brand style lock, and community styles V2 placeholder/gated surface are represented. |
| Missing Multi-Format Export | T62 | PNG, JPG, WebP, PDF, transparent PNG, resolution choices, save-to-brand-kit, and direct-to-email paths are represented. |

## 4. Proposed Taskmaster todo.md Plan for PO Approval

This plan is intentionally written as a **PO-reviewable Taskmaster todo.md proposal**. It has not been synced to Airtable and no product code has been changed. The numbering starts at T47 to preserve continuity with the existing T-series graph.

### Phase 6.0 — Governance and Security Blockers

| Proposed ID | Title | Priority | Dependencies | PRD / Source | Acceptance Criteria |
|---|---:|---|---|---|---|
| T47 | Implement Architecture Broadcasts handshake pre-flight | Critical | None | PO Directive §5 | Before any future session work, builder can query Architecture Broadcasts; pending ingestion records halt execution; diff output workflow is documented and ready for Airtable once table exists. |
| T48 | Implement SEC-18 PR approval gate immediately | Critical | None | Doc 11 §5.3; PO Directive §6 | Direct commits to main are blocked through branch protection; PR review is required; status checks are required; evidence is captured before any further code push. |
| T49 | Promote Phase 1 SEC blocker graph into active Taskmaster scope | Critical | T47, T48 | Doc 11; Airtable SEC records | Active graph includes SEC-01 through SEC-19, with Phase 1 SEC dependencies blocking Phase 2+ work. |
| T50 | Implement SEC-02 field-level AES-256-GCM encryption foundation | Critical | T49 | Doc 11 §2.2 | Restricted fields are encrypted with AES-256-GCM; key source is environment-managed; tests prove encrypt/decrypt and no plaintext persistence for PII fields. |
| T51 | Implement SEC-04, SEC-05, SEC-07, SEC-08, SEC-14, and SEC-15 minimum release gate | Critical | T49 | Doc 11 §2.3, §3.2, §4, §5.1 | CSP/HSTS/security headers, real API rate limiting, secret scanning, SAST, password complexity, and brute-force lockout are enforced before public feature expansion. |

### Phase 6.2 — Image Studio Foundation Repair

| Proposed ID | Title | Priority | Dependencies | PRD / Source | Acceptance Criteria |
|---|---:|---|---|---|---|
| T52 | Rebuild Studio state model around standalone design sessions | High | T48–T51 | PRD §26.1, §26.6 | Studio has brand-scoped session state for prompt conversation, selected mode, aspect/platform, canvas objects, versions, selected asset, token estimate, generation status, and export intent. |
| T53 | Add Art Director routing visibility contract to Studio UI | High | T52 | Architecture Lock §2, §4, §5, §6 | UI displays selected route metadata: cache hit/miss, score or zero-shot fallback, selected provider tier/model, duration, token handling, and `enable_art_director_router` state. |
| T54 | Build conversational Studio command surface | High | T52 | PRD §26.3.1, §26.6 | Studio primary input is chat-based; users can refine through conversation; command history is preserved per design session. |
| T55 | Implement slash-command routing and mode picker | High | T54 | PRD §26.3.1 | Slash commands map to mode presets, including `/mockup`, `/poster`, `/flatlay`, `/palette`, `/icon`, `/ugc`, and a visual mode grid for all A1–A22 modes. |
| T56 | Implement aspect ratio, platform, and size selection before generation | High | T52, T55 | PRD §26.3.5; Architecture Lock §3.1.1 A8 | Generation cannot start until required sizing choices are valid; A8 exposes IG/FB/Pinterest/YouTube-oriented platform sizes; custom ratio and resolution metadata are captured. |
| T57 | Implement token economics and billing precheck UI | High | T52, T53 | PRD §25.6; Architecture Lock §4 | The UI estimates token cost before generation, displays cached-pattern free path, reserves/deducts only through backend contract, and handles `insufficient_balance`/`BILLING_FROZEN` without losing user work. |
| T58 | Implement generation lifecycle error, timeout, and retry states | High | T52, T53, T57 | Architecture Lock §5; PO ruling | UI has explicit pending, scoring, cache-hit, zero-shot, generating, saving, success, failed, timeout, and retry states; failure messages are actionable and auditable. |

### Phase 6.3 — 52-Feature Image Studio Completion

| Proposed ID | Title | Priority | Dependencies | PRD / Source | Acceptance Criteria |
|---|---:|---|---|---|---|
| T59 | Expose all 22 generation modes with mode-specific forms and previews | High | T55, T56, T57 | PRD §25.4, §26.3.1; Architecture Lock §3.1 | All A1–A22 modes are selectable through conversation, slash commands, and picker; modes with special pipelines expose required inputs without dead placeholders. |
| T60 | Expose all 10 editing tools with canvas-aware controls | High | T52, T58 | PRD §26.3.2; Architecture Lock §3.2 | Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, and Material Swap are represented with correct required inputs and backend contract guards. |
| T61 | Build Style/Prompt Library | High | T52, T59 | PRD §26.3.3 | Pre-built templates, industry packs, user-saved styles, brand style lock, and community styles V2 are represented with status-aware gating and no false-live placeholders. |
| T62 | Build Brand Vault integration set | High | T50, T52, T59 | PRD §26.3.4; Architecture Lock §3.3–3.4 | `@` mentions resolve vault assets; generated assets auto-save to Cloudflare R2/assets table; Studio and Email Editor asset paths are bidirectional; product import, guidelines export, and asset versioning have explicit user flows. |
| T63 | Build export and output controls | High | T52, T59, T62 | PRD §26.3.5 | Multi-format download supports PNG, JPG, WebP, PDF, transparent PNG; resolution choices include web 72dpi, social 150dpi, print 300dpi; direct-to-email and Brand Kit save flows are represented. |
| T64 | Build freeform canvas workspace and multi-image projects | High | T52, T60, T63 | PRD §26.3.6 | Infinite/freeform canvas supports arranging and comparing multiple images; version history, undo/redo, side-by-side comparison, and multi-image project organization are represented. |
| T65 | Build Image Studio collaboration pins and review overlay | Medium | T64 | PRD §27.2 | Users can pin comments at image pixel coordinates, view threaded replies, and resolve/dim pins without breaking the canvas workflow. |

### Phase 6.4 — Validation, Accessibility, and Cross-Surface Wiring

| Proposed ID | Title | Priority | Dependencies | PRD / Source | Acceptance Criteria |
|---|---:|---|---|---|---|
| T66 | Add Image Studio coverage matrix and tests | High | T59–T65 | PO Directive; PRD §26 | Tests cover the six PO gaps, all feature categories, token failure, scoring visibility, export controls, and no-placeholder gating. |
| T67 | Validate Email Editor and Brand Vault bidirectional asset flow | High | T62, T63, T66 | PRD §26.3.4–26.3.5 | Assets created in Studio are available in the Email Editor, and assets from Email Editor/Vault are selectable in Studio; metadata and brand scoping remain correct. |
| T68 | Run ADA, keyboard, and screen-reader pass for Studio | Medium | T54–T65 | Platform accessibility policy | Chat, slash command picker, mode grid, canvas controls, error states, and export dialogs are keyboard reachable and labeled. |
| T69 | Execute full static, unit, integration, build, and browser validation | High | T66–T68 | VIYO protocol | Lint, type-check, tests, build, and live browser validation pass with screenshots and logs attached. |

### Phase 6.5 — PO Review and Controlled Execution

| Proposed ID | Title | Priority | Dependencies | PRD / Source | Acceptance Criteria |
|---|---:|---|---|---|---|
| T70 | Submit proposed Taskmaster graph and source coverage matrix for PO approval | Critical | T47–T69 planned | PO Directive §4 | PO approves task breakdown before Airtable sync or implementation. |
| T71 | After PO approval only, sync approved graph to Airtable | Critical | T70 approved | PO Directive §4–5 | Approved tasks are synced to Build Tracker; Architecture Broadcast diff is updated if table exists; no unapproved tasks are introduced. |
| T72 | Execute implementation in ordered repair increments | High | T71 | Approved plan | Work proceeds only in dependency order, with security blockers enforced and deploy gates honored. |

## 5. 52-Feature Coverage Matrix

This matrix proves the proposed graph covers every PRD §26 feature category. It intentionally avoids a false claim that each feature is already implemented; the current state is **planned, pending PO approval**.

| Category | Feature Count | Features Covered | Proposed Tasks |
|---|---:|---|---|
| Generation Modes | 22 | A1 Standard Photo, A2 Typography Poster, A3 Compositional Poster, A4 Brand Mockup, A5 Product Flat Lay, A6 Product-on-Model, A7 3D Brand Mascot, A8 Social Media Templates, A9 Color Palette Extraction, A10 Pattern/Texture, A11 Icon/Badge, A12 Animated GIF, A13 Style Invention, A14 Seasonal/Holiday, A15 Unified Brand Kit, A16 Before/After, A17 Infographic, A18 Meme/Viral, A19 Email Section Variants, A20 Character Consistency, A21 AI Product Photography, A22 AI UGC Content. | T55, T56, T59 |
| Editing Tools | 10 | Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, Material Swap. | T60 |
| Style/Prompt Library | 5 | Pre-Built Templates, Industry Prompt Packs, User-Saved Styles, Brand Style Lock, Community Styles V2. | T61 |
| Brand Vault Integration | 6 | `@` Mention System, Auto-Save to Vault, Bidirectional with Email Editor, Product Photo Import, Brand Guidelines PDF Export, Asset Versioning. | T62, T67 |
| Export & Output | 5 | Multi-Format Download, Direct to Email Editor, Multi-Size Generation, Transparent PNG, Brand Asset Save. | T56, T63, T67 |
| Canvas & Workspace | 4 | Freeform Canvas, Conversational Interface, Version History, Multi-Image Projects. | T52, T54, T64 |
| **Total** | **52** | **All PRD §26 feature inventory categories represented.** | **T52–T67** |

## 6. Security Dependency Matrix

The directive discovered that SEC features remained Not Started in Airtable. I verified that Airtable Build Tracker records for SEC-02, SEC-04, SEC-05, SEC-07, SEC-08, SEC-14, SEC-15, and SEC-18 are present and still marked `Not Started`; this matches the directive’s blocker finding.[6]

| Security ID | Status Observed | Must Block | Proposed Enforcement |
|---|---|---|---|
| SEC-02 | Not Started | Any task writing PII or Restricted fields | T50 becomes dependency for Brand Vault, auth, billing, and audit-sensitive tasks. |
| SEC-04 | Not Started | Any production deployment | T51 blocks deployment and browser-public release gates. |
| SEC-05 | Not Started | Any public API endpoint task | T51 blocks generation and editing endpoints until real route-level rate limiting is enforced. |
| SEC-07 | Not Started | Any code push | T51 requires secret-scanning hooks before further implementation commits. |
| SEC-08 | Not Started | Any PR or merge | T51 requires SAST in CI before feature merge. |
| SEC-14 | Not Started | Auth-related work | T51 blocks auth tasks until password policy enforcement exists. |
| SEC-15 | Not Started | Auth-related work | T51 blocks auth tasks until brute-force protection exists. |
| SEC-18 | Not Started | Any further code push | T48 is the immediate first execution task after PO approval. |

## 7. Architecture Broadcasts Handshake Finding

The PO directive states that a new Airtable table named **Architecture Broadcasts** will act as the automated command bus. I checked the currently configured Airtable base and found the existing tables: **VIYO Q&A Master Log**, **Build Tracker**, **Skills Registry**, and **Services Inventory**. The Architecture Broadcasts table was not present in the table list at the time of this check.[6]

This does not invalidate the policy. It creates a setup dependency: T47 must either use the new table once the PO creates it or request the base/table ID if it exists elsewhere. Until that table is available, I will treat any new architecture document or directive from the user as a manual broadcast requiring halt, ingestion, diff proposal, and PO approval.

## 8. Recommended Approval Decision

My recommendation is to approve only the **planning deliverable**, not implementation yet. The safest next decision is for the PO to review the proposed T47–T72 graph, adjust scope if needed, then approve the graph for Airtable sync. After approval, the first executable item should be **T48 / SEC-18**, because the directive explicitly says this must be implemented immediately before any more code is pushed.[1]

| Decision Point | Recommendation | Reason |
|---|---|---|
| Resume Phase 6 UI coding now | **Do not approve yet** | PO directive blocks code until new todo.md plan is approved. |
| Approve this task graph for Airtable sync | **Approve after review or edits** | It covers security blockers, handshake, six UI gaps, and all 52 PRD §26 features. |
| First execution task after approval | **T48 SEC-18** | Direct pushes to main and absent PR approval gate are live workflow vulnerabilities. |
| Phase 6 product execution order | **Security gates → Studio foundation → 52-feature UI → validation** | Prevents the same missing-prerequisite failure from recurring. |

## 9. References

[1]: https://manus.im/share/file/c8132426-b265-47f1-a61c-bef13cfb76c3 "PO Directive to Builder: Phase 6 Root Cause Correction"
[2]: file:///home/ubuntu/upload/VIYO_PRD_V5_ADDENDUM.docx "VIYO PRD V5 Addendum"
[3]: file:///home/ubuntu/viyo-source-of-truth/T46_ROUTING_ARCHITECTURE_LOCK.md "T46 Routing Architecture Lock v6.1"
[4]: file:///home/ubuntu/VIYO/docs/foundation/VIYO_Final_Doc11_Security_Architecture.md "VIYO Document 11: Security Architecture & Compliance Protocol"
[5]: file:///home/ubuntu/VIYO/.taskmaster/docs/SPRINT2_HANDOFF.md "VIYO Sprint 2 Session Handoff"
[6]: file:///home/ubuntu/.mcp/tool-results/2026-04-28_19-58-48_airtable_search_records.json "Airtable Build Tracker SEC Status Search"
[7]: file:///home/ubuntu/.mcp/tool-results/2026-04-28_19-58-33_airtable_list_tables.json "Airtable Base Table List"
