# Task 64 — T50 SEC-02 Encryption Foundation Readiness

**Status:** Ready with one explicit before-use guardrail.
**Taskmaster ID:** 64.
**Taskmaster title:** T50: SEC-02 Encryption Foundation Readiness.
**Taskmaster description:** Confirm encryption design readiness before sensitive-token persistence is introduced.
**Taskmaster details:** Source: PO Combined Directive v2 Section 3. Confirm AES-256-GCM implementation path for OAuth tokens, API keys, webhook secrets, and other Restricted-class data. No plaintext secret persistence may be introduced by Phase 6. This is a readiness and architecture gate unless implementation is triggered by sensitive-token storage.

## Decision

Task 64 is satisfied as a **readiness and architecture gate** because the first-party repository already contains an AES-256-GCM VaultService implementation, encrypted persistence columns for ESP API keys and OAuth tokens, service-layer encryption before storage, metadata-only external credential responses, and build/type-check validation for the shared encryption package. This task did **not** modify product code and did **not** implement trigger-bound Phase 1–4 security work prematurely.

The gate includes one mandatory guardrail: **webhook endpoint secret persistence is not cleared for any new Phase 6.2 writes in its current T45/T48 schema form**. Existing schema code models `webhook_endpoints.secret` as a constrained `VARCHAR(64)` field rather than an encrypted-at-rest payload. Any implementation that creates, rotates, returns, or stores webhook endpoint signing secrets must first refactor that path to encrypted-at-rest storage through VaultService or obtain explicit PO/security approval for a derived non-recoverable secret design. Until that is done, Phase 6.2 implementation may proceed only for work that does not introduce new plaintext webhook-secret persistence.

## Evidence summary

| Requirement | Classification | Evidence |
|---|---:|---|
| AES-256-GCM implementation path | Pass | `packages/shared/src/security/vault.ts` declares AES-256-GCM, validates 32-byte / 64-hex-character vault keys, stores authenticated `iv:authTag:ciphertext` payloads, and supports dual-key fallback. |
| API key restricted-data storage | Pass | `packages/db/src/schema/email.ts` defines `esp_connections.api_key_encrypted`; `apps/worker/src/services/credential.service.ts` encrypts create and update values before persistence. |
| OAuth token restricted-data storage | Pass | `packages/db/src/schema/integrations.ts` defines `access_token_encrypted` and `refresh_token_encrypted` fields for integration connections. |
| Plaintext exposure controls | Pass | `apps/worker/src/services/credential.service.ts` exposes plaintext only through `getDecryptedApiKey(..., callerContext: 'internal')`; list/get routes select and return metadata-only fields. |
| External API response posture | Pass | `apps/worker/src/routes/v1/credentials.ts` documents and implements metadata-only credential responses and returns `Vault not configured` when vault keys are missing for create/update paths. |
| Error/telemetry redaction foundation | Pass | Shared `SENSITIVE_FIELD_PATTERNS` covers token, secret, key, credential, password, vault, api_key, and apikey naming patterns. |
| Key rotation readiness | Pass | `packages/shared/src/security/key-rotation.ts` provides `rotateVaultKey` and returns re-encrypted rows for admin/worker usage. |
| Webhook signing secret storage | Guardrail | `packages/db/src/schema/webhooks.ts` and migration `0007_t45_composite_database_foundation.sql` currently define `webhook_endpoints.secret` as a 64-character constrained secret rather than an encrypted payload. New writes to this path are blocked until encryption/refactor or explicit approval. |

## Validation performed

| Validation artifact | Result | Notes |
|---|---:|---|
| `task64_sec02_readiness_audit_ascii.txt` | Pass with guardrail | Deterministic read-only audit reported 13 PASS, 0 FAIL, and 1 GUARDRAIL. |
| `task64_shared_type_build_validation_ascii.txt` | Pass | `pnpm --filter @viyo/shared type-check` and `pnpm --filter @viyo/shared build` completed without errors. |
| `task64_shared_validation_ascii.txt` | Informational | The package test script found no shared-package test files and exited with Vitest code 1; this is recorded as a coverage absence, not a failing encryption implementation test. |

## Boundary conditions for downstream tasks

Downstream Phase 6.2 tasks may proceed only under these constraints. They may rely on the existing VaultService pattern for **API keys, OAuth access tokens, OAuth refresh tokens, and other recoverable Restricted-class credentials**. They must not introduce new plaintext columns, local-storage persistence, log persistence, telemetry persistence, or API responses containing recoverable restricted secrets. They must not create or persist webhook endpoint signing secrets through the existing `webhook_endpoints.secret` path unless that path is first remediated or explicitly approved as safe by PO/security authority.

This report intentionally remains an internal evidence artifact. It is not a product-code implementation, not a migration, and not a Phase 1–4 security work item.
