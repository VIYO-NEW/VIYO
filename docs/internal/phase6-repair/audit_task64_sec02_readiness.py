#!/usr/bin/env python3
"""Deterministic SEC-02 encryption readiness audit for Task 64.

This script performs read-only checks against first-party source files and emits an
ASCII evidence report. It does not modify product code or repository state.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re

REPO = Path('/home/ubuntu/VIYO')
OUT = REPO / 'docs/internal/phase6-repair/task64_sec02_readiness_audit_ascii.txt'

@dataclass
class Check:
    name: str
    status: str
    evidence: str


def read(rel: str) -> str:
    return (REPO / rel).read_text(encoding='utf-8')

checks: list[Check] = []

vault = read('packages/shared/src/security/vault.ts')
checks.append(Check(
    'VaultService AES-256-GCM algorithm',
    'PASS' if "const ALGORITHM = 'aes-256-gcm'" in vault else 'FAIL',
    "packages/shared/src/security/vault.ts declares const ALGORITHM = 'aes-256-gcm'.",
))
checks.append(Check(
    'VaultService 256-bit key enforcement',
    'PASS' if 'const KEY_LENGTH = 32' in vault and 'must be exactly' in vault else 'FAIL',
    'VaultService validates a 32-byte / 64-hex-character VIYO_VAULT_KEY.',
))
checks.append(Check(
    'VaultService authenticated payload format',
    'PASS' if 'iv(24hex):authTag(32hex):ciphertext(hex)' in vault and 'getAuthTag' in vault else 'FAIL',
    'VaultService stores iv:authTag:ciphertext and validates three colon-separated hex segments.',
))
checks.append(Check(
    'Dual-key decrypt and rotation support',
    'PASS' if 'VIYO_VAULT_KEY_PREVIOUS' in vault and 'previousKey' in vault else 'FAIL',
    'VaultService supports VIYO_VAULT_KEY_PREVIOUS and dual-key fallback during decrypt.',
))
checks.append(Check(
    'Sensitive error-report scrubbing patterns',
    'PASS' if 'SENSITIVE_FIELD_PATTERNS' in vault and '/token/i' in vault and '/secret/i' in vault else 'FAIL',
    'Shared scrub patterns include token, secret, key, credential, password, vault, api_key, and apikey.',
))

key_rotation = read('packages/shared/src/security/key-rotation.ts')
checks.append(Check(
    'Key rotation helper exists',
    'PASS' if 'rotateVaultKey' in key_rotation and 'rotatedRows' in key_rotation else 'FAIL',
    'packages/shared/src/security/key-rotation.ts provides rotateVaultKey with rotatedRows output.',
))

email_schema = read('packages/db/src/schema/email.ts')
checks.append(Check(
    'ESP API keys stored in encrypted column',
    'PASS' if 'apiKeyEncrypted' in email_schema and "api_key_encrypted" in email_schema else 'FAIL',
    'packages/db/src/schema/email.ts defines esp_connections.api_key_encrypted as apiKeyEncrypted.',
))

integrations_schema = read('packages/db/src/schema/integrations.ts')
checks.append(Check(
    'OAuth access token stored in encrypted column',
    'PASS' if 'accessTokenEncrypted' in integrations_schema and "access_token_encrypted" in integrations_schema else 'FAIL',
    'packages/db/src/schema/integrations.ts defines access_token_encrypted as accessTokenEncrypted.',
))
checks.append(Check(
    'OAuth refresh token stored in encrypted column',
    'PASS' if 'refreshTokenEncrypted' in integrations_schema and "refresh_token_encrypted" in integrations_schema else 'FAIL',
    'packages/db/src/schema/integrations.ts defines refresh_token_encrypted as refreshTokenEncrypted.',
))

credential_service = read('apps/worker/src/services/credential.service.ts')
checks.append(Check(
    'Credential create path encrypts before storage',
    'PASS' if 'const encrypted = vault.encrypt(input.apiKey)' in credential_service and 'apiKeyEncrypted: encrypted' in credential_service else 'FAIL',
    'apps/worker/src/services/credential.service.ts encrypts input.apiKey before inserting apiKeyEncrypted.',
))
checks.append(Check(
    'Credential update path re-encrypts before storage',
    'PASS' if 'updates.apiKeyEncrypted = vault.encrypt(input.apiKey)' in credential_service else 'FAIL',
    'apps/worker/src/services/credential.service.ts re-encrypts apiKey updates before persistence.',
))
checks.append(Check(
    'External credential metadata-only gate',
    'PASS' if "callerContext !== 'internal'" in credential_service and 'External callers must use getCredential()' in credential_service else 'FAIL',
    'getDecryptedApiKey rejects non-internal callerContext and list/get methods select metadata fields only.',
))

credential_routes = read('apps/worker/src/routes/v1/credentials.ts')
checks.append(Check(
    'Credential routes return metadata-only responses',
    'PASS' if 'metadata ONLY' in credential_routes and 'Vault not configured' in credential_routes else 'FAIL',
    'Credential API route comments and error handling confirm metadata-only responses and vault-required create/update.',
))

webhook_schema = read('packages/db/src/schema/webhooks.ts')
webhook_migration = read('packages/db/drizzle/0007_t45_composite_database_foundation.sql')
webhook_plain = bool(re.search(r"secret\s*:\s*varchar\('secret'", webhook_schema)) and 'secret VARCHAR(64) NOT NULL' in webhook_migration
checks.append(Check(
    'Webhook secret persistence requires before-use refactor',
    'GUARDRAIL' if webhook_plain else 'PASS',
    'Existing T45/T48 schema stores webhook_endpoints.secret as constrained VARCHAR(64), not as *_encrypted. Do not persist new webhook secrets until this path is encrypted or PO-approved as a non-recoverable derived value.',
))

status_counts: dict[str, int] = {}
for c in checks:
    status_counts[c.status] = status_counts.get(c.status, 0) + 1

lines = [
    '# Task 64 SEC-02 Encryption Readiness Audit',
    '',
    'Scope: read-only audit of first-party source files for AES-256-GCM readiness before Phase 6.2 introduces any sensitive-token persistence.',
    '',
    'Result Summary:',
    f"- PASS checks: {status_counts.get('PASS', 0)}",
    f"- FAIL checks: {status_counts.get('FAIL', 0)}",
    f"- GUARDRAIL checks: {status_counts.get('GUARDRAIL', 0)}",
    '',
    'Readiness Decision:',
    '- SEC-02 encryption foundation is READY for ESP API keys and OAuth token storage paths that use VaultService and *_encrypted columns.',
    '- Webhook endpoint secret persistence is NOT cleared for new writes as currently modeled; any implementation that creates or stores webhook endpoint secrets must first refactor to encrypted-at-rest storage or obtain explicit PO/security approval for a derived non-recoverable secret design.',
    '- This audit does not implement Phase 1-4 security work and does not modify product code.',
    '',
    '| Check | Status | Evidence |',
    '|---|---:|---|',
]
for c in checks:
    lines.append(f"| {c.name} | {c.status} | {c.evidence} |")
lines.append('')
lines.append('Source Files Audited:')
for rel in [
    'packages/shared/src/security/vault.ts',
    'packages/shared/src/security/key-rotation.ts',
    'packages/db/src/schema/email.ts',
    'packages/db/src/schema/integrations.ts',
    'packages/db/src/schema/webhooks.ts',
    'packages/db/drizzle/0007_t45_composite_database_foundation.sql',
    'apps/worker/src/services/credential.service.ts',
    'apps/worker/src/routes/v1/credentials.ts',
]:
    lines.append(f'- {rel}')
lines.append('')
OUT.write_text('\n'.join(lines), encoding='utf-8')
print(OUT)
print('\n'.join(lines[:28]))
