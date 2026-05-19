# Dispatch fixture 07 — valid Notion ID with context cue (dashed + undashed)

This dispatch references Notion page 35c9a84a-4679-81c7-a1fc-db7556f572d4
(Standing Rules page; dashed 8-4-4-4-12 format) and the same Notion page in
undashed form 35c9a84a467981c7a1fcdb7556f572d4.

Expected: PASS with INFO pre-dispatch counting Notion ID format candidates.
Phase 1 = regex-match only per Curator-call fix 1 (Notion does NOT issue
RFC 4122 v4 UUIDs); Phase 2 will MCP-verify actual page existence.
