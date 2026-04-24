/**
 * VaultService — R22 §4, R29 Wiring, T8
 *
 * AES-256-GCM encryption for ESP credentials and other sensitive data.
 * Fort Knox: zero-plaintext-at-rest, dual-key rotation, memory scrubbing.
 *
 * Encryption format: iv(24hex):authTag(32hex):ciphertext(hex)
 *
 * PO Directives:
 * - Dual-Key Decrypt: VIYO_VAULT_KEY + VIYO_VAULT_KEY_PREVIOUS for graceful rotation
 * - Memory Scrubbing: Sentry-compatible scrub list for key/secret/credential vars
 *
 * Authority: R22 §4, R29, ARCH_LOCK_V3 §3
 */
import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12;
const KEY_LENGTH = 32; // 256 bits

/**
 * Sensitive field patterns for Sentry/error-reporting scrubbing.
 * Any variable name matching these patterns MUST be redacted in logs and error reports.
 */
export const SENSITIVE_FIELD_PATTERNS = [
  /key/i,
  /secret/i,
  /credential/i,
  /password/i,
  /token/i,
  /vault/i,
  /api_key/i,
  /apikey/i,
] as const;

/**
 * Sentry beforeSend scrubber — strips sensitive fields from error reports.
 * Wire into Sentry.init({ beforeSend: scrubSensitiveData })
 */
export function scrubSensitiveData(event: Record<string, unknown>): Record<string, unknown> {
  const scrubbed = JSON.parse(JSON.stringify(event)) as Record<string, unknown>;

  function scrubObject(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scrubObject(obj[key] as Record<string, unknown>);
      }
    }
  }

  scrubObject(scrubbed);
  return scrubbed;
}

/**
 * Validate a hex-encoded vault key is exactly 32 bytes.
 * Throws with a clear message if invalid.
 */
function validateKey(hexKey: string, label: string): Buffer {
  if (!hexKey || typeof hexKey !== 'string') {
    throw new Error(`${label} is required but not set`);
  }

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(hexKey)) {
    throw new Error(`${label} must be a valid hex string`);
  }

  const keyBuffer = Buffer.from(hexKey, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(
      `${label} must be exactly ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars), got ${keyBuffer.length} bytes`,
    );
  }

  return keyBuffer;
}

/**
 * VaultService — singleton credential encryption service.
 *
 * Supports dual-key decrypt for graceful key rotation:
 * 1. Try decrypt with primary key (VIYO_VAULT_KEY)
 * 2. If that fails, try with previous key (VIYO_VAULT_KEY_PREVIOUS)
 * 3. If both fail, throw — credential is corrupted or keys are wrong
 */
export class VaultService {
  private readonly primaryKey: Buffer;
  private readonly previousKey: Buffer | null;

  constructor(primaryKeyHex: string, previousKeyHex?: string) {
    this.primaryKey = validateKey(primaryKeyHex, 'VIYO_VAULT_KEY');
    this.previousKey = previousKeyHex
      ? validateKey(previousKeyHex, 'VIYO_VAULT_KEY_PREVIOUS')
      : null;
  }

  /**
   * Encrypt a plaintext credential for storage.
   * Always uses the PRIMARY key for new encryptions.
   * Returns: iv(24hex):authTag(32hex):ciphertext(hex)
   */
  encrypt(plaintext: string): string {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Plaintext must be a non-empty string');
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.primaryKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt a credential with dual-key fallback.
   *
   * 1. Try primary key first
   * 2. If GCM auth fails and previousKey exists, try previous key
   * 3. If both fail, throw with clear error
   *
   * This enables zero-downtime key rotation: credentials encrypted with
   * the old key still decrypt while rotation is in progress.
   */
  decrypt(encryptedPayload: string): string {
    this.validatePayloadFormat(encryptedPayload);

    // Try primary key first
    try {
      return this.decryptWithKey(encryptedPayload, this.primaryKey);
    } catch (primaryError) {
      // If no previous key, re-throw immediately
      if (!this.previousKey) {
        throw primaryError;
      }

      // Try previous key (dual-key fallback)
      try {
        return this.decryptWithKey(encryptedPayload, this.previousKey);
      } catch {
        // Both keys failed — throw the primary error for clarity
        throw new Error(
          'Decryption failed with both primary and previous vault keys. ' +
          'Credential may be corrupted or encrypted with an unknown key.',
        );
      }
    }
  }

  /**
   * Check if a credential was encrypted with the previous key.
   * Used during key rotation to identify credentials that need re-encryption.
   */
  isEncryptedWithPreviousKey(encryptedPayload: string): boolean {
    if (!this.previousKey) return false;

    try {
      this.decryptWithKey(encryptedPayload, this.primaryKey);
      return false; // Decrypted with primary → not old key
    } catch {
      try {
        this.decryptWithKey(encryptedPayload, this.previousKey);
        return true; // Decrypted with previous → needs rotation
      } catch {
        return false; // Neither key works → corrupted
      }
    }
  }

  /**
   * Re-encrypt a credential from old key to current primary key.
   * Used during key rotation.
   */
  reEncrypt(encryptedPayload: string): string {
    const plaintext = this.decrypt(encryptedPayload);
    return this.encrypt(plaintext);
  }

  /**
   * Constant-time comparison of two encrypted payloads.
   * Prevents timing attacks when comparing credentials.
   */
  payloadsEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');

    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  /**
   * Check if the vault has a previous key configured (rotation mode).
   */
  get hasPreviousKey(): boolean {
    return this.previousKey !== null;
  }

  // --- Private helpers ---

  private validatePayloadFormat(payload: string): void {
    if (!payload || typeof payload !== 'string') {
      throw new Error('Encrypted payload must be a non-empty string');
    }

    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error(
        'Invalid encrypted payload format: expected iv:authTag:ciphertext (3 colon-separated hex segments)',
      );
    }

    const [ivHex, authTagHex] = parts;
    if (ivHex.length !== IV_LENGTH * 2) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH * 2} hex chars, got ${ivHex.length}`);
    }
    if (authTagHex.length !== 32) {
      throw new Error(`Invalid authTag length: expected 32 hex chars, got ${authTagHex.length}`);
    }
  }

  private decryptWithKey(encryptedPayload: string, key: Buffer): string {
    const [ivHex, authTagHex, ciphertext] = encryptedPayload.split(':');

    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// --- Legacy function exports for backward compatibility ---

/**
 * @deprecated Use VaultService.encrypt() instead. Kept for T3 backward compatibility.
 */
export function encryptCredential(plaintext: string, vaultKey: string): string {
  const service = new VaultService(vaultKey);
  return service.encrypt(plaintext);
}

/**
 * @deprecated Use VaultService.decrypt() instead. Kept for T3 backward compatibility.
 */
export function decryptCredential(encryptedPayload: string, vaultKey: string): string {
  const service = new VaultService(vaultKey);
  return service.decrypt(encryptedPayload);
}
