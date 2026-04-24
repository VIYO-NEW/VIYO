/**
 * Security barrel export — R22, T8
 * VaultService, key rotation, memory scrubbing utilities.
 */
export {
  VaultService,
  encryptCredential,
  decryptCredential,
  scrubSensitiveData,
  SENSITIVE_FIELD_PATTERNS,
} from './vault.js';

export { rotateVaultKey } from './key-rotation.js';
export type { EncryptedRow, RotationResult } from './key-rotation.js';
