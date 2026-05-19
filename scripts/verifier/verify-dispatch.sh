#!/usr/bin/env bash
# Pre-Dispatch Citation Verifier (Adversary Path D-2 receiver-side).
# Usage: verify-dispatch.sh <dispatch-file.md> [--strict]
# Exit 0: PASS (all citations verified or WARN/INFO-tolerable)
# Exit 1: BLOCK (Lock / R-spec / .md file path / SHA verify failures)
# Exit 2: BLOCK in --strict mode (WARN-level citations detected; Phase 2 will redefine WARN class)
#
# Invoked by Curator at intake of any Architect-to-Curator dispatch from Drive
# working folder (per AOR Rule 3.23). Closes variant 5g at dispatch boundary
# per ANTI_PATTERN_CATALOG Category 5 (Tool-Level Pre-Commit Enforcement).

set -e

DISPATCH_FILE="${1:-}"
STRICT_MODE=0
[ "${2:-}" = "--strict" ] && STRICT_MODE=1

if [ -z "$DISPATCH_FILE" ] || [ "$DISPATCH_FILE" = "--help" ] || [ "$DISPATCH_FILE" = "-h" ]; then
    echo "Usage: verify-dispatch.sh <dispatch-file.md> [--strict]"
    echo "  Exit 0 = PASS; exit 1 = BLOCK; exit 2 = strict-mode WARN block"
    exit 0
fi

if [ ! -f "$DISPATCH_FILE" ]; then
    echo "ERROR verify-dispatch: file not found: $DISPATCH_FILE"
    exit 1
fi

# Source shared citation-pattern library
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=lib/citation-patterns.sh
source "$SCRIPT_DIR/lib/citation-patterns.sh"

# Resolve absolute path BEFORE cd (handle relative input)
DISPATCH_ABS=$(cd "$(dirname "$DISPATCH_FILE")" && pwd)/$(basename "$DISPATCH_FILE")

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "=== Pre-Dispatch Verify: $DISPATCH_FILE ==="

FAIL=0
WARN=0

# Hard-fail patterns (BLOCK on miss)
verify_lock_citations "$DISPATCH_ABS" || FAIL=1
verify_rspec_citations "$DISPATCH_ABS" || FAIL=1
verify_md_filepath_citations "$DISPATCH_ABS" || FAIL=1
verify_sha_citations "$DISPATCH_ABS" || FAIL=1

# Soft-fail patterns (INFO only; --strict can promote to BLOCK in Phase 2 once
# Notion MCP verify is wired)
verify_notion_id_format "$DISPATCH_ABS"
verify_d_od_gap_references "$DISPATCH_ABS"

echo "=== Verify summary ==="
if [ $FAIL -eq 1 ]; then
    echo "RESULT: BLOCK (hard citation verify failures detected)"
    echo "Surface to PO before executing dispatch. Variant 5g closure at dispatch boundary."
    exit 1
fi
if [ $WARN -eq 1 ] && [ $STRICT_MODE -eq 1 ]; then
    echo "RESULT: BLOCK in --strict mode (WARN-level citations detected)"
    exit 2
fi
echo "RESULT: PASS (all hard citations verified; INFO-only items tracked for Phase 2)"
exit 0
