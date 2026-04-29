# Task 66 — T51b SEC-04 and SEC-05 Network Hardening Trigger Evaluation

**Status recommendation:** Deferred until the specified network-hardening triggers fire.
**Taskmaster ID:** 66.
**Taskmaster title:** T51b: SEC-04 and SEC-05 Network Hardening.
**Taskmaster description:** Split security-header and rate-limiting implementation according to their distinct triggers.
**Taskmaster dependency:** Task 64 is complete.

## Trigger decision

Task 66 is a **split trigger-bound security task**. Its Taskmaster details explicitly separate the activation points for the two controls:

| Security control | Trigger | Current Phase 6.2 status |
|---|---|---|
| SEC-04 security headers | First auth/database surface | Not triggered by the current Image Studio provider-registry, shared-contract, router, UI, export, accessibility, and validation workstream. |
| SEC-05 rate limiting | First public deployment | Not triggered by local Phase 6.2 implementation and validation. |

The PO directive requires Phase 1–4 security to remain trigger-bound and not to be implemented prematurely. The current continuation path after Task 64 does not create or materially change an auth/database surface and does not constitute first public deployment. Therefore, implementing Task 66 now would collapse two distinct triggers into premature infrastructure work.

## Binding implementation guardrail

Task 66 remains mandatory when either trigger fires. The following stop conditions must be enforced before merge:

| Future trigger event | Required action before merge |
|---|---|
| First auth/database surface is created or materially changed | Implement and validate SEC-04 security headers on that surface. |
| First public deployment is initiated | Implement and validate SEC-05 rate limiting using the directive-defined limits. |
| Any feature attempts to expose a public endpoint without deployment readiness review | Stop, evaluate SEC-05, and record whether rate limiting is required before proceeding. |
| Any future task tries to defer SEC-04 until deployment despite an auth/database surface existing | Stop and execute SEC-04 immediately, because the security-header trigger is earlier than public deployment. |

## Boundary

This artifact does not mark SEC-04 or SEC-05 implementation as built. It records that neither activation trigger has fired in the current Phase 6.2 Image Studio workstream and that Task 66 must remain visible as a deferred security gate until one of its split triggers occurs.

No product code was modified for this evaluation.
