# Portal Build Log

## 2026-05-11 — Phase 1 Gap Triage Scheduled Fix

When the first test suite is authored under any package, the directive authoring that suite must include as a deliverable: "deduplicate `--passWithNoTests` flag in the test command path — remove from whichever level (root or package) is downstream of the other." Default decision: keep `--passWithNoTests` at the root invocation level, remove from any package-level `scripts.test` entries.

This entry records the FIX-SCHEDULED outcome for ZCBR-PHASE1-GAP-TRIAGE Gap 2. The test command path is intentionally not changed in this directive because no test suites exist yet and CI explicitly excludes `pnpm test`.
