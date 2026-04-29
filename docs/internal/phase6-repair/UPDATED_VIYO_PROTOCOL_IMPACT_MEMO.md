# Updated VIYO Development Protocol Impact Memo

**Author:** Manus AI
**Date:** 2026-04-28
**Context:** User notified that `/viyo-development-protocol-v2` was updated. The updated protocol was re-read before any further VIYO planning, Airtable sync, or product-code work.

## Summary

The updated VIYO protocol reinforces that all future VIYO work must run through a strict **Phase 0–8 workflow** with only two normal PO stop gates: **Phase 2 Architecture & Wiring Plan approval** and **Phase 7 Deploy Gate approval**. No code may be written before Phase 2 approval, and no deployment may occur before live validation and quality gates clear.

## High-Impact Process Changes / Confirmations

| Area | Updated Protocol Requirement | Impact on Phase 6 Root-Cause Correction |
|---|---|---|
| Source access | The protocol now states that the KB is pushed to GitHub and should be cloned/pulled from GitHub only; direct Google Drive access is prohibited unless superseded by direct PO instruction. | Future ingestion must first look for canonical documents in GitHub. If PO directs use of a Drive artifact, direct PO instruction is highest authority, but the conflict should be made explicit. |
| Specification files in repo | Foundation docs, research specs, and architecture locks must not be committed to the repo in any format. | The prior internal planning deliverables should remain implementation-planning artifacts only; canonical specs must not be copied into the repository as source-of-truth documents. |
| Stop gates | Only Phase 2 and Phase 7 normally pause for PO approval; continuous phases should not stop unless a blocking gap or 3 failed retries occurs. | The Phase 6.2 corrective task graph must pause for PO approval at the plan gate before any implementation. |
| Task sizing | Every task starts with Phase 0 size classification. Composite bundles are Medium or Large; Large needs explicit PO confirmation that L treatment is warranted. | Phase 6.2 Image Studio + SEC blockers is Large unless decomposed into smaller approved tasks. |
| Foundational fixes | Any bug/fix/regression requires the Foundational Fix Gate before status changes to in-progress. | The rejected Phase 6 repair remains a regression/foundational correction, not a normal feature sprint. |
| 13-layer blueprint | Phase 2 must include the full 13-layer VIYO wiring blueprint with explicit affected/not-affected justification. | The proposed Phase 6.2 plan must be expanded into a full 13-layer architecture plan before code. |
| Internal records | `docs/internal/*` records must be updated incrementally during implementation phases, not rebuilt during completion. | Build journal, source map, decision log, integration map, open questions, research log, and KB candidates must be maintained as work progresses. |
| Code documentation | Every `.ts/.tsx` file must begin with a JSDoc block stating purpose, spec, and wiring layer; exported functions need role comments. | Future Image Studio implementation files must be documented at file and exported-function level. |
| CI and infrastructure | Honest CI, no dead infrastructure, bundle budget, pipeline verification, and post-push pipeline checks are mandatory. | SEC-18 and CI/branch protections must be handled before continued feature pushes; any missing infrastructure must be logged as a gap/task rather than stubbed. |
| Phase 8 | Phase 8 is capped at 10 minutes, with mechanical status flips and no new analysis or files. | Detailed documentation must be produced during earlier phases, not saved for completion. |

## Noted Protocol Conflict / Gap to Watch

The updated protocol says to use GitHub as the canonical working KB and avoid direct Google Drive access. The PO Phase 6 root-cause directive, however, explicitly referenced PRD V5 Addendum and Architecture Lock v6.1 documents that were previously obtained from Drive. Because direct PO chat instructions outrank protocol references, PO-provided Drive instructions can still govern a specific task, but future execution should first confirm where the canonical GitHub-pushed copy lives. If the required current PRD Addendum or Architecture Lock is not present in GitHub, that is a **blocking source-of-truth gap** before implementation.

## Immediate Operating Rule Going Forward

Before any further VIYO implementation, I will treat the current state as: **halted at planning**, requiring updated-protocol-compliant Phase 0 sizing, Phase 1 source alignment from GitHub where available, Phase 2 13-layer architecture/wiring plan approval, and explicit PO approval before code.
