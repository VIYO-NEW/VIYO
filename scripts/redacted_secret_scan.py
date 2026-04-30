#!/usr/bin/env python3
"""Redacted repository secret scan.

This script reports only pattern names, counts, and file paths. It intentionally never
prints matched values or surrounding source lines.
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    ".turbo",
    ".next",
    "coverage",
    ".vercel",
}
EXCLUDED_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".pdf",
    ".zip",
    ".gz",
    ".lock",
}

PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("supabase_secret_key_prefix", re.compile(r"sb_secret_[A-Za-z0-9_-]{12,}")),
    ("supabase_publishable_key_prefix", re.compile(r"sb_publishable_[A-Za-z0-9_-]{12,}")),
    ("jwt_like_token", re.compile(r"eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}")),
    ("inngest_event_key_like", re.compile(r"\b(?:ve|evt)[A-Za-z0-9_-]{40,}\b")),
    ("inngest_signing_key_like", re.compile(r"\b(?:signkey|sk)_[A-Za-z0-9_-]{24,}\b")),
    ("database_url_with_password", re.compile(r"postgres(?:ql)?://[^\s:@]+:[^\s:@]+@[^\s]+")),
    ("direct_url_with_password", re.compile(r"(?:DIRECT_URL\s*=\s*)postgres(?:ql)?://[^\s:@]+:[^\s:@]+@[^\s]+")),
]

ALLOWED_TEXT_PATHS = {
    Path("scripts/redacted_secret_scan.py"),
}


def is_scannable(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if any(part in EXCLUDED_DIRS for part in rel.parts):
        return False
    if path.suffix.lower() in EXCLUDED_SUFFIXES:
        return False
    if rel in ALLOWED_TEXT_PATHS:
        return False
    return path.is_file()


def tracked_files() -> set[Path]:
    result = subprocess.run(["git", "ls-files"], cwd=ROOT, text=True, capture_output=True, check=True)
    return {ROOT / line for line in result.stdout.splitlines() if line.strip()}


def scan_worktree() -> dict[str, dict[str, object]]:
    findings = {name: {"count": 0, "files": set()} for name, _ in PATTERNS}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for filename in filenames:
            path = Path(dirpath) / filename
            if not is_scannable(path):
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            rel = str(path.relative_to(ROOT))
            for name, pattern in PATTERNS:
                matches = pattern.findall(text)
                if matches:
                    findings[name]["count"] += len(matches)
                    findings[name]["files"].add(rel)
    return findings


def scan_tracked_history_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    for name, pattern in PATTERNS:
        # Use git log -G to count commits where the regex changed. This avoids printing matched values.
        result = subprocess.run(
            ["git", "log", "--all", "--format=%H", f"-G{pattern.pattern}"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        commits = [line for line in result.stdout.splitlines() if line.strip()]
        counts[name] = len(set(commits))
    return counts


def main() -> int:
    print("VIYO redacted secret scan")
    print(f"root={ROOT}")
    print(f"branch={subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip()}")
    print("\nworktree_findings:")
    findings = scan_worktree()
    total = 0
    for name, data in findings.items():
        count = int(data["count"])
        total += count
        files = sorted(data["files"])
        print(f"{name}: count={count}; files={','.join(files) if files else '-'}")
    print("\nhistory_commit_counts:")
    history = scan_tracked_history_counts()
    for name, count in history.items():
        print(f"{name}: commits={count}")
    print(f"\nworktree_total={total}")
    return 1 if total else 0


if __name__ == "__main__":
    raise SystemExit(main())
