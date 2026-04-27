/**
 * Stripe Webhook Signature Verification Middleware — T9 Master Spec §5
 *
 * Verifies the Stripe-Signature header using the webhook signing secret.
 * This middleware bypasses auth (like Inngest) and is applied only to
 * the /api/v1/billing/webhook route.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §5
 */
import type { Context, Next } from 'hono';
import { requireStripe } from '../lib/stripe.js';

/**
 * Verify Stripe webhook signature.
 * Sets c.set('stripeEvent', event) on success.
 */
export async function verifyStripeSignature(c: Context, next: Next): Promise<Response | void> {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json({ error: 'Missing Stripe-Signature header' }, 400);
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[VIYO] STRIPE_WEBHOOK_SECRET not configured');
    return c.json({ error: 'Webhook secret not configured' }, 500);
  }

  const rawBody = await c.req.text();

  try {
    const stripe = requireStripe();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    c.set('stripeEvent', event);
    return next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[VIYO] Stripe signature verification failed: ${message}`);
    return c.json({ error: 'Invalid signature', message }, 400);
  }
}
