#!/usr/bin/env bash
# Shared citation pattern detection + verify helpers (Adversary Path D-2 receiver-side).
# Used by scripts/verifier/verify-dispatch.sh (D-2 dispatch-markdown scope).
# Refactor opportunity: scripts/git-hooks/pre-push (D-1 committed-file scope) could
# source these helpers to consolidate logic — currently inline per D-1 dispatch decision.
# DO NOT execute directly; source from invoking script.
#
# Curator-call fixes baked in per PO ratification 2026-05-19:
#   Fix 1: Notion ID format-detect drops RFC 4122 v4 version/variant validation
#          (Notion does NOT issue v4 UUIDs); detects both dashed + undashed; INFO-only.
#   Fix 2: Lock verify exempts lines containing "candidate" or "placeholder".
#   Fix 3: Notion ID detect uses context-cue gating ("Notion" or "page" within 50 chars).
#   Fix 4: SHA verify iterates ALL hex matches per context-cue line (not just first).
#   Fix 6: Rule 3.23 omits explicit markdown anchor self-link (matches existing AOR style).

verify_lock_citations() {
    local file="$1"
    local fail=0
    # Curator-call fix 2: exempt lines containing "candidate" or "placeholder"
    local LOCK_NUMS
    LOCK_NUMS=$(grep -vE 'candidate|placeholder' "$file" 2>/dev/null | grep -ohE '\bLock [0-9]+' | grep -oE '[0-9]+' | sort -u || true)
    for num in $LOCK_NUMS; do
        if ! grep -qE "^## Lock $num[^0-9]|^### Lock $num[^0-9]" docs/governance/FOUNDATION_LOCK.md 2>/dev/null; then
            echo "ERROR verify: \`Lock $num\` cited in \`$file\` not found in FOUNDATION_LOCK.md"
            echo "  Variant 5g closure: Lock citations must verify."
            fail=1
        fi
    done
    return $fail
}

verify_rspec_citations() {
    local file="$1"
    local fail=0
    local RSPEC_NUMS
    RSPEC_NUMS=$(grep -ohE 'R[0-9]+ v[0-9]+|R-spec R[0-9]+|\bR[0-9]+_[A-Z_]+' "$file" 2>/dev/null | grep -oE 'R[0-9]+' | sort -u || true)
    for rnum in $RSPEC_NUMS; do
        if ! ls docs/research_specs/${rnum}_* 2>/dev/null | grep -q .; then
            echo "ERROR verify: R-spec \`$rnum\` cited in \`$file\` has no matching file in docs/research_specs/"
            echo "  Variant 5g closure: R-spec citations must verify."
            fail=1
        fi
    done
    return $fail
}

verify_md_filepath_citations() {
    local file="$1"
    local fail=0
    local MD_CITES
    MD_CITES=$(grep -ohE '\b(docs|scripts|apps|packages|tests)/[A-Za-z0-9_/.-]+\.md\b' "$file" 2>/dev/null | sort -u || true)
    for cite in $MD_CITES; do
        if [ ! -f "$cite" ]; then
            echo "ERROR verify: cited file path \`$cite\` in \`$file\` not found in repo"
            echo "  Variant 5g closure: file path citations must verify."
            fail=1
        fi
    done
    return $fail
}

# Curator-call fix 4: iterate ALL hex matches per context-cue line, not just first.
verify_sha_citations() {
    local file="$1"
    local fail=0
    local SEEN=""
    while IFS= read -r line; do
        # Collect all hex 7-40 candidates on this line
        local HEX_MATCHES
        HEX_MATCHES=$(echo "$line" | grep -ohE '\b[0-9a-f]{7,40}\b' 2>/dev/null || true)
        for sha in $HEX_MATCHES; do
            # Skip 32-char hex (likely Notion ID; handled by verify_notion_id_format)
            [ ${#sha} -eq 32 ] && continue
            # Dedup across lines
            case " $SEEN " in *" $sha "*) continue;; esac
            SEEN="$SEEN $sha"
            # Context-cue gating: 50 chars before the match must contain commit/SHA/anchor/HEAD/base
            local PREFIX="${line%%$sha*}"
            local CTX_WINDOW
            if [ ${#PREFIX} -gt 50 ]; then CTX_WINDOW="${PREFIX: -50}"; else CTX_WINDOW="$PREFIX"; fi
            if echo "$CTX_WINDOW" | grep -qiE '(commit|sha|anchor|head|base)'; then
                if ! git cat-file -e "$sha^{commit}" 2>/dev/null; then
                    echo "ERROR verify: SHA \`$sha\` cited in \`$file\` not found in repo"
                    echo "  Variant 5g closure: SHA citations must verify."
                    fail=1
                fi
            fi
        done
    done < "$file"
    return $fail
}

# Curator-call fix 1 + 3: drop v4 validation; detect both dashed + undashed;
# context-cue gating ("Notion" or "page" within 50 chars); INFO-only.
verify_notion_id_format() {
    local file="$1"
    local SEEN=""
    local TOTAL=0
    while IFS= read -r line; do
        local DASHED UNDASHED
        DASHED=$(echo "$line" | grep -ohE '\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b' 2>/dev/null || true)
        UNDASHED=$(echo "$line" | grep -ohE '\b[0-9a-f]{32}\b' 2>/dev/null || true)
        for id in $DASHED $UNDASHED; do
            case " $SEEN " in *" $id "*) continue;; esac
            SEEN="$SEEN $id"
            # Context-cue gating per Curator-call fix 3
            local PREFIX="${line%%$id*}"
            local CTX_WINDOW
            if [ ${#PREFIX} -gt 50 ]; then CTX_WINDOW="${PREFIX: -50}"; else CTX_WINDOW="$PREFIX"; fi
            if echo "$CTX_WINDOW" | grep -qiE '(notion|page)'; then
                TOTAL=$((TOTAL + 1))
            fi
        done
    done < "$file"
    if [ $TOTAL -gt 0 ]; then
        echo "INFO verify: $TOTAL Notion ID format candidate(s) detected in \`$file\` (Phase 2 will MCP-verify)."
    fi
    return 0  # always info, never fail
}

verify_d_od_gap_references() {
    local file="$1"
    local REF_CITES
    REF_CITES=$(grep -ohE '\b(D|OD|GAP)-?[0-9]+\b' "$file" 2>/dev/null | sort -u || true)
    if [ -n "$REF_CITES" ]; then
        local REF_COUNT
        REF_COUNT=$(echo "$REF_CITES" | wc -l | tr -d ' ')
        echo "INFO verify: $REF_COUNT Decision/OD/GAP references in \`$file\` (Phase 2 will MCP-verify)."
    fi
    return 0
}
