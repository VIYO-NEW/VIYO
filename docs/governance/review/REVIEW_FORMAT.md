# REVIEW_FORMAT.md
The file formats for VIYO 3-agent review. Author / Adversary / Arbiter communicate ONLY through these files — never directly.

## REVIEW_<deliverable>.md  (Adversary writes)
---
# REVIEW — <deliverable name>
Reviewed: <date> · Adversary
Deliverable reviewed at: <commit SHA or disk path>
Spec measured against: <spec reference>

## Findings
### Finding 1
- LOCATION: <section/line>
- FINDING: <what is wrong/missing/unsupported/contradictory>
- REASONING: <why it fails — cite spec clause or Lock>
- SEVERITY: Red / Yellow / Green

### Finding 2
...

## Summary
<N Red, N Yellow, N Green. Or: "No Red or Yellow findings.">
---

## ARBITRATION_<deliverable>.md  (Arbiter writes)
---
# ARBITRATION — <deliverable name>
Arbitrated: <date> · Arbiter
Against REVIEW dated: <date>

## Rulings
### Finding 1 — <VALID / INVALID / ESCALATE>
- REASONING: <why — cite spec or Lock>
- REQUIRED CHANGE: <if VALID: what must change. if INVALID: none. if ESCALATE: the decision the PO must make>

### Finding 2 — ...

## Arbiter Addendum (if any)
<anything the Arbiter spotted that the Adversary missed — flagged for PO attention, NOT auto-added to the Author's fix list>

## Disposition
- VALID findings: <count> — Author applies
- INVALID findings: <count> — no action
- ESCALATE findings: <count> — PO decision required before Author proceeds
---

## Rules
- Files live in the repo at /docs/governance/review/ — they are the handoff surface, version-controlled.
- One REVIEW + one ARBITRATION per deliverable.
- The PO reads ARBITRATION only — not REVIEW, not the intermediate work — unless they choose to.
- If ARBITRATION has zero VALID and zero ESCALATE findings → the deliverable is clean, PO ratifies as-is.
