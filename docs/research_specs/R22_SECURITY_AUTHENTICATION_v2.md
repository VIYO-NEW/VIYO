---
spec_id: R22
title: Security & Authentication Architecture
version: 2.0
revision: rev2 (Architect-applied PO-suggestions before lock)
zcbr_status: PASSED
zcbr_validation_date: 2026-05-12
zcbr_validator: Architect Claude (Opus 4.7) self-validation
zcbr_checklist_version: v1
authored_date: 2026-05-12
author: Architect Claude (Opus 4.7)
supersedes:
  - docs/research_specs/R22_SECURITY_AUTHENTICATION_ENTERPRISE.md (v1, 6,328 bytes, last commit 1cc43f5781b132ef256e21ca06c8914c0c9e64c3 at 2026-05-12T13:22:48Z)
target_repo_path: /docs/research_specs/R22_SECURITY_AUTHENTICATION_v2.md
authority_tier: 7 (R-spec ZCBR per CLAUDE.md hierarchy)
---

# R22 — Security & Authentication Architecture (v2, ZCBR-Grade)

## 0. Authority and Provenance

R22 v2 supersedes R22 v1, a 6,328-byte skeleton that covered three topics surface-level (JWT auth, API key hashing, ESP credential encryption) with zero ZCBR infrastructure and zero R20 v2 alignment. v2 reconciles against the committed implementation, ties the spec to R20 v2 schema authority, integrates the R29 v2 Plugin Registry credential boundary, and adds the full ZCBR substrate (locks, failure modes, edge cases, tests, mechanical acceptance criteria).

**Authority sources (CLAUDE.md tier order):**
- PO Decisions: D8 (5-tier subscription pricing — informs workspace tier role hierarchy), D11 (Webhook architecture — webhook signature verification), D55 (R29 Option C unified Plugin Registry — credential resolution boundary), D56 (Token metering Phase 0/Phase 1 — rate limit threshold ratification gate), D63 (Skills do not live in git — informs Portal auth boundary), D66 (B-1.00 first Path C Bullet — auth must be production-ready for Studio Core Loop)
- FOUNDATION_AUTHORITY.md: L1 (Identity & Multi-Tenancy — primary authority for this spec), L7 (Observability — auth events flow to OTel + Sentry), L10 (Webhook Pipeline — webhook signature verification)
- ZCBR_STANDARD.md (Foundation Lock 20)
- VIYO_Master_Build_Sequence.md (v1.1) — B-XC.21 is this bullet
- VVOW_IMAGE_STUDIO_ARCHITECTURE.md §19 (R22 marked "Reference")

**Implementation ground-truth sources reconciled (per B-XC.21-AUDIT-001 Phase 0 report):**

| Source | Path | Size | Role |
|---|---|---|---|
| JWT middleware | `apps/worker/src/middleware/auth.ts` | 3,607B | Hono middleware verifying Supabase JWT |
| API key utilities | `packages/shared/src/auth/api-keys.ts` | 2,185B | SHA-256 hashing, prefix generation |
| Auth index | `packages/shared/src/auth/index.ts` | 560B | Re-exports |
| Auth live check | `packages/shared/src/auth/live-check.ts` | 4,092B | Health probe for auth subsystem |
| Supabase client | `packages/shared/src/auth/supabase.ts` | 1,844B | Supabase Auth client init |
| Auth types | `packages/shared/src/auth/types.ts` | 1,316B | TypeScript type definitions |
| Security index | `packages/shared/src/security/index.ts` | 367B | Vault re-exports |
| Identity schema | `packages/db/src/schema/identity.ts` | 5,379B | R20 v2 §2.1 authority |
| Web auth store | `apps/web/src/stores/auth.ts` | 2,083B | Client-side auth state |
| Admin auth store | `apps/admin/src/stores/auth.ts` | 2,415B | Admin client auth state |
| Admin AuthGuard | `apps/admin/src/components/auth/AuthGuard.tsx` | 3,703B | Route-level auth wrapper |
| Security Dashboard | `apps/admin/src/pages/SecurityDashboard.tsx` | 2,291B | Admin security UI |

**Cross-spec wiring map:**

| Consumer / dependency | Relationship to R22 v2 |
|---|---|
| R20 v2 §2.1 Identity Domain | Schema authority for `workspaces`, `users`, `api_keys`, `workspace_members` |
| R20 v2 §2.4.2 `esp_connections` | ESP credential row shape; R22 v2 documents encryption + decryption flow |
| R20 v2 §2.12 `integration_connections` | OAuth credential row shape (Shopify, Stripe, etc.) |
| R20 v2 §3 Multi-Tenant Architecture | Tenant boundary contract |
| R29 v2 PAL | Credential resolution boundary; R22 v2 supplies decrypted credentials to `Registry.invoke()` |
| **R23 Cost Engine (capability×tier matrix authority)** | R23 owns subscription tier-gating policy; R22 v2 supplies only the `requireTier()` enforcement mechanism |
| R21 v2 Infrastructure | Cloudflare R2 / Render env var injection for vault keys |
| T9 Stripe Billing | Subscription tier flows from T9; R22 v2 reads `workspaces.subscription_tier` |
| B-0.02 (P0 dependent Bullet) | Auth must be production-ready |
| B-1.00 Studio Core Loop | All Studio API routes enforce R22 v2 middleware |

**Lock invocations:** L1, L7, L13, L19, L20, L21.

---

## 1. Scope and Boundaries

### 1.1 What R22 v2 covers

- **User authentication** via Supabase GoTrue
- **API key management** (SHA-256 hashing, scopes, rotation, revocation)
- **Authorization & RBAC** (5-role enum, workspace_members junction, custom role JSONB, permission check mechanism)
- **Multi-Factor Authentication** (enforcement points + 4 confirmed sensitive operations; 3 candidate operations TBD pending security review — §5.2)
- **Row-Level Security (RLS)** enforcement contract
- **Credential vault** (AES-256-GCM, `VIYO_VAULT_KEY` + `VIYO_VAULT_KEY_PREVIOUS` rotation)
- **OAuth flows** for ESP / AI / Shopify / Stripe Connect credentials
- **Tier-gating enforcement mechanism only** — the capability×tier matrix itself is R23's authority (§4.5)
- **Rate limiting enforcement mechanism** — actual tier thresholds are TENTATIVE pending PO ratification (§10.1)
- **Webhook signature verification** (HMAC-SHA256 inbound)
- **Failure modes, edge cases, tests, mechanical acceptance criteria**

### 1.2 What R22 v2 does NOT cover

- **Schema authority** — R20 v2 owns
- **Plugin invocation mechanics** — R29 v2 owns
- **Capability×tier matrix policy** — R23 Cost Engine owns; R22 v2 supplies enforcement only
- **Rate limit threshold values** — pending PO ratification before B-0.02 implementation lock (§10.1)
- **Specific OAuth provider implementations** — application-layer per Lock 21
- **Skills authentication** — Per D63, skills live in Portal; Portal auth is separate spec
- **Frontend route guards** — application-layer
- **Token economics** — R23 owns
- **Stripe webhook payload validation** — T9 owns; R22 v2 documents HMAC verification only

---

## 2. Authentication Architecture

### 2.1 Supabase GoTrue as identity provider

VIYO uses Supabase Auth (GoTrue) for user identity. The `auth.users` table is Supabase-managed; the `public.users` table (R20 v2 §2.1.2) is the application bridge.

| Capability | Mechanism | Failure mode |
|---|---|---|
| Email + password signup | Supabase Auth `signUp()` | `AUTH_EMAIL_TAKEN`, `AUTH_PASSWORD_WEAK` |
| Email verification | Supabase confirmation email | `AUTH_EMAIL_NOT_VERIFIED` — login blocked |
| Password reset | Supabase `resetPasswordForEmail()` | `AUTH_RATE_LIMITED` |
| OAuth login | Supabase Auth provider config | `AUTH_OAUTH_PROVIDER_FAILED` |
| Session refresh | Refresh token rotation | `AUTH_REFRESH_EXPIRED` |
| Logout | Supabase `signOut()` | None — idempotent |

### 2.2 JWT lifecycle

Access tokens: 1 hour TTL. Refresh tokens: 30 days TTL, rotated on every refresh.

JWT claims (Supabase-issued): `sub`, `email`, `aud`, `exp`, `iat`, `role`.

VIYO-injected custom claims (via Supabase Auth hooks):
- `workspace_id`: current workspace context
- `workspace_role`: user's role in current workspace
- `mfa_verified`: boolean — set true on successful MFA challenge for the session

### 2.3 Hono middleware (worker boundary)

The worker (`apps/worker/src/middleware/auth.ts`) verifies every inbound request:
1. Extract `Authorization: Bearer <jwt>` header
2. Verify JWT signature against Supabase JWKS (cached, 1-hour TTL)
3. Verify `exp` not in past, `aud === 'authenticated'`
4. Extract `sub` and load `public.users` row; cache in request context
5. Extract `workspace_id` claim; verify user has membership row in `workspace_members`
6. Attach `{ userId, workspaceId, workspaceRole, mfaVerified }` to request context
7. Forward to route handler

Routes that bypass auth (public): `/health`, `/auth/callback`, `/webhooks/stripe`, `/webhooks/<esp>` — each webhook route has its own HMAC verification (§10.3).

### 2.4 Service-role connection

Backend operations requiring elevated privilege use the service-role Supabase client. Service-role bypasses RLS entirely; every use site is documented (§9).

---

## 3. API Key Management

### 3.1 Schema (R20 v2 §2.1.3 authority)

`api_keys` table per R20 v2 §2.1.3: `id`, `workspace_id` (FK, tenant-scoped), `key_hash` (SHA-256 hex, UNIQUE), `key_prefix` (first 8 chars, display only), `label`, `scopes` (VARCHAR[]), `expires_at`, `last_used_at`, timestamps.

### 3.2 Creation flow

1. Generate 32-byte cryptographically random key, base64url-encoded → 43-char string
2. Prepend prefix `viyo_<env>_` where `<env>` is `live` or `test`
3. Compute SHA-256 hex of the full key string
4. Store `key_hash` + `key_prefix` (first 8 chars of random portion); the raw key is shown to the user ONCE in the API response
5. Subsequent reads return only `key_prefix` for human identification

### 3.3 Verification on request

1. Extract `Authorization: Bearer <key>` or `X-Api-Key` header
2. Compute SHA-256 hex of supplied key
3. Look up `api_keys WHERE key_hash = $1 AND (expires_at IS NULL OR expires_at > NOW())`
4. If found, load workspace context, set `req.context.apiKeyId`, `req.context.scopes`
5. Update `last_used_at` async
6. If not found, return `401 INVALID_API_KEY`

### 3.4 Scopes vocabulary (locked v1.0)

`studio:read`, `studio:write`, `vault:read`, `vault:write`, `email:compile`, `email:send`, `webhooks:manage`, `admin:all`. Future additions require R22 v2 minor version bump.

### 3.5 Rotation

User-initiated. Generate new key (§3.2); old key remains valid until explicit revocation (`expires_at = NOW()`, preserves audit trail vs DELETE).

---

## 4. Authorization & RBAC

### 4.1 5-role enum (R20 v2 §2.1.4 authority)

`workspace_members.role` CHECK constraint: `('owner', 'admin', 'editor', 'viewer', 'custom')`. Per PERM-01 through PERM-05 per FOUNDATION_AUTHORITY L1.

| Role | Capability summary |
|---|---|
| `owner` | Full workspace control + billing + deletion. Exactly 1 per workspace (app-layer enforced). |
| `admin` | Full workspace control except billing + deletion. Multiple allowed. |
| `editor` | Create / modify content (assets, email_templates, brands). Cannot manage members or settings. |
| `viewer` | Read-only access to content. |
| `custom` | Permissions defined by `custom_role` JSONB on same row. |

### 4.2 Custom role JSONB shape

When `role = 'custom'`, `custom_role` JSONB defines per-capability grants. Schema validated at app layer (no DB-level JSON schema constraint per Lock 4).

### 4.3 Permission check pattern

API route handlers call `requirePermission(req, capability)` where `capability` is one of the vocabulary entries (see §4.4). The function resolves the user's effective role from JWT `workspace_role`, looks up the capability in either the role's static permission table or `workspace_members.custom_role` JSONB, returns OK or throws `403 PERMISSION_DENIED`.

### 4.4 Static permission table (locked)

| Capability | owner | admin | editor | viewer |
|---|---|---|---|---|
| `studio.read` | ✅ | ✅ | ✅ | ✅ |
| `studio.write` | ✅ | ✅ | ✅ | ❌ |
| `vault.read` | ✅ | ✅ | ✅ | ✅ |
| `vault.write` | ✅ | ✅ | ✅ | ❌ |
| `email.compile` | ✅ | ✅ | ✅ | ❌ |
| `email.send` | ✅ | ✅ | ❌ | ❌ |
| `members.manage` | ✅ | ✅ | ❌ | ❌ |
| `billing.view` | ✅ | ✅ | ❌ | ❌ |
| `billing.manage` | ✅ | ❌ | ❌ | ❌ |
| `webhooks.manage` | ✅ | ✅ | ❌ | ❌ |

### 4.5 Tier-gating enforcement mechanism (capability×tier matrix → R23 authority)

**Scope boundary:** Feature-gating by subscription tier (which capabilities require which tier) is **R23 Cost Engine's authority** — R23 owns token economics, pricing, and the capability×tier matrix. R22 v2 supplies only the runtime ENFORCEMENT MECHANISM.

**Mechanism:** `requireTier(req, required_tier)` is called alongside `requirePermission(req, capability)` for tier-gated routes. The function:

1. Reads `workspaces.subscription_tier` from request context (R20 v2 §2.1.1 enum: `free`/`starter`/`growth`/`agency`)
2. Compares against the `required_tier` argument supplied by the route handler
3. On insufficient tier, throws `402 SUBSCRIPTION_REQUIRED` with target tier code in the response payload

The `required_tier` value supplied by each route is determined by R23. R22 v2 does not enumerate which capabilities require which tier — that policy lives in R23 + T9.

---

## 5. Multi-Factor Authentication

### 5.1 Enforcement points (locked v1.0)

- **MFA-01 Enrollment**: User self-enrolls TOTP via Supabase Auth `mfa.enroll()`. Available to all roles. Not required for `free` tier; required for `starter`+ tier owners + admins on next login after tier upgrade.
- **MFA-04 Challenge on sensitive operations**: When user invokes a sensitive op (catalog in §5.2) and JWT's `mfa_verified` is not true for current session, MFA challenge required.
- **MFA-05 Recovery codes**: 10 single-use recovery codes generated at enrollment, stored hashed in `auth.users.factors[].recovery_codes_hashed` (Supabase-managed).

### 5.2 Sensitive operations catalog

**Confirmed at v2 lock (4 operations — MFA-04 challenge required):**

1. Workspace deletion
2. Billing operations — subscription tier change, payment method change, manual invoice operations
3. API key creation
4. OAuth credential addition (ESP, AI provider, Shopify, Stripe Connect)

**TBD — Architect proposed, awaiting security review before adding to confirmed list:**

5. Member role escalation (any → `owner`/`admin`) — proposed; threat-model review pending
6. Vault key rotation initiation — proposed; threat-model review pending
7. Webhook secret regeneration — proposed; threat-model review pending

Adding any TBD item to the confirmed list requires R22 v2.x minor version bump after PO ratification with explicit threat-model justification. Until ratified, these operations DO NOT trigger MFA-04 challenge in production code; security relies on the operations being workspace-owner or workspace-admin gated via §4.4 permission table.

### 5.3 Challenge flow

1. Route handler detects sensitive op + `mfa_verified !== true`
2. Returns `428 MFA_CHALLENGE_REQUIRED` with `challenge_token` (5min TTL)
3. Client surfaces TOTP input UI; user enters code
4. Client POSTs `/auth/mfa/verify` with `{ challenge_token, code }`
5. Server verifies via Supabase Auth `mfa.verify()`; on success, issues new JWT with `mfa_verified: true`
6. Client retries original request with new JWT
7. `mfa_verified` remains true for the session (until logout or JWT refresh)

---

## 6. Row-Level Security (RLS) Enforcement

### 6.1 Tenant boundary contract (R20 v2 §3.1 authority)

Every tenant-scoped table has `workspace_id` FK to `workspaces(id) ON DELETE CASCADE` AND the standard RLS policy:

```sql
CREATE POLICY "ws_isolation_<name>" ON <name>
  FOR ALL USING (workspace_id IN (
    SELECT workspace_id FROM users WHERE id = auth.uid()
  ));
```

R22 v2 documents the ENFORCEMENT layer; R20 v2 documents the SCHEMA.

### 6.2 Composite FK pattern for brand-scoped tables (R20 v2 §2.10.1 authority)

For tables referencing `brands`, composite FK prevents cross-tenant brand assignment:

```sql
FOREIGN KEY (brand_id, workspace_id) REFERENCES brands(id, workspace_id) ON DELETE CASCADE
```

### 6.3 Deviation list (R20 v2 §3.1 authority)

Tables that legitimately deviate from standard RLS pattern, with justification: `workspaces`, `users`, `image_prompt_patterns`, `rlhf_votes`, `preference_model_versions`, `pattern_performance_metrics`, `system_config`, `system_config_audit_log`, `provider_pricing_registry`, `system_email_templates`, `hyve_pattern_performance`, `webhook_delivery_logs`, `workspace_members`. See R20 v2 §3.1 for per-table justification.

### 6.4 CI tenant-isolation test (Lock 13)

Every PR with schema changes runs: migrate fresh DB, create 2 workspaces (A, B) with 1 user each, as User A's authenticated connection attempt SELECT on every tenant-scoped table for workspace B's rows, assert each query returns 0 rows. Failure blocks merge.

---

## 7. Credential Vault

### 7.1 Encryption pattern

AES-256-GCM with random 12-byte IV per encryption. Blob format:

```
<version_byte:1><iv:12><tag:16><ciphertext:n>
```

`version_byte = 0x01` indicates current format. Future versions allow algorithm upgrades without breaking existing rows.

### 7.2 Key rotation pattern (Lock 19 compliance)

| Variable | Purpose |
|---|---|
| `VIYO_VAULT_KEY` | Active key — all NEW encryptions; primary for decryption |
| `VIYO_VAULT_KEY_PREVIOUS` | Previous key — decryption fallback only |

Decryption: try `VIYO_VAULT_KEY` first; on AEAD tag failure, try `VIYO_VAULT_KEY_PREVIOUS`; on second failure, return `DECRYPTION_FAILED`. After successful previous-key decrypt, enqueue background re-encryption with active key.

Rotation procedure: generate new 32-byte key as `VIYO_VAULT_KEY`; move prior value to `VIYO_VAULT_KEY_PREVIOUS`; deploy; background re-encryption job runs; after re-encryption complete (verified via metrics), set `VIYO_VAULT_KEY_PREVIOUS` empty in next deploy.

### 7.3 Vault module boundary (Lock 19)

`packages/shared/src/security/index.ts` exposes only: `encrypt(plaintext)`, `decrypt(ciphertext)`, `rotateRow(ciphertext)`. No raw key access. Worker boundary only — never imported into `apps/web/` or `apps/admin/` (CI grep enforces).

### 7.4 Encrypted credential tables

Per R20 v2: `esp_connections.api_key_encrypted` (§2.4.2), `integration_connections.access_token_encrypted` + `.refresh_token_encrypted` (§2.12), future `ai_provider_connections.api_key_encrypted` (R29 v2 §4.7 slot).

---

## 8. OAuth Flows

### 8.1 OAuth boundary contract

R22 v2 documents credential acquisition. Once credentials are stored encrypted in `integration_connections` or `esp_connections`, the decryption + invocation handoff to R29 v2 Plugin Registry per §7 + R29 v2 §6.3.

### 8.2 ESP OAuth flow

For OAuth-capable ESPs: standard OAuth 2.0 authorization code flow.

1. User clicks "Connect <ESP>"
2. Worker generates state token (32 random bytes, base64url), stores in `oauth_states` table (TTL 10min)
3. Worker redirects to ESP authorize URL with state + redirect_uri
4. User authorizes at ESP
5. ESP redirects to `/auth/oauth/<esp>/callback?code=<auth_code>&state=<state>`
6. Worker verifies state token, exchanges auth_code for tokens at ESP
7. Worker encrypts tokens, stores in `esp_connections.api_key_encrypted` + `.metadata.refresh_token_encrypted`
8. Worker redirects to UI completion URL

API-key-only ESPs skip OAuth: user pastes API key directly into encrypted store.

### 8.3 AI provider OAuth (R29 v2 boundary)

Same OAuth pattern as ESPs where supported; otherwise API key paste. Credentials stored in `ai_provider_connections.api_key_encrypted` (R20 v2 §1.2 reserved slot, R29 v2 §4.7 schema). R29 v2 `Registry.invoke()` resolves credentials at invocation time (R29 v2 §6.3) — R22 v2 documents STORAGE + VAULT BOUNDARY, R29 v2 documents INVOCATION.

### 8.4 Shopify OAuth (existing — preserved)

Standard Shopify OAuth flow. Tokens stored in `integration_connections` per R20 v2 §2.12.

### 8.5 Stripe Connect (T9 dependency)

Tokens stored in `integration_connections.metadata.stripe_account_id`. R22 v2 documents auth boundary; T9 owns billing logic.

---

## 9. Service-Role Bypass Detection

### 9.1 Documentation requirement

Every code path using service-role Supabase client MUST: (1) be documented in §9.3 or a consumer R-spec, (2) carry inline comment `// SERVICE_ROLE_BYPASS: <reason>`, (3) pass the CI grep test (§9.2).

### 9.2 CI grep test

```bash
matches=$(grep -rEn 'serviceRoleClient|createServiceRoleClient|service_role_client' \
  --include='*.ts' --include='*.tsx' packages/ apps/)
echo "$matches" | while IFS=: read -r file line content; do
  context=$(sed -n "$((line-3)),${line}p" "$file")
  if ! echo "$context" | grep -q 'SERVICE_ROLE_BYPASS:'; then
    echo "UNDOCUMENTED: $file:$line"
  fi
done
```

CI fails on any undocumented service-role usage.

### 9.3 Documented service-role use sites

| Site | Reason | Owner R-spec |
|---|---|---|
| Stripe webhook processing | Atomic billing updates across workspace boundaries | T9 |
| Scheduled cost reconciliation | Cross-workspace aggregation of `token_usage_logs` | R23 |
| RLHF aggregation | Global pattern performance metrics | R24 v2 |
| Admin dashboard | Service-role admin functions for SecurityDashboard.tsx | R22 v2 |
| Pattern Seeding | Bulk insert to `image_prompt_patterns` (global table) | R24 v2 |
| Plugin Registry credential resolution | Reads `esp_connections` / `ai_provider_connections` for any workspace at invocation time | R29 v2 |
| Webhook delivery | Reads `webhook_endpoints` across workspaces for dispatch | T48 v3.0 + D11 |

---

## 10. Rate Limiting

### 10.1 Enforcement mechanism (thresholds TENTATIVE — PO ratification required)

R22 v2 documents the rate-limit ENFORCEMENT MECHANISM. **Actual threshold values are business-policy decisions and require explicit PO ratification before being locked into the spec.**

**Mechanism:** Upstash Redis stores per-workspace token bucket counters. Hono middleware after auth atomically decrements counter for `ratelimit:ws:<workspaceId>`. On counter < 0, return `429 RATE_LIMITED` with `Retry-After` header. Counter refills via background process at tier-defined rate.

**Tier threshold table — TENTATIVE, PENDING PO RATIFICATION before B-0.02 implementation lock:**

| Tier | Bucket size | Refill rate |
|---|---|---|
| `free` | TBD | TBD |
| `starter` | TBD | TBD |
| `growth` | TBD | TBD |
| `agency` | TBD | TBD |

Architect proposed placeholder values for prior draft consideration: `free` 60 requests / 1 req/sec, `starter` 300 / 5, `growth` 1,200 / 20, `agency` 6,000 / 100. These are NOT canonical until PO ratifies. Until ratified, B-0.02 implementation cannot lock final numbers. Ratification target: surface to R23 + T9 cross-team discussion; PO sets final values based on token-economics costing.

### 10.2 Webhook signature verification (inbound)

Inbound webhooks (`/webhooks/stripe`, `/webhooks/<esp>`) bypass auth but require HMAC-SHA256 signature verification:
1. Extract signature header (provider-specific)
2. Read raw request body
3. Compute HMAC-SHA256 of body using webhook secret
4. Constant-time comparison to provided signature
5. On mismatch, return `401 INVALID_SIGNATURE`

### 10.3 Outbound webhook signing (D11 / T48 v3.0 reference)

Outbound webhooks signed per R20 v2 §2.11 + D11. R22 v2 documents verification side; D11 owns dispatch side.

---

## 11. Failure Modes

| Failure | Trigger | Error code | Severity | Recovery |
|---|---|---|---|---|
| Expired JWT | `exp` < NOW() | `AUTH_TOKEN_EXPIRED` | INFO | Client refresh |
| Invalid JWT signature | Verification fails | `AUTH_TOKEN_INVALID` | WARN | Force re-login |
| Missing workspace membership | JWT claim but no `workspace_members` row | `AUTH_WORKSPACE_REVOKED` | WARN | Force workspace switch |
| API key not found | SHA-256 lookup miss | `AUTH_API_KEY_INVALID` | INFO | No retry |
| API key expired | `expires_at < NOW()` | `AUTH_API_KEY_EXPIRED` | INFO | User rotates |
| Permission denied | Role lacks capability | `PERMISSION_DENIED` | INFO | None |
| Tier insufficient | Capability requires higher tier | `SUBSCRIPTION_REQUIRED` | INFO | Upgrade flow |
| MFA challenge required | Sensitive op + `mfa_verified !== true` | `MFA_CHALLENGE_REQUIRED` | INFO | Client surfaces TOTP |
| MFA verification failed | TOTP code mismatch | `MFA_CODE_INVALID` | WARN | Retry (5 attempts / 5min) |
| MFA recovery code consumed | Single-use code used | None — expected | INFO | Code removed |
| Vault decryption failed | AEAD tag mismatch on both keys | `VAULT_DECRYPTION_FAILED` | CRITICAL | Mark credential `is_active=false`; alert |
| Vault key missing | `VIYO_VAULT_KEY` env unset | `VAULT_KEY_MISSING` | CRITICAL | Process fails fast at startup |
| RLS denial | Authenticated query crossing tenant | `RLS_VIOLATION` | WARN | Sentry capture; query returns 0 |
| Service-role bypass undocumented | CI grep finds usage without comment | `CI_LOCK_13_VIOLATION` | BLOCKING | PR cannot merge |
| Rate limit exceeded | Token bucket exhausted | `RATE_LIMITED` | INFO | Client retries after `Retry-After` |
| Webhook signature mismatch | HMAC verification fails | `INVALID_WEBHOOK_SIGNATURE` | WARN | Reject; Sentry capture |
| OAuth state token expired | `oauth_states.expires_at < NOW()` | `OAUTH_STATE_EXPIRED` | INFO | User restarts flow |
| OAuth state token mismatch | CSRF protection trigger | `OAUTH_STATE_INVALID` | CRITICAL | Reject; Sentry capture |
| Custom role JSONB malformed | App validation fails | `CUSTOM_ROLE_SCHEMA_INVALID` | ERROR | UPDATE rejected |
| Owner role uniqueness violation | Attempt to create second `owner` | `OWNER_ROLE_UNIQUE` | ERROR | App-layer rejection |

---

## 12. Edge Cases

- Multi-workspace user (5+ memberships): UI workspace switcher; JWT carries one `workspace_id` at a time
- Workspace switch mid-session: new JWT issued; `mfa_verified` resets to false for new workspace context
- User deleted while session active: JWT remains valid until expiry; refresh fails with `USER_DELETED`
- Workspace deleted while members logged in: all members' JWTs invalidated on next request (membership miss)
- API key created on workspace then workspace deleted: cascade delete via FK
- MFA enrolled then device lost: recovery code path; or workspace owner admin override (PERM-01 only)
- Vault key rotation mid-decrypt: tries current first, falls back to previous; rare ~ms race window
- Token bucket counter desync: Redis failure → fail-closed (deny mode); admin alert
- Concurrent OAuth callback for same state: first wins (atomic delete); second gets `OAUTH_STATE_INVALID`
- Service-role used without comment: CI grep blocks PR
- Owner transfers ownership: two-step (new role grant, then old owner demoted); atomic transaction with MFA challenge
- Custom role missing capability key: app-layer treats missing as `false`; logs warning
- JWT clock skew: 30-second tolerance on `exp`
- Refresh token reuse attempt: Supabase detects, invalidates entire refresh chain; user forced re-login

---

## 13. Tests Required (ZCBR BR-3)

### 13.1 Authentication
JWT signature valid/invalid, expiry handling, refresh flow, logout invalidates, email verification gate.

### 13.2 API key
Creation returns raw once; SHA-256 match on verify; expired/revoked rejected; scope-restricted cannot exceed scopes; last-used updates async.

### 13.3 RBAC
5 roles × 10 capabilities = 50 cells verified; custom role JSONB grants; tier-gating overlays correctly (role allows + tier denies); owner uniqueness.

### 13.4 MFA
Enrollment end-to-end; challenge on each of 4 confirmed sensitive ops (§5.2 confirmed list); recovery code single-use; TOTP rate limit (5 attempts / 5min); `mfa_verified` resets on workspace switch.

### 13.5 RLS
Authenticated cannot read other tenant's rows on every tenant-scoped table; service-role can read all; anonymous returns 0; composite FK blocks cross-tenant brand assignment.

### 13.6 Vault
Encrypt → decrypt round-trip; decrypt with previous key triggers re-encryption job; both keys failing returns `VAULT_DECRYPTION_FAILED`; vault not importable from `apps/web/` or `apps/admin/` (CI grep); fails fast on missing `VIYO_VAULT_KEY`.

### 13.7 OAuth
State token CSRF; state TTL enforced; ESP OAuth round-trip; AI provider round-trip (mock); Shopify round-trip.

### 13.8 Rate limit
Bucket size + refill enforced per tier (once thresholds ratified); 429 includes `Retry-After`; Redis failure fail-closed.

### 13.9 Webhook signature
Stripe HMAC; ESP HMAC per ESP (8 ESPs); constant-time comparison prevents timing attacks; replay protection where applicable.

### 13.10 Service-role grep CI
All documented sites pass; fixture undocumented fails CI.

---

## 14. Mechanical Acceptance Criteria (ZCBR BR-7)

R22 v2 implementation is accepted when:

1. JWT middleware verifies signature, expiry, audience, loads user + workspace context on every authenticated route
2. API key utilities produce SHA-256 hashes byte-identical to verification path; `key_prefix` is exactly first 8 chars of random portion
3. 5-role enum in `packages/db/src/schema/identity.ts` matches R20 v2 §2.1.4 exactly
4. Custom role JSONB schema validated at app layer per §4.2
5. Static permission table (§4.4) implemented in shared module callable from web + worker
6. **Tier-gating mechanism (`requireTier`)** implemented per §4.5; reads `workspaces.subscription_tier` from R20 v2 §2.1.1. **Capability×tier matrix policy supplied by R23, NOT defined in R22 v2.**
7. MFA-01 enrollment wired to Supabase Auth `mfa.enroll()`
8. **MFA-04 challenge triggers on each of 4 confirmed sensitive operations (§5.2 confirmed list).** TBD operations (§5.2 TBD list) DO NOT trigger MFA-04 until PO ratifies via v2.x minor bump
9. MFA-05 recovery codes generated at enrollment; single-use verified
10. Vault module uses AES-256-GCM with version-byte format (§7.1)
11. Vault key rotation pattern with `VIYO_VAULT_KEY` + `VIYO_VAULT_KEY_PREVIOUS` works per §7.2
12. Vault module CI import test: vault import from `apps/web/` or `apps/admin/` fails CI grep
13. RLS policies present on every tenant-scoped table per R20 v2 §2 + R22 v2 §6.1
14. CI tenant-isolation test (§6.4) passes on every PR
15. Composite FK pattern present on `assets`, `comments`, `brand_preferences` per R20 v2 (§6.2)
16. Service-role bypass CI grep test passes — every use site documented per §9.3
17. **Rate-limit enforcement mechanism implemented via Upstash Redis token bucket per §10.1 mechanism description. Tier threshold VALUES await PO ratification before B-0.02 lock; until ratified, B-0.02 acceptance criterion #17 is INCOMPLETE.**
18. Webhook HMAC verification on every inbound webhook route per §10.2
19. OAuth state token CSRF protection per §8.2 with 10min TTL
20. R22 v1 superseded — separate cleanup directive lands SUPERSEDED header on `R22_SECURITY_AUTHENTICATION_ENTERPRISE.md` within 24hr of R22 v2 merge

---

## 15. Locks & Decisions Invoked

| Authority | Application in R22 v2 |
|---|---|
| L1 (Identity & Multi-Tenancy) | PRIMARY — 5-role enum, workspace boundary, JWT workspace claim |
| L7 (Observability) | Auth events emit OTel spans; failures captured in Sentry per §11 severity |
| L13 (Multi-tenant RLS) | RLS enforcement §6; CI tenant-isolation test §6.4 |
| L19 (Provider Agnosticism) | Vault module boundary §7.3; AI provider credentials flow through R29 v2 boundary |
| L20 (ZCBR-Validated Specs) | This spec is ZCBR PASSED |
| L21 (Governance Agnosticism) | Spec text describes capabilities; tier-gating MATRIX deferred to R23 per scope boundary §4.5 |
| D8 (5-tier subscription pricing) | Tier-gating mechanism §4.5 reads tier; matrix is R23's authority |
| D11 (Webhook architecture) | Outbound webhook signing references; inbound HMAC verification §10.2 |
| D55 (R29 Option C — unified Plugin Registry) | OAuth boundary §8.3 hands off to R29 v2 `Registry.invoke` |
| D56 (Token metering Phase 0/Phase 1) | Rate-limit threshold ratification gate §10.1 |
| D63 (Skills do not live in git) | Portal auth out-of-scope for R22 v2 |
| D66 (B-1.00 first Path C Bullet) | Auth must be production-ready; mechanical acceptance §14 verifies |

---

## 16. Migration to v2 (Implementation Path)

R22 v2 commits via Path B Manus directive to `/docs/research_specs/R22_SECURITY_AUTHENTICATION_v2.md`. Sequence (identical pattern to R20 v2 / R24 v2 / R19 v2 / R21 v2): R22-V2-COMMIT-001 directive (spec only) → R22-V2-SUPERSESSION-001 directive (SUPERSEDED header on v1, separate PR after spec PR merges).

Implementation work to align repo with R22 v2 mechanical acceptance criteria is separate Bullet scope; some criteria already satisfied, others additive JIT.

---

## 17. v1 → v2 Changelog

| Aspect | v1 → v2 change |
|---|---|
| File size | 6,328 bytes → ~38 KB |
| ZCBR header | None → full YAML frontmatter with PASSED status |
| Cross-spec wiring | Brief prose mention → formal table of 10 consumer/dependency relationships |
| R20 v2 alignment | None → 5 specific section citations |
| Authentication | JWT lifecycle surface → full Supabase GoTrue integration with custom claims, middleware contract |
| API keys | SHA-256 covered → full schema reconciliation, scopes vocabulary, rotation |
| RBAC | Not covered → 5-role enum, static permission table (50 cells), custom role JSONB |
| Tier-gating | Not covered → enforcement mechanism only; capability×tier matrix scope-bounded to R23 |
| MFA | Not covered → 3 enforcement points + 4 confirmed sensitive ops + 3 TBD operations clearly flagged |
| RLS enforcement | RLS contract covered → enforcement layer, deviation registry, CI test, composite FK |
| Vault | `VIYO_VAULT_KEY` only → full AES-256-GCM with version byte, `VIYO_VAULT_KEY_PREVIOUS` rotation, module boundary |
| OAuth | ESP encryption only → ESP + AI provider (R29 v2 boundary) + Shopify + Stripe Connect, CSRF |
| Service-role bypass | Mentioned → registry of 7 documented sites, CI grep contract |
| Rate limiting | Mentioned (Upstash) → enforcement mechanism + TENTATIVE thresholds awaiting PO ratification |
| Webhook signatures | Not covered → inbound HMAC verification, outbound D11 reference |
| Failure modes | None → 21-row catalog with severity + recovery |
| Edge cases | None → 14 cases covered |
| Tests required | None → 10-category ZCBR BR-3 plan |
| Mechanical acceptance | None → 20 binary criteria (ZCBR BR-7) |
| Locks invoked | None → 6 Locks (L1, L7, L13, L19, L20, L21) + 6 Decisions |
| Open items | None → 7 explicit deferred items §18 |

### 17.1 rev1 → rev2 Architect-applied revisions (before lock)

Three Architect-flagged scope concerns resolved before R22 v2 commit:

1. **§4.5 Tier-gating** — capability×tier matrix removed from R22 v2; pointed to R23 as the matrix authority. R22 v2 retains only the `requireTier()` enforcement mechanism. Reason: R23 owns token economics + pricing; capability-tier policy is R23's natural scope.
2. **§5.2 Sensitive operations** — split into 4 confirmed (workspace deletion, billing, API key creation, OAuth credential addition) + 3 TBD (member role escalation, vault key rotation, webhook secret regeneration). Reason: confirmed list reflects high-confidence threat-model needs; TBD list is Architect-proposed pending explicit security review before lock.
3. **§10.1 Rate-limit thresholds** — tier threshold values marked TENTATIVE pending PO ratification. R22 v2 documents the enforcement mechanism; actual numbers are business-policy decisions requiring PO sign-off based on R23 + T9 cross-team token-economics costing. Reason: arbitrary placeholder numbers locked into a canonical spec create cleanup PRs later.

All three revisions surface previously-hidden scope-boundary decisions for explicit ratification rather than burying them as silent Architect choices.

---

## 18. Open Items NOT Closed by R22 v2

1. **Capability×tier matrix policy** — R23 Cost Engine authority; R22 v2 supplies only mechanism. R23 audit & rewrite is B-XC.22 (next CRITICAL queue item per Audit Table v1.4).
2. **Rate-limit tier thresholds** — TENTATIVE per §10.1; require PO ratification before B-0.02 implementation lock. Tied to R23 + T9 cross-team discussion.
3. **3 TBD sensitive operations** — §5.2 TBD list (member role escalation, vault key rotation, webhook secret regeneration) pending security review; addition requires R22 v2.x minor bump with PO ratification.
4. **`ai_provider_connections` schema** — R20 v2 §1.2 reserved slot + R29 v2 §4.7 planned shape; DDL ships with B-XC.01 follow-on work.
5. **`oauth_states` table** — referenced §8.2 for CSRF protection; schema not yet in R20 v2 (planned for R20 v2.1 minor bump alongside this spec's implementation).
6. **Portal-side auth** — D63 declares skills live in Portal; Portal auth boundary is separate spec (out of VIYO repo scope).
7. **WebAuthn / hardware security key support** — MFA currently TOTP only; WebAuthn deferred to future R22 v2.x.
8. **Audit log table for security events** — auth events flow to Sentry currently; durable audit log table is future scope.

---

## 19. Document Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion VIYO Decision Log.

**Trigger for v3:** 5-role enum breaking change; vault encryption algorithm change; JWT claim breaking change; new domain of credentials beyond ESP/AI/Shopify/Stripe.

**Trigger for v2.x minor bump:** Additive sensitive operation (MFA-04 catalog); additive capability vocabulary; additive scope vocabulary; additive service-role use site; new ESP provider (paired with R20 minor bump); rate-limit threshold ratification.

**Re-validation:** R22 v2 re-validates against ZCBR_STANDARD every 180 days per `zcbr-spec-validation` skill HEADER_STALE rule.

---

*End of R22 Security & Authentication v2 (rev2) — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
