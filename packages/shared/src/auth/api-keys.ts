/**
 * API Key Utilities — R22 §3
 * Generation: viyo_live_ prefix + 24 bytes base64url = ~32 char random suffix.
 * Storage: Only SHA-256 hash is persisted. Raw key shown once on creation.
 * Verification: Hash incoming key, lookup in api_keys table.
 */
import { randomBytes, createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GeneratedApiKey, ApiKeyPayload } from './types.js';

const API_KEY_PREFIX = 'viyo_live_';

/**
 * Generate a new API key with its hash and display prefix.
 * R22 §3.1: The raw key is returned exactly once; only the hash is stored.
 */
export function generateApiKey(): GeneratedApiKey {
  const randomPart = randomBytes(24).toString('base64url');
  const rawKey = `${API_KEY_PREFIX}${randomPart}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 14);

  return { rawKey, keyHash, keyPrefix };
}

/**
 * Verify an incoming API key against the database.
 * Returns the workspace context if valid, null if invalid or expired.
 * Uses service_role client to bypass RLS (api_keys table is tenant-scoped).
 */
export async function verifyApiKey(
  rawKey: string,
  serviceClient: SupabaseClient,
): Promise<ApiKeyPayload | null> {
  if (!rawKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const { data, error } = await serviceClient
    .from('api_keys')
    .select('workspace_id, scopes, key_prefix, label, expires_at')
    .eq('key_hash', keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  await serviceClient
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  return {
    workspaceId: data.workspace_id,
    scopes: data.scopes ?? [],
    keyPrefix: data.key_prefix,
    label: data.label,
  };
}

/**
 * Check if a string looks like a VIYO API key (for routing in auth middleware).
 */
export function isApiKey(token: string): boolean {
  return token.startsWith(API_KEY_PREFIX);
}
