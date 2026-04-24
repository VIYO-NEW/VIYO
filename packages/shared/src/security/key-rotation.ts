/**
 * Key Rotation Utility — R22 §4, T8
 *
 * Re-encrypts all credentials from old key to new key atomically.
 * Used by admin CLI or Inngest function — NOT exposed via API.
 *
 * Authority: R22 §4, ARCH_LOCK_V3 §3
 */
import { VaultService } from './vault.js';

export interface EncryptedRow {
  /** Record ID (uuid) */
  id: string;
  /** The encrypted payload (iv:authTag:ciphertext) */
  encryptedValue: string;
}

export interface RotationResult {
  /** Total rows processed */
  total: number;
  /** Rows successfully re-encrypted */
  rotated: number;
  /** Rows that were already encrypted with the new key */
  skipped: number;
  /** Rows that failed (corrupted or unknown key) */
  failed: Array<{ id: string; error: string }>;
}

/**
 * Rotate vault key: re-encrypt all credentials from old key to new key.
 *
 * The VaultService is initialized with newKey as primary and oldKey as previous,
 * so decrypt() will try newKey first (for already-rotated rows) then fall back
 * to oldKey (for rows still encrypted with the old key).
 *
 * @param oldKeyHex - The old VIYO_VAULT_KEY (hex-encoded, 64 chars)
 * @param newKeyHex - The new VIYO_VAULT_KEY (hex-encoded, 64 chars)
 * @param rows - Array of encrypted rows to rotate
 * @returns RotationResult with counts and any failures
 */
export function rotateVaultKey(
  oldKeyHex: string,
  newKeyHex: string,
  rows: EncryptedRow[],
): { result: RotationResult; rotatedRows: Array<{ id: string; newEncryptedValue: string }> } {
  // VaultService with new key as primary, old key as fallback
  const vault = new VaultService(newKeyHex, oldKeyHex);
  // Separate service with ONLY the new key — for re-encryption
  const newVault = new VaultService(newKeyHex);

  const result: RotationResult = {
    total: rows.length,
    rotated: 0,
    skipped: 0,
    failed: [],
  };

  const rotatedRows: Array<{ id: string; newEncryptedValue: string }> = [];

  for (const row of rows) {
    try {
      // Check if already encrypted with new key
      if (!vault.isEncryptedWithPreviousKey(row.encryptedValue)) {
        result.skipped++;
        continue;
      }

      // Decrypt with old key (via dual-key fallback) and re-encrypt with new key
      const plaintext = vault.decrypt(row.encryptedValue);
      const newEncrypted = newVault.encrypt(plaintext);

      rotatedRows.push({ id: row.id, newEncryptedValue: newEncrypted });
      result.rotated++;
    } catch (err) {
      result.failed.push({
        id: row.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return { result, rotatedRows };
}
