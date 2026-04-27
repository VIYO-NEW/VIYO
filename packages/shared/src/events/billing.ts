/**
 * Billing Event Schemas — T9 Master Spec §3, §8, §12
 *
 * Type-safe event definitions for billing lifecycle events.
 * These events drive Inngest functions for auto-top-up, dunning,
 * free tier renewal, and workspace deletion.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER, R18 §4
 */
import { z } from 'zod';

/**
 * viyo/billing.tokens.low — fired when a workspace balance drops below threshold.
 * Triggers auto-top-up if enabled, or low-balance notification email.
 */
export const billingTokensLowSchema = z.object({
  name: z.literal('viyo/billing.tokens.low'),
  data: z.object({
    workspaceId: z.string().uuid(),
    currentBalance: z.number(),
    threshold: z.number(),
  }),
});

/**
 * viyo/billing.subscription.changed — fired when a subscription tier changes.
 * Triggers token grant adjustment and notification email.
 */
export const billingSubscriptionChangedSchema = z.object({
  name: z.literal('viyo/billing.subscription.changed'),
  data: z.object({
    workspaceId: z.string().uuid(),
    oldTier: z.enum(['free', 'starter', 'growth', 'agency']),
    newTier: z.enum(['free', 'starter', 'growth', 'agency']),
    stripeSubscriptionId: z.string(),
  }),
});

/**
 * viyo/billing.payment.failed — fired when a payment fails.
 * Triggers dunning flow: retry notifications, eventual freeze.
 */
export const billingPaymentFailedSchema = z.object({
  name: z.literal('viyo/billing.payment.failed'),
  data: z.object({
    workspaceId: z.string().uuid(),
    stripeInvoiceId: z.string(),
    amountDue: z.number(),
    attemptCount: z.number(),
  }),
});

/**
 * viyo/billing.free_tier.renewal — fired by monthly cron.
 * Grants up to 1M tokens to free workspaces, capped at 2M.
 */
export const billingFreeTierRenewalSchema = z.object({
  name: z.literal('viyo/billing.free_tier.renewal'),
  data: z.object({
    workspaceId: z.string().uuid(),
    tokensGranted: z.number(),
    newBalance: z.number(),
  }),
});

/**
 * viyo/billing.workspace.hard_delete — fired 30 days after soft delete.
 * Triggers GDPR data purge and Stripe customer deletion.
 */
export const billingWorkspaceHardDeleteSchema = z.object({
  name: z.literal('viyo/billing.workspace.hard_delete'),
  data: z.object({
    workspaceId: z.string().uuid(),
    deletedAt: z.string().datetime(),
  }),
});

export type BillingTokensLowEvent = z.infer<typeof billingTokensLowSchema>;
export type BillingSubscriptionChangedEvent = z.infer<typeof billingSubscriptionChangedSchema>;
export type BillingPaymentFailedEvent = z.infer<typeof billingPaymentFailedSchema>;
export type BillingFreeTierRenewalEvent = z.infer<typeof billingFreeTierRenewalSchema>;
export type BillingWorkspaceHardDeleteEvent = z.infer<typeof billingWorkspaceHardDeleteSchema>;
