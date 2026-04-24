# R22 — Security & Authentication Architecture (Enterprise Spec)

## 1. Executive Summary

This specification defines the security posture, authentication flows, and authorization mechanisms for the VIYO platform. It covers user identity (Supabase Auth), machine-to-machine identity (API Keys), data encryption, and network-level protections.

**Key Cross-Spec Wiring:**
*   **R20 (Database):** Implements the Row Level Security (RLS) policies defined here.
*   **R29 (Platform Abstraction):** Relies on the ESP credential encryption standards defined here.
*   **R21 (Infrastructure):** Relies on the network security and edge protection defined here.

## 2. User Authentication (Supabase GoTrue)

VIYO delegates user identity to Supabase Auth (GoTrue).

### 2.1 Supported Auth Methods
*   **Magic Link (Passwordless):** Primary login method for web dashboard.
*   **OAuth (Google/Microsoft):** Supported for enterprise SSO.
*   **SAML 2.0:** Available for Enterprise tier workspaces.

### 2.2 JWT Lifecycle
1.  User authenticates via Vercel frontend.
2.  Supabase issues a short-lived access token (JWT, 1 hour) and a long-lived refresh token (HTTP-only secure cookie).
3.  The Next.js App Router middleware verifies the JWT on every request.

```typescript
// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
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

1.  **DDoS Protection:** Cloudflare WAF is enabled on all `*.viyo.ai` domains.
2.  **Rate Limiting:** Implemented at the API gateway level using Upstash Redis to prevent abuse of expensive LLM/Image endpoints.
3.  **CORS:** API endpoints restrict cross-origin requests to approved domains only.
