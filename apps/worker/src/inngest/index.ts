/**
 * Inngest Function Registry — R18 §4, Doc4 §2.1, T9
 *
 * Central barrel export of all Inngest functions.
 * The `allFunctions` array is passed to the Inngest serve() handler
 * in index.ts to register all functions with Inngest Cloud.
 *
 * When adding a new Inngest function:
 * 1. Create the function in ./functions/<name>.ts or ./billing.ts
 * 2. Import and add it to the allFunctions array below
 *
 * Authority: R18 §4, Doc4 §2.1, ARCH_LOCK_V3 §3, T9 Master Spec
 */
import { workspaceProvisioning } from './functions/workspace-provisioning.js';
import { billingFunctions } from './billing.js';

/**
 * All Inngest functions registered with the serve handler.
 * Order does not matter — Inngest routes by event name.
 */
export const allFunctions = [
  workspaceProvisioning,
  ...billingFunctions,
];

export { inngest } from './client.js';
export { workspaceProvisioning };
