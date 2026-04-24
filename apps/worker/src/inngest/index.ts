/**
 * Inngest Function Registry — R18 §4, Doc4 §2.1
 *
 * Central barrel export of all Inngest functions.
 * The `allFunctions` array is passed to the Inngest serve() handler
 * in index.ts to register all functions with Inngest Cloud.
 *
 * When adding a new Inngest function:
 * 1. Create the function in ./functions/<name>.ts
 * 2. Import and add it to the allFunctions array below
 *
 * Authority: R18 §4, Doc4 §2.1, ARCH_LOCK_V3 §3
 */
import { workspaceProvisioning } from './functions/workspace-provisioning.js';

/**
 * All Inngest functions registered with the serve handler.
 * Order does not matter — Inngest routes by event name.
 */
export const allFunctions = [
  workspaceProvisioning,
];

export { inngest } from './client.js';
export { workspaceProvisioning };
