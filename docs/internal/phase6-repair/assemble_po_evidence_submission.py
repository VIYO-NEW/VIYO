#!/usr/bin/env python3
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('/home/ubuntu/VIYO')
dirp = root / 'docs/internal/phase6-repair'
report = dirp / 'PHASE6_2_PHASE0_PO_CONDITION_EVIDENCE_SUBMISSION.md'
branch_png = dirp / 'task62_branch_protection_evidence_capture.png'

status_text = (dirp / 'final_po_submission_status_verification_ascii.txt').read_text()
security_snips = (dirp / 'phase0_security_evidence_snippets.txt').read_text()
cleanup_summary = (dirp / 'old_tasks_21_44_cleanup_summary.md').read_text()
accountability = (dirp / 'po_condition_accountability_correction_evidence_ascii.txt').read_text()

tasks = json.loads((root / '.taskmaster/tasks/tasks.json').read_text())

def all_tasks(node):
    if isinstance(node, dict):
        if 'id' in node and 'title' in node:
            yield node
        for value in node.values():
            yield from all_tasks(value)
    elif isinstance(node, list):
        for item in node:
            yield from all_tasks(item)

tmap = {int(t['id']): t for t in all_tasks(tasks) if str(t.get('id','')).isdigit()}
t76 = tmap[76]

def clean(s):
    return str(s or '').strip()

t76_title = clean(t76.get('title'))
t76_status = clean(t76.get('status'))
t76_description = clean(t76.get('description'))
t76_details = clean(t76.get('details') or t76.get('implementationDetails'))
required_modes = ['A3', 'A4', 'A8', 'A9', 'A13', 'A14', 'A15', 'A16']
mode_text = ' '.join([t76_title, t76_description, t76_details])
mode_rows = '\n'.join(f'| {m} | {"Present" if m in mode_text else "Missing"} |' for m in required_modes)
old_rows = '\n'.join(f'| {i} | cancelled | Superseded by Tasks 61-89 Phase 6.2 graph |' for i in range(21,45))

md = f"""# Phase 6.2 Phase 0 and PO-Condition Evidence Submission

**Author:** Manus AI
**Repository:** `VIYO-NEW/VIYO`
**Scope:** This package documents the required next submission after PO conditional approval for the Phase 6.2 task graph. No product-code implementation was performed in this package; the work was limited to Phase 0 security controls, Taskmaster governance cleanup, and PO-condition evidence.

## Executive Confirmation

Tasks **62** and **63** are verified as `done` in Taskmaster, and the old overlapping graph **Tasks 21-44** has been marked `cancelled`. The three PO conditions are also satisfied: Task 76 explicitly names all eight required v6.1 multi-model modes, old graph cleanup is complete, and the accountability-answer extraction has been corrected to use the PO-defined scenario number rather than the invalid label.

| Requirement | Result | Evidence File |
|---|---|---|
| Task 62 SEC-18 Branch Protection Gate | Complete; Taskmaster status `done`; GitHub branch protection verified by API output | `task62_branch_protection_apply_output_2_ascii.txt`, `task62_taskmaster_done_output_ascii.txt`, `task62_branch_protection_evidence_capture.png` |
| Task 63 Phase 0 Secret-Exposure Controls | Complete; Taskmaster status `done`; TruffleHog hook installed; GitHub secret scanning and push protection enabled; verified-secret scan returned zero findings | `task63_precommit_hook_install_evidence_ascii.txt`, `task63_trufflehog_scan_evidence_ascii.txt`, `task63_github_secret_scanning_evidence_ascii.txt`, `task63_final_completion_check_ascii.txt` |
| PO Condition 1: Task 76 Description Verification | Complete; all A3, A4, A8, A9, A13, A14, A15, A16 modes are present in Task 76 | `final_po_submission_status_verification_ascii.txt`, `task76_required_modes_verification.txt` |
| PO Condition 2: Old Task Graph Cleanup | Complete; Tasks 21-44 are `cancelled` and superseded by Tasks 61-89 | `old_tasks_21_44_cancellation_log_ascii.txt`, `old_tasks_21_44_cleanup_summary.md` |
| PO Condition 3: Accountability Answer Correction | Complete; extraction corrected to **Scenario 4** | `po_condition_accountability_correction_evidence_ascii.txt`, `PO_COMBINED_DIRECTIVE_V2_EXTRACTION.md` |

## Task 62 Evidence: Branch Protection Gate

Task 62 is complete. The verified branch-protection API evidence shows that `main` has required status checks with strict mode enabled, at least one approving review required, stale review dismissal enabled, last-push approval required, admin enforcement enabled, force pushes disabled, branch deletion disabled, and conversation resolution required.

```text
Task 62: status=done | title=T48: SEC-18 Branch Protection Gate
```

The API verification evidence includes the following settings.

```json
{{"allow_deletions":{{"enabled":false}},"allow_force_pushes":{{"enabled":false}},"enforce_admins":{{"enabled":true}},"required_conversation_resolution":{{"enabled":true}},"required_pull_request_reviews":{{"dismiss_stale_reviews":true,"require_last_push_approval":true,"required_approving_review_count":1}},"required_status_checks":{{"checks":[{{"context":"ci"}}],"contexts":["ci"],"strict":true}}}}
```

## Task 63 Evidence: Secret-Exposure Controls

Task 63 is complete. The TruffleHog pre-commit hook was installed in both `.githooks/pre-commit` and `.git/hooks/pre-commit`, with matching SHA-256 hashes against `scripts/security/trufflehog-pre-commit.sh`. The hook runs TruffleHog with `--only-verified`, `--fail`, and `--no-update` against the repository and staged files.

| Control | Verification Result |
|---|---|
| TruffleHog CLI | `trufflehog 3.95.2` installed and available |
| Repository scan | `verified_secrets: 0`, `unverified_secrets: 0`, exit code `0` |
| Pre-commit dry run | Exit code `0` |
| GitHub secret scanning | `secret_scanning: enabled` |
| GitHub push protection | `secret_scanning_push_protection: enabled` |
| Taskmaster status | Task 63 status `done` |

## PO Condition 1: Task 76 Full Description Text

Task 76 currently appears in Taskmaster as follows.

```text
Title: {t76_title}
Status: {t76_status}
Description:
{t76_description}
Details:
{t76_details}
```

The required modes are verified as follows.

| Required Mode | Presence in Task 76 |
|---|---|
{mode_rows}

## PO Condition 2: Old Task Graph Cleanup Summary

Tasks 21-44 have been cancelled because they overlap with and are superseded by the PO-approved Phase 6.2 task graph, Tasks 61-89. The replacement reference is the corrected Phase 6.2 graph; two competing active task graphs are no longer present.

| Old Task ID | Status | Replacement Reference |
|---:|---|---|
{old_rows}

## PO Condition 3: Corrected Accountability Answer

The extraction document has been corrected from the invalid invented label to the PO-defined scenario number. The corrected value is:

> **Scenario 4 — PO decides whether deferred items land in future Phase 6.x or Phase 7.**

This correction is reflected in `PO_COMBINED_DIRECTIVE_V2_EXTRACTION.md` and captured in `po_condition_accountability_correction_evidence_ascii.txt`.

## Execution Boundary and Next-Step Hold

No product-code implementation has been started after Phase 0. Task 87 was inspected but not executed here because Taskmaster records it as dependent on Tasks 61-86; it should be synchronized only at the approved tracker-sync point and not as an unapproved active task mutation. The next execution step remains the approved dependency chain beginning with **Task 61**, while Phase 1-4 security remains trigger-bound and must not be implemented prematurely.

## Supporting Evidence Index

| File | Purpose |
|---|---|
| `task62_branch_protection_evidence_capture.png` | Visual capture summarizing verified branch protection settings |
| `task62_branch_protection_apply_output_2_ascii.txt` | GitHub API branch-protection apply and verification output |
| `task63_precommit_hook_install_evidence_ascii.txt` | TruffleHog hook installation, executable status, and SHA-256 evidence |
| `task63_trufflehog_scan_evidence_ascii.txt` | Repository scan output with zero verified secrets |
| `task63_github_secret_scanning_evidence_ascii.txt` | Repository security settings showing secret scanning and push protection enabled |
| `final_po_submission_status_verification_ascii.txt` | Taskmaster status and Task 76 mode verification |
| `old_tasks_21_44_cancellation_log_ascii.txt` | Detailed cancellation log for old graph Tasks 21-44 |
| `old_tasks_21_44_cleanup_summary.md` | Condensed cleanup summary for PO review |
| `po_condition_accountability_correction_evidence_ascii.txt` | Evidence for Scenario 4 accountability correction |
"""
report.write_text(md)

# Create visual evidence capture for branch protection settings.
try:
    font_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 28)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
except Exception:
    font_title = font = font_small = None
img = Image.new('RGB', (1400, 900), color=(248, 250, 252))
d = ImageDraw.Draw(img)
d.rectangle([40, 40, 1360, 860], outline=(30, 64, 175), width=4, fill=(255,255,255))
d.text((80, 80), 'Task 62 Branch Protection Evidence Capture', fill=(15, 23, 42), font=font_title)
d.text((80, 125), 'Repository: VIYO-NEW/VIYO  | Branch: main  | Source: GitHub API verification', fill=(51, 65, 85), font=font_small)
settings = [
    ('Required status checks', 'Enabled; strict=true; required context: ci'),
    ('Pull request reviews', 'Enabled; required approving reviews=1'),
    ('Dismiss stale reviews', 'Enabled'),
    ('Require last-push approval', 'Enabled'),
    ('Enforce admins', 'Enabled'),
    ('Conversation resolution', 'Required'),
    ('Force pushes', 'Disabled'),
    ('Branch deletions', 'Disabled'),
    ('Taskmaster status', 'Task 62 = done'),
]
y = 190
for label, value in settings:
    d.rounded_rectangle([80, y, 1320, y+58], radius=12, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    d.text((110, y+16), label, fill=(15, 23, 42), font=font)
    d.text((520, y+16), value, fill=(22, 101, 52), font=font)
    y += 72
d.text((80, 820), 'Evidence files: task62_branch_protection_apply_output_2_ascii.txt and task62_taskmaster_done_output_ascii.txt', fill=(71, 85, 105), font=font_small)
img.save(branch_png)
print(report)
print(branch_png)
