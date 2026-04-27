/**
 * Stripe Client Singleton — T9 Master Spec §1
 *
 * Lazy-initialized Stripe SDK client.
 * Requires STRIPE_SECRET_KEY environment variable.
 * Returns null if not configured (non-billing routes still work).
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §1
 */
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe client singleton.
 * Returns null if STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn('[VIYO] STRIPE_SECRET_KEY not set — billing routes will return 503');
    return null;
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    appInfo: {
      name: 'viyo-worker',
      version: '0.1.0',
    },
  });

  return stripeInstance;
}

/**
 * Require Stripe or throw 503.
 */
export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe not available. STRIPE_SECRET_KEY is not configured.');
  }
  return stripe;
}
