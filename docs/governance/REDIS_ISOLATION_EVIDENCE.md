# Redis Isolation Smoke Test Evidence

**Test date:** 2026-05-09T14:37:17.625774Z  
**Performed by:** Manus AI (WP-4 of infrastructure cleanup)  
**Authority:** `docs/governance/INFRASTRUCTURE_DECISIONS.md` PO Decision 6 (2026-05-08)

## Pre-flight

The pre-flight checks confirmed that the prerequisite staging rewire work had already merged and that both live worker health endpoints reported Redis as healthy and configured before the runtime isolation test began. No Redis keyspace enumeration was performed at any point during this work.

| Check | Captured result |
|---|---|
| PR #13 merge state | `MERGED` at `2026-05-09T05:00:56Z`; merge commit `8a6145188b5e14e6daa87b30bd8dc69f7ef6eaf7` |
| Production worker Redis health | `healthy: true`, `configured: true`, captured latency `61.86 ms` |
| Staging worker Redis health | `healthy: true`, `configured: true`, captured latency `60.83 ms` |

## Database identification

The test addressed the two intended Upstash Redis databases by authenticated runtime operations against each database. The evidence below intentionally excludes REST URLs, tokens, passwords, and connection strings.

| Environment | Upstash database name | Database ID | Region |
|---|---|---|---|
| Production | `viyo` | `dacc198a-f392-42af-a888-7ef1856edfb7` | `global` |
| Staging | `viyo-redis-staging` | `d70cd436-c132-465d-84e2-4c5a61f24ea2` | `global` |

## Phase 1: Staging-write → Production-read

| Step | Action | Result |
|---|---|---|
| 1.1 | Generated test key | `wp4-isolation-test:staging:<uuid-redacted>`; the UUID and value were used during the test only and are redacted from evidence. |
| 1.2 | SET on staging Redis | `SUCCESS_OK`; HTTP status `200`; TTL `600` seconds. |
| 1.3 | GET on staging Redis | `VALUE_MATCHED`; HTTP status `200`. |
| 1.4 | GET on production Redis | `EMPTY`; HTTP status `200`; isolation confirmed for the staging-write side. |

**Phase 1 verdict:** `PASS`

## Phase 2: Production-write → Staging-read

| Step | Action | Result |
|---|---|---|
| 2.1 | Generated test key | `wp4-isolation-test:prod:<uuid-redacted>`; the UUID and value were used during the test only and are redacted from evidence. |
| 2.2 | SET on production Redis | `SUCCESS_OK`; HTTP status `200`; TTL `600` seconds. |
| 2.3 | GET on production Redis | `VALUE_MATCHED`; HTTP status `200`. |
| 2.4 | GET on staging Redis | `EMPTY`; HTTP status `200`; isolation confirmed for the production-write side. |

**Phase 2 verdict:** `PASS`

## Phase 3: Cleanup

| Step | Action | Result |
|---|---|---|
| 3.1 | DEL staging test key | `DELETED`; HTTP status `200`. |
| 3.2 | DEL production test key | `DELETED`; HTTP status `200`. |
| 3.3 | Confirm both gone | `BOTH_GONE`; post-delete GET returned `EMPTY` for the staging test key in staging Redis and `EMPTY` for the production test key in production Redis. |

## Final WP-4 Verdict

**`ISOLATION_VERIFIED`**

The bidirectional smoke test verified that a key written to staging Redis was not visible from production Redis, and that a key written to production Redis was not visible from staging Redis. The two WP-4 test keys were deleted after both isolation phases passed, and the final cleanup confirmation found no residual test-key value in its originating database.

## Notes

The test used only the two UUID-suffixed WP-4 test keys shown in redacted form above. No Redis keyspace scans, broad inspections, worker code changes, environment-variable changes, deployment actions, dashboard setting changes, or non-test-key modifications were performed. Credential values and Redis REST URLs were excluded from this evidence file.

## Cross-references

- Authority: `docs/governance/INFRASTRUCTURE_DECISIONS.md` (Decision 6)
- Inventory baseline: `docs/governance/INFRASTRUCTURE_REPORT.md`
