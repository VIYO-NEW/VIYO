#!/usr/bin/env bash
# scripts/verifier/test/run-pre-push-tests.sh
# Test runner for pre-push citation-verify extension (D-1 dispatch 2026-05-19).
#
# For each fixture under pre-push-fixtures/, builds a minimal temp git repo
# with the substrate pre-push needs (FOUNDATION_LOCK.md, an R22_* stub, the
# fixture itself), commits it on top of an initial substrate commit, invokes
# the actual scripts/git-hooks/pre-push with synthetic stdin, and compares
# exit code + stderr against per-fixture expectations.

set -u

REPO_ROOT=$(git rev-parse --show-toplevel)
FIXTURES_DIR="$REPO_ROOT/scripts/verifier/test/pre-push-fixtures"
PRE_PUSH_HOOK="$REPO_ROOT/scripts/git-hooks/pre-push"

# fixture | expected_exit | grep_pattern_in_output (empty = no pattern requirement)
FIXTURES=(
    "01_valid_lock_citation.md|0|"
    "02_invalid_lock_citation.md|1|Lock 999"
    "03_valid_rspec_citation.md|0|"
    "04_invalid_rspec_citation.md|1|R-spec .R99"
    "05_valid_md_filepath.md|0|"
    "06_invalid_md_filepath.md|1|Cited file path"
    "07_valid_notion_uuid.md|0|Notion ID format candidate"
    "08_undashed_notion_id.md|0|Notion ID format candidate"
    "09_d_number_citation.md|0|Decision/OD/GAP references"
    "10_combined_valid.md|0|"
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

    TEMP=$(mktemp -d)
    pushd "$TEMP" > /dev/null

    git init -q
    git config user.email "test@viyo.local"
    git config user.name "Test"

    # Initial substrate commit (becomes "remote_sha" for diff range)
    mkdir -p docs/governance docs/research_specs
    cp "$REPO_ROOT/docs/governance/FOUNDATION_LOCK.md" docs/governance/
    # R22 stub: minimal content that won't trigger citation-verify false-positives
    echo "# R22 test stub" > docs/research_specs/R22_TEST_STUB.md
    git add -A > /dev/null
    git commit -q -m "init substrate"
    REMOTE_SHA=$(git rev-parse HEAD)

    # Fixture commit (becomes "local_sha")
    cp "$fixture" docs/test_fixture.md
    git add -A > /dev/null
    git commit -q -m "test: $name"
    LOCAL_SHA=$(git rev-parse HEAD)

    # Invoke pre-push with synthetic stdin (push to existing remote branch)
    STDIN="refs/heads/main $LOCAL_SHA refs/heads/main $REMOTE_SHA"
    set +e
    OUTPUT=$(echo "$STDIN" | bash "$PRE_PUSH_HOOK" 2>&1)
    EXIT_CODE=$?
    set -e

    popd > /dev/null
    rm -rf "$TEMP"

    # Compare against expectations
    RESULT="PASS"
    if [ "$EXIT_CODE" != "$expected_exit" ]; then
        RESULT="FAIL (exit $EXIT_CODE, expected $expected_exit)"
    elif [ -n "$pattern" ] && ! echo "$OUTPUT" | grep -qE "$pattern"; then
        RESULT="FAIL (output missing pattern: $pattern)"
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
