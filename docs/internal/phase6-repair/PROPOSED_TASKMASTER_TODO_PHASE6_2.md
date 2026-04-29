# Proposed Taskmaster todo.md — Phase 6 Root Cause Correction

**Status:** Draft for PO review only.
**Important:** This plan has **not** been synced to Airtable, and no product code has been changed.
**Source basis:** PO Directive, PRD V5 Addendum §26, T46 Architecture Lock v6.1, and Doc 11 Security Architecture.

## Blocking Rule

Phase 6 UI implementation remains **blocked** until the PO approves this revised task graph. After approval, the first implementation item must be the security workflow gate, especially SEC-18, before any further code push.

## Proposed Task Graph

| ID | Title | Phase | Priority | Dependencies | Status | Source Coverage |
|---|---|---|---|---|---|---|
| T47 | Implement Architecture Broadcasts handshake pre-flight | 6.0 Governance | Critical | None | Pending PO approval | PO Directive §5 |
| T48 | Implement SEC-18 PR approval gate immediately | 6.0 Security | Critical | None | Pending PO approval | Doc 11 §5.3; PO Directive §6 |
| T49 | Promote SEC-01 through SEC-19 into active Taskmaster blocker graph | 6.0 Security | Critical | T47, T48 | Pending PO approval | Doc 11; Airtable SEC records |
| T50 | Implement SEC-02 field-level AES-256-GCM encryption foundation | 6.0 Security | Critical | T49 | Pending PO approval | Doc 11 §2.2 |
| T51 | Implement minimum security release gate: SEC-04, SEC-05, SEC-07, SEC-08, SEC-14, SEC-15 | 6.0 Security | Critical | T49 | Pending PO approval | Doc 11 §2.3, §3.2, §4, §5.1 |
| T52 | Rebuild Studio state model around standalone design sessions | 6.2 Studio Foundation | High | T48–T51 | Pending PO approval | PRD §26.1, §26.6 |
| T53 | Add Art Director routing visibility contract to Studio UI | 6.2 Studio Foundation | High | T52 | Pending PO approval | Architecture Lock §2, §4, §5, §6 |
| T54 | Build conversational Studio command surface | 6.2 Studio Foundation | High | T52 | Pending PO approval | PRD §26.3.1, §26.6 |
| T55 | Implement slash-command routing and mode picker | 6.2 Studio Foundation | High | T54 | Pending PO approval | PRD §26.3.1 |
| T56 | Implement aspect ratio, platform, and size selection before generation | 6.2 Studio Foundation | High | T52, T55 | Pending PO approval | PRD §26.3.5; Architecture Lock §3.1.1 A8 |
| T57 | Implement token economics and billing precheck UI | 6.2 Studio Foundation | High | T52, T53 | Pending PO approval | PRD §25.6; Architecture Lock §4 |
| T58 | Implement generation lifecycle error, timeout, and retry states | 6.2 Studio Foundation | High | T52, T53, T57 | Pending PO approval | Architecture Lock §5; PO ruling gaps |
| T59 | Expose all 22 generation modes with mode-specific forms and previews | 6.3 Feature Completion | High | T55, T56, T57 | Pending PO approval | PRD §25.4, §26.3.1; Architecture Lock §3.1 |
| T60 | Expose all 10 editing tools with canvas-aware controls | 6.3 Feature Completion | High | T52, T58 | Pending PO approval | PRD §26.3.2; Architecture Lock §3.2 |
| T61 | Build Style/Prompt Library | 6.3 Feature Completion | High | T52, T59 | Pending PO approval | PRD §26.3.3 |
| T62 | Build Brand Vault integration set | 6.3 Feature Completion | High | T50, T52, T59 | Pending PO approval | PRD §26.3.4; Architecture Lock §3.3–3.4 |
| T63 | Build export and output controls | 6.3 Feature Completion | High | T52, T59, T62 | Pending PO approval | PRD §26.3.5 |
| T64 | Build freeform canvas workspace and multi-image projects | 6.3 Feature Completion | High | T52, T60, T63 | Pending PO approval | PRD §26.3.6 |
| T65 | Build Image Studio collaboration pins and review overlay | 6.3 Collaboration | Medium | T64 | Pending PO approval | PRD §27.2 |
| T66 | Add Image Studio coverage matrix and tests | 6.4 Validation | High | T59–T65 | Pending PO approval | PO Directive; PRD §26 |
| T67 | Validate Email Editor and Brand Vault bidirectional asset flow | 6.4 Validation | High | T62, T63, T66 | Pending PO approval | PRD §26.3.4–26.3.5 |
| T68 | Run ADA, keyboard, and screen-reader pass for Studio | 6.4 Validation | Medium | T54–T65 | Pending PO approval | Accessibility requirement |
| T69 | Execute full static, unit, integration, build, and browser validation | 6.4 Validation | High | T66–T68 | Pending PO approval | VIYO protocol |
| T70 | Submit proposed Taskmaster graph and source coverage matrix for PO approval | 6.5 Approval | Critical | T47–T69 planned | Pending PO approval | PO Directive §4 |
| T71 | After PO approval only, sync approved graph to Airtable | 6.5 Approval | Critical | T70 approved | Blocked | PO Directive §4–5 |
| T72 | Execute implementation in ordered repair increments | 6.5 Execution | High | T71 | Blocked | Approved plan |

## Feature Coverage Checklist

| PRD §26 Category | Required Count | Covered By | Coverage Result |
|---|---:|---|---|
| Generation Modes | 22 | T55, T56, T59 | Covered |
| Editing Tools | 10 | T60 | Covered |
| Style/Prompt Library | 5 | T61 | Covered |
| Brand Vault Integration | 6 | T62, T67 | Covered |
| Export & Output | 5 | T56, T63, T67 | Covered |
| Canvas & Workspace | 4 | T52, T54, T64 | Covered |
| **Total** | **52** | **T52–T67** | **Covered** |

## Six PO Ruling Gap Checklist

| Gap | Covered By | Status |
|---|---|---|
| Aspect Ratio Selector | T56, T59 | Planned |
| Token Economics & Billing UI | T57 | Planned |
| Conversational Interface and Slash Commands | T54, T55 | Planned |
| Error States and Scoring Visibility | T53, T58 | Planned |
| Style/Prompt Library | T61 | Planned |
| Multi-Format Export | T63 | Planned |

## Security Hard-Prerequisite Checklist

| Security Task | Must Block | Covered By |
|---|---|---|
| SEC-18 PR approval gate | Any further code push | T48 |
| SEC-02 AES-256-GCM encryption | PII/Restricted data persistence | T50 |
| SEC-04 HTTP security headers | Production deployment | T51 |
| SEC-05 public API rate limiting | Public API endpoint work | T51 |
| SEC-07 pre-commit secret detection | Code push | T51 |
| SEC-08 SAST scanning in CI | PR/merge | T51 |
| SEC-14 password complexity | Auth-related work | T51 |
| SEC-15 brute-force lockout | Auth-related work | T51 |
