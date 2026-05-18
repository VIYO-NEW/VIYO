#!/usr/bin/env bash
set -e
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"
HOOKS_DIR="$REPO_ROOT/scripts/git-hooks"
TARGET_DIR="$REPO_ROOT/.git/hooks"
mkdir -p "$TARGET_DIR"
# Path α design correction 2026-05-16: pre-commit removed.
# SHA + file-path verify moved to commit-msg (reliable across -m / -F / editor flows).
for hook in commit-msg pre-push post-commit; do
    SRC="$HOOKS_DIR/$hook"
    TGT="$TARGET_DIR/$hook"
    [ ! -f "$SRC" ] && echo "WARN: $SRC missing" && continue
    rm -f "$TGT"
    ln -s "$SRC" "$TGT"
    chmod +x "$SRC"
    echo "Installed: $hook → $SRC"
done
# Clean up legacy pre-commit hook if present from prior install (Path α removal)
rm -f "$TARGET_DIR/pre-commit"
echo ""
echo "VIYO git hooks active (3-hook layout post-Path-α correction)."
echo "Test:"
echo "  git commit --allow-empty -m 'cite nonexistent 0000000aaa'  # expect BLOCK (commit-msg)"
echo "  git commit --allow-empty -m 'cite valid b1b5496 — sweep'   # expect PASS"
