#!/usr/bin/env python3
"""Submit the manually executed Phase 6.2 task graph diff to Airtable."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DIFF_PATH = ROOT / "docs" / "internal" / "phase6-repair" / "BUILDER_DIFF_OUTPUT_PHASE6_2_MANUAL_EXECUTED.md"
OUT_PATH = ROOT / "docs" / "internal" / "phase6-repair" / "airtable_manual_diff_update_output.json"

payload = {
    "baseId": "appo5mNncCCzKcIRk",
    "tableId": "tblyZdtFjTYIwSzBT",
    "records": [
        {
            "id": "recqGyk0oIekpYEe9",
            "fields": {
                "Status": "Diff Proposed",
                "Builder Diff Output": DIFF_PATH.read_text(),
            },
        }
    ],
}

cmd = [
    "manus-mcp-cli",
    "tool",
    "call",
    "update_records",
    "--server",
    "airtable",
    "--input",
    json.dumps(payload),
]
result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
OUT_PATH.write_text(
    json.dumps(
        {
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        },
        indent=2,
    )
    + "\n"
)
print(f"returncode={result.returncode}")
if result.stdout:
    print(result.stdout[:4000])
if result.stderr:
    print(result.stderr[:4000])
raise SystemExit(result.returncode)
