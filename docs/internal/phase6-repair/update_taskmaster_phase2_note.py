#!/usr/bin/env python3
"""Append Phase 2 Image Studio repair planning note to Taskmaster JSON deterministically."""
from __future__ import annotations

import json
from pathlib import Path

path = Path('/home/ubuntu/VIYO/.taskmaster/tasks/tasks.json')
data = json.loads(path.read_text())

note = (
    "\n\nPHASE 2 ARCHITECTURE PLAN: Completed and saved at "
    "docs/internal/phase6-repair/PHASE6_IMAGE_STUDIO_REPAIR_ARCHITECTURE_PLAN.md. "
    "Plan audits current ImageStudio monolith, studio contract, shared Art Director schema, "
    "API wrapper, tests, and billing modal; confirms no product-code changes yet. Proposed "
    "repair rebuilds Studio as standalone design workspace with Studio Library and Mode Planner, "
    "Conversational Composer, Canvas and Generation Inspector, explicit generation state machine, "
    "billing/token preflight, mode-aware aspect/platform selector, error/scoring visibility, "
    "style/prompt library, and export controls. Awaiting PO approval before implementation."
)

updated = False
task_container = data.get('master', data)
for task in task_container.get('tasks', []):
    if str(task.get('id')) == '26':
        for subtask in task.get('subtasks', []):
            if str(subtask.get('id')) == '1':
                details = subtask.get('details', '')
                if 'PHASE 2 ARCHITECTURE PLAN:' not in details:
                    subtask['details'] = details + note
                subtask['updatedAt'] = '2026-04-28T22:44:30.000Z'
                task['updatedAt'] = '2026-04-28T22:44:30.000Z'
                task_container.setdefault('metadata', {})['lastModified'] = '2026-04-28T22:44:30.000Z'
                updated = True
                break
        break

if not updated:
    raise SystemExit('Could not locate Taskmaster task 26 subtask 1')

path.write_text(json.dumps(data, indent=2) + '\n')
print('Taskmaster subtask 26.1 Phase 2 note updated deterministically.')
