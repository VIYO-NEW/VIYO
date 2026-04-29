#!/usr/bin/env python3
import json
from pathlib import Path

root = Path('/home/ubuntu/VIYO')
tasks_path = root / '.taskmaster' / 'tasks' / 'tasks.json'
out_path = root / 'docs/internal/phase6-repair/final_po_submission_status_verification_ascii.txt'

with tasks_path.open() as f:
    data = json.load(f)

def all_tasks(node):
    if isinstance(node, dict):
        if 'id' in node and 'title' in node:
            yield node
        for value in node.values():
            yield from all_tasks(value)
    elif isinstance(node, list):
        for item in node:
            yield from all_tasks(item)

tasks = {int(t['id']): t for t in all_tasks(data) if str(t.get('id', '')).isdigit()}

lines = []
lines.append('=== Phase 0 Taskmaster statuses ===')
for task_id in [62, 63]:
    t = tasks.get(task_id, {})
    lines.append(f"Task {task_id}: status={t.get('status')} | title={t.get('title')}")

lines.append('')
lines.append('=== Superseded old graph statuses ===')
for task_id in range(21, 45):
    t = tasks.get(task_id, {})
    lines.append(f"Task {task_id}: status={t.get('status')} | title={t.get('title')}")

lines.append('')
lines.append('=== Task 76 Description ===')
t76 = tasks.get(76, {})
lines.append(f"Title: {t76.get('title')}")
lines.append(f"Status: {t76.get('status')}")
lines.append('Description:')
lines.append(str(t76.get('description', '')))
lines.append('Details:')
lines.append(str(t76.get('details', t76.get('implementationDetails', ''))))

lines.append('')
lines.append('=== Required mode verification ===')
text_blob = ' '.join(str(t76.get(k, '')) for k in ['title', 'description', 'details', 'implementationDetails', 'testStrategy'])
for mode in ['A3', 'A4', 'A8', 'A9', 'A13', 'A14', 'A15', 'A16']:
    lines.append(f"{mode}: {'present' if mode in text_blob else 'MISSING'}")

out_path.write_text('\n'.join(lines) + '\n')
print(out_path)
