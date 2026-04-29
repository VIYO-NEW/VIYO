#!/usr/bin/env bash
set -euo pipefail

# VIYO Phase 0 secret-exposure control.
# Runs before commits to prevent verified secrets from entering Git history.
# Requires the official TruffleHog CLI to be available on PATH.

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if ! command -v trufflehog >/dev/null 2>&1; then
  echo "ERROR: trufflehog is not installed or not on PATH." >&2
  echo "Install the official TruffleHog CLI before committing." >&2
  exit 1
fi

BASE_REF="${TRUFFLEHOG_BASE_REF:-HEAD}"

# Scan the staged snapshot through the Git working tree and require failure on verified secrets.
# --only-verified reduces false positives while still blocking confirmed credential exposure.
trufflehog git "file://$ROOT_DIR" --since-commit "$BASE_REF" --only-verified --fail --no-update

# Also scan staged file content paths to catch newly-added uncommitted files.
STAGED_FILES="$(git diff --cached --name-only --diff-filter=ACMR || true)"
if [ -n "$STAGED_FILES" ]; then
  printf '%s\n' "$STAGED_FILES" | while IFS= read -r file_path; do
    [ -f "$file_path" ] || continue
    trufflehog filesystem "$file_path" --only-verified --fail --no-update
  done
fi

exit 0
