#!/usr/bin/env python3
"""Inspect VIYO Taskmaster dependency status for the Phase 6.2 replacement graph."""
from __future__ import annotations

import json
from pathlib import Path

TASKS_PATH = Path('/home/ubuntu/VIYO/.taskmaster/tasks/tasks.json')
OUT_PATH = Path('/home/ubuntu/VIYO/docs/internal/phase6-repair/next_task_dependency_inspection_20260429.md')

raw = json.loads(TASKS_PATH.read_text())
# Taskmaster stores either {"tasks": [...]} or tagged collections depending version.
if isinstance(raw, dict) and 'tasks' in raw:
    tasks = raw['tasks']
elif isinstance(raw, dict):
    tasks = []
    for value in raw.values():
        if isinstance(value, dict) and 'tasks' in value:
            tasks.extend(value['tasks'])
else:
    tasks = raw

by_id = {int(task['id']): task for task in tasks if isinstance(task, dict) and 'id' in task}
phase_ids = list(range(61, 90))
rows = []
ready = []
for task_id in phase_ids:
    task = by_id.get(task_id)
    if not task:
        rows.append((task_id, 'MISSING', '', '', 'missing from tasks.json'))
        continue
    deps = [int(dep) for dep in task.get('dependencies') or []]
    dep_statuses = {dep: by_id.get(dep, {}).get('status', 'missing') for dep in deps}
    blockers = [f"{dep}:{status}" for dep, status in dep_statuses.items() if status != 'done']
    status = task.get('status', '')
    if status == 'pending' and not blockers:
        ready.append(task_id)
    rows.append((task_id, status, task.get('title', ''), ', '.join(map(str, deps)) or 'None', '; '.join(blockers) or 'None'))

next_id = ready[0] if ready else None
next_task = by_id.get(next_id) if next_id else None

lines = []
lines.append('# Phase 6.2 Taskmaster Dependency Inspection — 2026-04-29')
lines.append('')
lines.append('This inspection reads `.taskmaster/tasks/tasks.json` directly to avoid terminal rendering truncation and repeated slow CLI calls.')
lines.append('')
lines.append('| Task ID | Status | Title | Dependencies | Unresolved blockers |')
lines.append('|---:|---|---|---|---|')
for task_id, status, title, deps, blockers in rows:
    safe_title = str(title).replace('|', '\\|')
    lines.append(f'| {task_id} | {status} | {safe_title} | {deps} | {blockers} |')
lines.append('')
if next_task:
    lines.append(f'## Next executable task: {next_id} — {next_task.get("title", "")}' )
    lines.append('')
    lines.append(f'**Status:** {next_task.get("status", "")}')
    lines.append('')
    lines.append(f'**Dependencies:** {next_task.get("dependencies") or []}')
    lines.append('')
    lines.append('**Description:**')
    lines.append('')
    lines.append(str(next_task.get('description', '')).strip() or '(none)')
    lines.append('')
    lines.append('**Details:**')
    lines.append('')
    lines.append(str(next_task.get('details', '')).strip() or '(none)')
    lines.append('')
    lines.append('**Test strategy:**')
    lines.append('')
    lines.append(str(next_task.get('testStrategy', '')).strip() or '(none)')
else:
    lines.append('## Next executable task')
    lines.append('')
    lines.append('No pending Phase 6.2 task has all dependencies resolved.')

OUT_PATH.write_text('\n'.join(lines) + '\n')
print(OUT_PATH)
if next_task:
    print(f'NEXT_TASK_ID={next_id}')
    print(f'NEXT_TASK_TITLE={next_task.get("title", "")}')
else:
    print('NEXT_TASK_ID=NONE')
