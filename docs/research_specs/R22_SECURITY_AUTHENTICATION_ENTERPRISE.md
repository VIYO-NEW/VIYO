---
**STATUS: SUPERSEDED**

This document is superseded by R22 v2 at `/docs/research_specs/R22_SECURITY_AUTHENTICATION_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation, merged via R22-V2-COMMIT-001 directive at PR #34, commit `31bba0963ab44176af2186f11d4ccf8a42db3fe9`).

This v1 file is retained as historical reference only. v1 was a 6,328-byte skeleton covering three topics surface-level (JWT auth, API key hashing, ESP credential encryption) with zero ZCBR infrastructure and zero R20 v2 alignment. v2 (37,348 bytes) reconciles against committed implementation, ties the spec to R20 v2 schema authority, integrates the R29 v2 Plugin Registry credential boundary, and adds the full ZCBR substrate.

All R-specs and Bullet directives that cite "R22" or "R22 v1" MUST be interpreted as citing R22 v2 going forward.

Do NOT use this file as canonical. Do NOT update this file. See R22 v2.

**Superseded by:** B-XC.21 triage REWRITE (Phase 0 audit B-XC.21-AUDIT-001) → R22 v2 authoring (2026-05-12) → R22-V2-COMMIT-001 PR #34 merge
**Superseded date:** 2026-05-12
---

# R22 — Security & Authentication Architecture (Enterprise Spec)

## 1. Executive Summary

This specification defines the security posture, authentication flows, and authorization mechanisms for the VIYO platform. It covers user identity (Supabase Auth), machine-to-machine identity (API Keys), data encryption, and network-level protections.

**Key Cross-Spec Wiring:**
*   **R20 (Database):** Implements the Row Level Security (RLS) policies defined here.
*   **R29 (Platform Abstraction):** Relies on the ESP credential encryption standards defined here.
*   **R21 (Infrastructure):** Relies on the network security and edge protection defined here.

## 2. User Authentication (Supabase GoTrue)

VIYO delegates user identity to Supabase Auth (GoTrue) while preserving the v7.1 locked stack: a Vite React SPA hosted on Vercel calls a Hono API backend running on Render, with Supabase as the database/auth authority.

### 2.1 Supported Auth Methods
*   **Magic Link (Passwordless):** Primary login method for web dashboard.
*   **OAuth (Google/Microsoft):** Supported for enterprise SSO.
*   **SAML 2.0:** Available for Enterprise tier workspaces.

### 2.2 JWT Lifecycle
1.  User authenticates from the Vite React SPA hosted on Vercel through Supabase Auth.
2.  Supabase issues a short-lived access token (JWT, 1 hour) and a refresh token managed by the Supabase browser client.
3.  The React/TanStack Router layer protects client-only routes for user experience, but the Hono API backend on Render is the authoritative enforcement point for every protected request.
4.  Hono middleware verifies the `Authorization: Bearer <jwt>` token with Supabase before attaching the authenticated user context to downstream route handlers.

```typescript
// apps/api/src/middleware/auth.ts
import { createClient } from '@supabase/supabase-js';
import type { Context, Next } from 'hono';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function requireUser(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) {
    return c.json({ error: 'Missing bearer token' }, 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('user', data.user);
  return next();
}
```

## 3. API Key Management (M2M Auth)

For programmatic access (e.g., triggering workflows via API), VIYO issues scoped API keys.

### 3.1 Key Generation & Storage
API keys are generated securely, hashed before storage, and NEVER stored in plaintext.

1.  **Generation:** `viyo_live_` + 32 bytes of cryptographically secure random data (base62 encoded).
2.  **Storage:** Only the SHA-256 hash of the key is stored in the database.
3.  **Display:** The raw key is shown to the user exactly once upon creation.

```typescript
// src/lib/auth/api-keys.ts
import { randomBytes, createHash } from 'crypto';

export function generateApiKey() {
  const rawKey = `viyo_live_${randomBytes(24).toString('base64url')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 14); // e.g., viyo_live_AbCd
  
  return { rawKey, keyHash, keyPrefix };
}

export async function verifyApiKey(rawKey: string, supabase: any) {
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('workspace_id, scopes')
    .eq('key_hash', keyHash)
    .single();
    
  return keyRecord; // Returns null if invalid
}
```

## 4. ESP Credential Encryption (R29 Wiring)

VIYO must store third-party ESP API keys (Klaviyo, Mailchimp) to perform operations on behalf of the user. These are highly sensitive.

### 4.1 Encryption at Rest
ESP credentials are encrypted at the application layer using AES-256-GCM before being written to the Supabase database. The encryption key (`VIYO_VAULT_KEY`) is stored securely in Doppler/Render and is never accessible to the database directly.

```typescript
// src/lib/security/vault.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// VIYO_VAULT_KEY must be exactly 32 bytes (hex encoded)
const VAULT_KEY = Buffer.from(process.env.VIYO_VAULT_KEY!, 'hex');

export function encryptCredential(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, VAULT_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptCredential(encryptedPayload: string): string {
  const [ivHex, authTagHex, encryptedText] = encryptedPayload.split(':');
  
  const decipher = createDecipheriv(
    ALGORITHM, 
    VAULT_KEY, 
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## 5. Row Level Security (RLS) Posture

Supabase RLS is the final line of defense against data leakage. Even if the backend API has a vulnerability, the database will reject unauthorized queries.

### 5.1 The Workspace Isolation Rule
Every tenant-scoped table MUST have the following policy applied:

```sql
CREATE POLICY "Workspace Isolation" ON public.[table_name]
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM public.users WHERE id = auth.uid()
  )
);
```

### 5.2 Service Role Bypass
Background workers (Inngest) and webhook receivers use the `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. These services must manually enforce tenant isolation in their application logic.

## 6. Network & Edge Security

1.  **DDoS Protection:** Cloudflare WAF is enabled on all production `*.viyo.app` domains.
2.  **Rate Limiting:** Implemented at the API gateway level using Upstash Redis to prevent abuse of expensive LLM/Image endpoints.
3.  **CORS:** API endpoints restrict cross-origin requests to approved domains only.
