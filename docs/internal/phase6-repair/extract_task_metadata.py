#!/usr/bin/env python3.11
"""Extract one Taskmaster task by ID from .taskmaster/tasks/tasks.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("Usage: extract_task_metadata.py <task_id>")

task_id = str(sys.argv[1])
path = Path(".taskmaster/tasks/tasks.json")
data = json.loads(path.read_text())

if isinstance(data, dict) and "master" in data and isinstance(data["master"], dict):
    tasks = data["master"].get("tasks", [])
elif isinstance(data, dict) and "tasks" in data:
    tasks = data.get("tasks", [])
elif isinstance(data, list):
    tasks = data
else:
    raise SystemExit("Unsupported Taskmaster JSON shape")

if isinstance(tasks, dict):
    iterable = tasks.values()
else:
    iterable = tasks

for task in iterable:
    if str(task.get("id")) == task_id:
        print(json.dumps(task, indent=2, ensure_ascii=False))
        break
else:
    raise SystemExit(f"Task {task_id} not found")
