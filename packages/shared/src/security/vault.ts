/**
 * Vault Service — R22 §4, R29 Wiring
 * AES-256-GCM encryption for ESP credentials and other sensitive data.
 * The encryption key (VIYO_VAULT_KEY) is a 32-byte hex string stored in env.
 * Format: iv(24hex):authTag(32hex):ciphertext(hex)
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypt a plaintext credential for storage.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 * Throws if VIYO_VAULT_KEY is missing or malformed.
 */
export function encryptCredential(plaintext: string, vaultKey: string): string {
  const keyBuffer = Buffer.from(vaultKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error(
      `VIYO_VAULT_KEY must be exactly 32 bytes (64 hex chars), got ${keyBuffer.length} bytes`,
    );
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a previously encrypted credential.
 * Expects the colon-delimited format: iv:authTag:ciphertext.
 * Throws on invalid format, wrong key, or tampered data.
 */
export function decryptCredential(encryptedPayload: string, vaultKey: string): string {
  const keyBuffer = Buffer.from(vaultKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error(
      `VIYO_VAULT_KEY must be exactly 32 bytes (64 hex chars), got ${keyBuffer.length} bytes`,
    );
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format: expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
