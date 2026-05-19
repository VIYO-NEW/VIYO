#!/usr/bin/env bash
# scripts/verifier/test/run-dispatch-tests.sh
# Test runner for verify-dispatch.sh (D-2 receiver-side citation verifier).
#
# For each fixture under dispatch-fixtures/, invokes verify-dispatch.sh against
# the fixture file, captures exit code + output, compares against per-fixture
# expected values. verify-dispatch.sh resolves paths against actual repo root,
# so fixtures live in the real repo working tree (unlike D-1 pre-push tests
# which need temp git repos).

set -u

REPO_ROOT=$(git rev-parse --show-toplevel)
FIXTURES_DIR="$REPO_ROOT/scripts/verifier/test/dispatch-fixtures"
VERIFY_TOOL="$REPO_ROOT/scripts/verifier/verify-dispatch.sh"

# fixture | expected_exit | grep_pattern_in_output (empty = no pattern requirement)
FIXTURES=(
    "01_valid_dispatch.md|0|RESULT: PASS"
    "02_invalid_lock_in_dispatch.md|1|Lock 999"
    "03_invalid_rspec_in_dispatch.md|1|R-spec .R99"
    "04_invalid_md_filepath_in_dispatch.md|1|cited file path"
    "05_invalid_sha_in_dispatch.md|1|SHA .deadbeef"
    "06_uuid_lookalike_no_context.md|0|RESULT: PASS"
    "07_valid_notion_id_with_context.md|0|Notion ID format candidate"
    "08_d_number_references.md|0|Decision/OD/GAP references"
)

PASS=0
FAIL=0
FAILED_NAMES=()

for spec in "${FIXTURES[@]}"; do
    name="${spec%%|*}"
    rest="${spec#*|}"
    expected_exit="${rest%%|*}"
    pattern="${rest#*|}"

    fixture="$FIXTURES_DIR/$name"
    if [ ! -f "$fixture" ]; then
        echo "FAIL $name (fixture file missing)"
        FAIL=$((FAIL+1))
        FAILED_NAMES+=("$name")
        continue
    fi

    set +e
    OUTPUT=$(bash "$VERIFY_TOOL" "$fixture" 2>&1)
    EXIT_CODE=$?
    set -e

    # Additional check for fixture 06: NO Notion ID INFO emission (gating works)
    EXTRA_FAIL=""
    if [ "$name" = "06_uuid_lookalike_no_context.md" ]; then
        if echo "$OUTPUT" | grep -q "Notion ID format candidate"; then
            EXTRA_FAIL="context-cue gating failed (INFO emitted for non-context candidate)"
        fi
    fi

    RESULT="PASS"
    if [ "$EXIT_CODE" != "$expected_exit" ]; then
        RESULT="FAIL (exit $EXIT_CODE, expected $expected_exit)"
    elif [ -n "$pattern" ] && ! echo "$OUTPUT" | grep -qE "$pattern"; then
        RESULT="FAIL (output missing pattern: $pattern)"
    elif [ -n "$EXTRA_FAIL" ]; then
        RESULT="FAIL ($EXTRA_FAIL)"
    fi

    if [ "$RESULT" = "PASS" ]; then
        echo "PASS $name"
        PASS=$((PASS+1))
    else
        echo "$RESULT $name"
        echo "  --- output ---"
        echo "$OUTPUT" | sed 's/^/  /'
        echo "  --- end output ---"
        FAIL=$((FAIL+1))
        FAILED_NAMES+=("$name")
    fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed (of ${#FIXTURES[@]} total)"
if [ $FAIL -gt 0 ]; then
    echo "Failed fixtures: ${FAILED_NAMES[*]}"
    exit 1
fi
exit 0
