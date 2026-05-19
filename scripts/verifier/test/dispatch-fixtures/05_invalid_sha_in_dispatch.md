# Dispatch fixture 05 — invalid SHA citation with context cue

This dispatch references commit deadbeef0000 (context cue "commit" present;
hex pattern does not resolve via git cat-file).

Expected: BLOCK with ERROR pre-dispatch citing the unresolvable SHA.
