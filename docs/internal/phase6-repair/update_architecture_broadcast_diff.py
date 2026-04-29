#!/usr/bin/env python3
"""Write the Phase 6.2 builder diff to the Architecture Broadcast record."""
import json
import subprocess
from pathlib import Path

BASE_ID = "appo5mNncCCzKcIRk"
TABLE_ID = "tblyZdtFjTYIwSzBT"
RECORD_ID = "recqGyk0oIekpYEe9"
DIFF_PATH = Path("docs/internal/phase6-repair/BUILDER_DIFF_OUTPUT_PHASE6_2.md")

builder_diff = DIFF_PATH.read_text(encoding="utf-8")

payload = {
    "baseId": BASE_ID,
    "tableId": TABLE_ID,
    "records": [
        {
            "id": RECORD_ID,
            "fields": {
                "Builder Diff Output": builder_diff,
                "Status": "Diff Proposed",
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

result = subprocess.run(cmd, text=True, capture_output=True, check=False)
print(result.stdout)
if result.stderr:
    print(result.stderr)
raise SystemExit(result.returncode)
