/**
 * Auth Types — R22 §2, §3
 * Shared authentication context types used by worker middleware and frontend stores.
 */
import { z } from 'zod';

/**
 * AuthContext is attached to every authenticated Hono request via middleware.
 * JWT auth resolves userId + workspaceId from the session.
 * API key auth resolves workspaceId + scopes from the api_keys table.
 */
export const AuthContextSchema = z.object({
  userId: z.string().uuid().nullable(),
  workspaceId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
  authMethod: z.enum(['jwt', 'api_key']),
  scopes: z.array(z.string()).default([]),
});

export type AuthContext = z.infer<typeof AuthContextSchema>;

/**
 * ApiKeyPayload — the resolved data from a verified API key lookup.
 * R22 §3: key_hash stored, raw key shown once on creation.
 */
export const ApiKeyPayloadSchema = z.object({
  workspaceId: z.string().uuid(),
  scopes: z.array(z.string()),
  keyPrefix: z.string(),
  label: z.string().nullable(),
});

export type ApiKeyPayload = z.infer<typeof ApiKeyPayloadSchema>;

/**
 * GeneratedApiKey — returned to the user exactly once on creation.
 * R22 §3.1: raw key is never stored or retrievable after creation.
 */
export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
}
