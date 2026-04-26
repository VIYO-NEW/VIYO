/**
 * node-crypto-stub — Browser stub for node:crypto
 *
 * GAP-0003 WORKAROUND: The @viyo/shared barrel exports server-only modules
 * (api-keys.js, vault.js) that import node:crypto. These are never called
 * at runtime in the browser, but Rollup fails to tree-shake them because
 * they contain side-effect-looking named imports (randomBytes, createHash).
 *
 * This stub provides no-op exports so Rollup can resolve the imports without
 * error. If any code actually calls these at runtime, it will throw a clear
 * error instead of silently failing.
 *
 * PROPER FIX: Split @viyo/shared into browser-safe and server-only subpath
 * exports (tracked as GAP-0003 in docs/internal/open-questions.md).
 */

function notAvailable(name: string): never {
  throw new Error(
    `[VIYO] ${name}() is not available in the browser. ` +
    `This function is server-only. If you see this error, a server-only ` +
    `module from @viyo/shared was accidentally called in the browser context.`
  );
}

export function randomBytes(): never {
  return notAvailable('randomBytes');
}

export function createHash(): never {
  return notAvailable('createHash');
}

export function createHmac(): never {
  return notAvailable('createHmac');
}

export function createCipheriv(): never {
  return notAvailable('createCipheriv');
}

export function createDecipheriv(): never {
  return notAvailable('createDecipheriv');
}

export function scrypt(): never {
  return notAvailable('scrypt');
}

export function scryptSync(): never {
  return notAvailable('scryptSync');
}

export function pbkdf2(): never {
  return notAvailable('pbkdf2');
}

export function pbkdf2Sync(): never {
  return notAvailable('pbkdf2Sync');
}

export function timingSafeEqual(): never {
  return notAvailable('timingSafeEqual');
}
