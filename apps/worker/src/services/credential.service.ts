/**
 * Credential Service — T8, R22 §4, R29
 *
 * Business logic for credential CRUD operations.
 * Uses VaultService for AES-256-GCM encryption/decryption.
 * Workspace-scoped: all operations require workspaceId.
 *
 * INTERNAL-ONLY GATE:
 * - listCredentials() and getCredential() NEVER return plaintext
 * - getDecryptedApiKey() is the ONLY method that returns plaintext
 * - It requires callerContext = 'internal' (Inngest functions only)
 * - External callers (API routes) MUST NOT call getDecryptedApiKey()
 *
 * Authority: R22 §4, R29, ARCH_LOCK_V3 §3
 */
import { eq, and, sql } from 'drizzle-orm';
import { espConnections } from '@viyo/db';
import { VaultService } from '@viyo/shared';
import { getDb } from '../lib/db.js';

/** Caller context for internal-only gate */
export type CallerContext = 'internal' | 'external';

/** Credential metadata returned by list/get (no plaintext) */
export interface CredentialMetadata {
  id: string;
  workspaceId: string;
  provider: string;
  label: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/** Get or create VaultService singleton from env */
let vaultInstance: VaultService | null = null;

function getVault(): VaultService {
  if (vaultInstance) return vaultInstance;

  const key = process.env.VIYO_VAULT_KEY;
  if (!key) {
    throw new Error('[VIYO] VIYO_VAULT_KEY is not set — credential operations are unavailable');
  }

  const previousKey = process.env.VIYO_VAULT_KEY_PREVIOUS || undefined;
  vaultInstance = new VaultService(key, previousKey);
  return vaultInstance;
}

/** Require DB or throw 503 */
function requireDb() {
  const db = getDb();
  if (!db) {
    throw Object.assign(new Error('Database not available'), { statusCode: 503 });
  }
  return db;
}

/**
 * Create a new encrypted credential.
 * The apiKey is encrypted before storage — zero plaintext at rest.
 */
export async function createCredential(input: {
  workspaceId: string;
  provider: string;
  apiKey: string;
  label?: string;
  metadata?: Record<string, unknown>;
}): Promise<CredentialMetadata> {
  const db = requireDb();
  const vault = getVault();

  const encrypted = vault.encrypt(input.apiKey);

  const [row] = await db
    .insert(espConnections)
    .values({
      workspaceId: input.workspaceId,
      provider: input.provider,
      apiKeyEncrypted: encrypted,
      isActive: true,
      metadata: input.metadata ?? {},
    })
    .returning();

  return toMetadata(row);
}

/**
 * List credentials for a workspace — metadata only, NEVER plaintext.
 * Supports ?includeInactive=true for soft-delete recovery.
 */
export async function listCredentials(
  workspaceId: string,
  options: { includeInactive?: boolean } = {},
): Promise<CredentialMetadata[]> {
  const db = requireDb();

  const conditions = [eq(espConnections.workspaceId, workspaceId)];
  if (!options.includeInactive) {
    conditions.push(eq(espConnections.isActive, true));
  }

  const rows = await db
    .select({
      id: espConnections.id,
      workspaceId: espConnections.workspaceId,
      provider: espConnections.provider,
      isActive: espConnections.isActive,
      lastSyncedAt: espConnections.lastSyncedAt,
      metadata: espConnections.metadata,
      createdAt: espConnections.createdAt,
      updatedAt: espConnections.updatedAt,
    })
    .from(espConnections)
    .where(and(...conditions));

  return rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspaceId,
    provider: r.provider,
    label: null, // esp_connections doesn't have label column — use metadata
    isActive: r.isActive,
    lastSyncedAt: r.lastSyncedAt,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Get a single credential by ID — metadata only, NEVER plaintext.
 */
export async function getCredential(
  workspaceId: string,
  credentialId: string,
): Promise<CredentialMetadata | null> {
  const db = requireDb();

  const [row] = await db
    .select({
      id: espConnections.id,
      workspaceId: espConnections.workspaceId,
      provider: espConnections.provider,
      isActive: espConnections.isActive,
      lastSyncedAt: espConnections.lastSyncedAt,
      metadata: espConnections.metadata,
      createdAt: espConnections.createdAt,
      updatedAt: espConnections.updatedAt,
    })
    .from(espConnections)
    .where(
      and(
        eq(espConnections.id, credentialId),
        eq(espConnections.workspaceId, workspaceId),
      ),
    );

  if (!row) return null;

  return {
    id: row.id,
    workspaceId: row.workspaceId,
    provider: row.provider,
    label: null,
    isActive: row.isActive,
    lastSyncedAt: row.lastSyncedAt,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * INTERNAL-ONLY: Get the decrypted API key for an ESP connection.
 *
 * This is the ONLY method that returns plaintext. It is gated by callerContext:
 * - callerContext = 'internal' → allowed (Inngest functions, background workers)
 * - callerContext = 'external' → throws Error (API routes MUST NOT call this)
 *
 * The gate is enforced at the service layer, not the route layer,
 * per PO directive: "Only internal callers (Inngest functions) should ever receive plaintext."
 */
export async function getDecryptedApiKey(
  workspaceId: string,
  credentialId: string,
  callerContext: CallerContext,
): Promise<string> {
  if (callerContext !== 'internal') {
    throw new Error(
      'SECURITY VIOLATION: getDecryptedApiKey() can only be called from internal context (Inngest functions). ' +
      'External callers must use getCredential() which returns metadata only.',
    );
  }

  const db = requireDb();
  const vault = getVault();

  const [row] = await db
    .select({ apiKeyEncrypted: espConnections.apiKeyEncrypted })
    .from(espConnections)
    .where(
      and(
        eq(espConnections.id, credentialId),
        eq(espConnections.workspaceId, workspaceId),
      ),
    );

  if (!row) {
    throw new Error(`Credential ${credentialId} not found in workspace ${workspaceId}`);
  }

  return vault.decrypt(row.apiKeyEncrypted);
}

/**
 * Update a credential. If apiKey is provided, it is re-encrypted.
 */
export async function updateCredential(
  workspaceId: string,
  credentialId: string,
  input: {
    apiKey?: string;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  },
): Promise<CredentialMetadata | null> {
  const db = requireDb();
  const vault = getVault();

  const updates: Record<string, unknown> = {
    updatedAt: sql`now()`,
  };

  if (input.apiKey !== undefined) {
    updates.apiKeyEncrypted = vault.encrypt(input.apiKey);
  }
  if (input.isActive !== undefined) {
    updates.isActive = input.isActive;
  }
  if (input.metadata !== undefined) {
    updates.metadata = input.metadata;
  }

  const [row] = await db
    .update(espConnections)
    .set(updates)
    .where(
      and(
        eq(espConnections.id, credentialId),
        eq(espConnections.workspaceId, workspaceId),
      ),
    )
    .returning();

  if (!row) return null;

  return toMetadata(row);
}

/**
 * Soft-delete a credential (set isActive = false).
 * The encrypted data is preserved for potential recovery.
 */
export async function deleteCredential(
  workspaceId: string,
  credentialId: string,
): Promise<CredentialMetadata | null> {
  return updateCredential(workspaceId, credentialId, { isActive: false });
}

/**
 * Restore a soft-deleted credential (set isActive = true).
 */
export async function restoreCredential(
  workspaceId: string,
  credentialId: string,
): Promise<CredentialMetadata | null> {
  return updateCredential(workspaceId, credentialId, { isActive: true });
}

// --- Internal helpers ---

function toMetadata(row: typeof espConnections.$inferSelect): CredentialMetadata {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    provider: row.provider,
    label: null, // esp_connections uses metadata for labels
    isActive: row.isActive,
    lastSyncedAt: row.lastSyncedAt,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Reset vault instance — for testing only.
 */
export function resetVaultInstance(): void {
  vaultInstance = null;
}
