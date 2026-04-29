# Task 67 — T51c SEC-07 and SEC-08 CI Hardening Trigger Evaluation

**Taskmaster ID:** 67.
**Taskmaster title:** T51c: SEC-07 and SEC-08 CI Hardening.
**Taskmaster description:** Separate Phase 0 push-time scanning from pre-paying-customer SAST/SCA requirements.
**Taskmaster dependency:** Task 63 is complete.

## Trigger separation decision

Task 67 contains two distinct security obligations that must not be collapsed into a single immediate implementation step. The Phase 0 obligation is already satisfied by Task 63. The SAST/SCA obligation remains a future gate that must be executed before the first paying customer.

| Control area | Required trigger | Current evidence | Current status |
|---|---|---|---|
| Phase 0 push-time secret scanning | Immediate Phase 0 / before product-code commits | Task 63 completed TruffleHog pre-commit controls, GitHub secret-scanning evidence, `.gitignore` secret-file patterns, explicit `.env` history checks, and clean TruffleHog scan evidence. | Complete through Task 63. |
| SEC-07 / SEC-08 SAST and SCA | Before first paying customer | Repository CI currently contains `ci.yml` and manual `deploy.yml`; no first-paying-customer trigger is active in this Phase 6.2 Image Studio workstream. | Trigger-bound; not yet implemented or claimed as implemented. |
| Merge-blocking Critical/High findings | Same first-paying-customer SAST/SCA trigger | Must be enforced when CodeQL and Dependabot/SCA are introduced. | Future guardrail. |

## Current CI inventory

The repository currently contains the following CI files:

| File | Observed role | Task 67 implication |
|---|---|---|
| `.github/workflows/ci.yml` | Lint, type-check, build, and Dockerfile lint on push/PR. | Baseline CI exists but is not a CodeQL SAST or Dependabot/SCA implementation. |
| `.github/workflows/deploy.yml` | Manual-only deploy pipeline that reuses CI and requires Render configuration before deploy. | Public deployment is not automatically active from this file. |
| `.github/dependabot.yml` | Not present in the current inventory. | Dependabot/SCA remains future first-paying-customer work. |
| `.github/workflows/codeql.yml` | Not present in the current inventory. | CodeQL SAST remains future first-paying-customer work. |

## Binding guardrail for future work

The following conditions must be enforced before VIYO can serve its first paying customer:

| Future condition | Required action |
|---|---|
| First-paying-customer milestone is scheduled or attempted | Add CodeQL SAST and Dependabot/SCA configuration before the milestone proceeds. |
| Critical or High SAST/SCA finding appears | Block merge until remediated or explicitly escalated and approved through the VIYO security process. |
| A future PR claims production/paying-customer readiness | Verify CodeQL and Dependabot/SCA are active and their Critical/High findings are merge-blocking. |
| A future task tries to treat Task 63 secret scanning as a substitute for SAST/SCA | Stop; Task 63 covers secret exposure, not full SAST/SCA. |

## Completion classification

This artifact completes the Task 67 **trigger-separation gate** by explicitly preserving both required trigger notes: Phase 0 push-time scanning is complete through Task 63, while CodeQL and Dependabot/SCA are still first-paying-customer gates and are not implemented or claimed as complete in this Phase 6.2 Image Studio cycle.

No product code was modified for this evaluation.
