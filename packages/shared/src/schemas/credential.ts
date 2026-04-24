/**
 * Credential Schemas — T8, R22 §4, R29
 *
 * Zod validation schemas for credential CRUD operations.
 * Provider enum aligned with R20 esp_connections CHECK constraint.
 *
 * Authority: R20, R22 §4, R29, ARCH_LOCK_V3 §3
 */
import { z } from 'zod';

/**
 * ESP providers — aligned with R20 esp_connections CHECK constraint.
 * Extended with Phase 1+ integration types.
 */
export const ESP_PROVIDERS = [
  'klaviyo',
  'mailchimp',
  'sendgrid',
  'brevo',
  'hubspot',
  'activecampaign',
  'drip',
  'customer_io',
] as const;

export const EXTENDED_PROVIDERS = [
  ...ESP_PROVIDERS,
  'shopify',
  'stripe',
  'custom',
] as const;

export const espProviderSchema = z.enum(ESP_PROVIDERS);
export const extendedProviderSchema = z.enum(EXTENDED_PROVIDERS);

/**
 * Create credential request body.
 * The apiKey is the plaintext value — encrypted before storage.
 */
export const createCredentialSchema = z.object({
  provider: extendedProviderSchema,
  apiKey: z
    .string()
    .min(1, 'API key must not be empty')
    .max(4096, 'API key exceeds maximum length'),
  label: z
    .string()
    .max(100, 'Label must be 100 characters or fewer')
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update credential request body.
 * All fields optional — only provided fields are updated.
 * If apiKey is provided, it is re-encrypted.
 */
export const updateCredentialSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'API key must not be empty')
    .max(4096, 'API key exceeds maximum length')
    .optional(),
  label: z
    .string()
    .max(100, 'Label must be 100 characters or fewer')
    .optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * List credentials query params.
 * includeInactive=true shows soft-deleted credentials for recovery.
 */
export const listCredentialsQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});

/**
 * Credential response — metadata only, NEVER includes plaintext.
 * The apiKey field is intentionally omitted from all API responses.
 */
export const credentialResponseSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  provider: extendedProviderSchema,
  label: z.string().nullable(),
  isActive: z.boolean(),
  lastSyncedAt: z.string().datetime().nullable(),
  metadata: z.record(z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateCredentialInput = z.infer<typeof createCredentialSchema>;
export type UpdateCredentialInput = z.infer<typeof updateCredentialSchema>;
export type ListCredentialsQuery = z.infer<typeof listCredentialsQuerySchema>;
export type CredentialResponse = z.infer<typeof credentialResponseSchema>;
