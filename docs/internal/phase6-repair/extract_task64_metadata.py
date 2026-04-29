#!/usr/bin/env python3
"""Extract Task 64 metadata from the local Taskmaster task database."""
from __future__ import annotations

import json
from pathlib import Path

repo = Path('/home/ubuntu/VIYO')
tasks_path = repo / '.taskmaster/tasks/tasks.json'
out_path = repo / 'docs/internal/phase6-repair/task64_metadata_ascii.txt'

data = json.loads(tasks_path.read_text(encoding='utf-8'))
tasks = data.get('master', {}).get('tasks', [])
for task in tasks:
    if str(task.get('id')) == '64':
        out_path.write_text(json.dumps(task, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        print(out_path)
        break
else:
    raise SystemExit('Task 64 not found')
