/**
 * Billing API Schemas — T9 Master Spec §4, §5, §8, §13, §14, §18
 *
 * Zod schemas for all billing-related API request/response validation.
 * Used by both the worker (server-side validation) and frontend (form validation).
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER
 */
import { z } from 'zod';

/* ──────────────────────────────────────────────
 * Shared enums
 * ────────────────────────────────────────────── */
export const subscriptionTierSchema = z.enum(['free', 'starter', 'growth', 'agency']);
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;

export const subscriptionStatusSchema = z.enum(['free', 'active', 'past_due', 'canceled', 'trialing']);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const billingIntervalSchema = z.enum(['monthly', 'annual']);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

export const topUpPackSchema = z.enum(['small', 'medium', 'large', 'xl']);
export type TopUpPack = z.infer<typeof topUpPackSchema>;

/* ──────────────────────────────────────────────
 * Checkout / Subscription
 * ────────────────────────────────────────────── */
export const createCheckoutSchema = z.object({
  tier: subscriptionTierSchema.exclude(['free']),
  interval: billingIntervalSchema,
  promoCode: z.string().optional(),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const switchIntervalSchema = z.object({
  newInterval: billingIntervalSchema,
});
export type SwitchIntervalInput = z.infer<typeof switchIntervalSchema>;

export const changeTierSchema = z.object({
  newTier: subscriptionTierSchema,
});
export type ChangeTierInput = z.infer<typeof changeTierSchema>;

export const previewChangeSchema = z.object({
  newTier: subscriptionTierSchema.optional(),
  newInterval: billingIntervalSchema.optional(),
});
export type PreviewChangeInput = z.infer<typeof previewChangeSchema>;

/* ──────────────────────────────────────────────
 * Top-Up
 * ────────────────────────────────────────────── */
export const createTopUpSchema = z.object({
  pack: topUpPackSchema,
});
export type CreateTopUpInput = z.infer<typeof createTopUpSchema>;

export const autoTopUpSettingsSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().int().min(0).optional(),
  pack: topUpPackSchema.optional(),
});
export type AutoTopUpSettingsInput = z.infer<typeof autoTopUpSettingsSchema>;

/* ──────────────────────────────────────────────
 * Ledger / History
 * ────────────────────────────────────────────── */
export const ledgerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
});
export type LedgerQuery = z.infer<typeof ledgerQuerySchema>;

/* ──────────────────────────────────────────────
 * Promo Codes (Admin)
 * ────────────────────────────────────────────── */
export const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  stripeCouponId: z.string().optional(),
  tokenGrant: z.number().int().min(0).default(0),
  maxRedemptions: z.number().int().min(1).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;

export const redeemPromoCodeSchema = z.object({
  code: z.string().min(3).max(50),
});
export type RedeemPromoCodeInput = z.infer<typeof redeemPromoCodeSchema>;

/* ──────────────────────────────────────────────
 * Admin Economics
 * ────────────────────────────────────────────── */
export const updateSystemConfigSchema = z.object({
  value: z.unknown(),
  reason: z.string().min(5),
});
export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;

export const simulateMultiplierSchema = z.object({
  newMultiplier: z.number().int().min(1),
});
export type SimulateMultiplierInput = z.infer<typeof simulateMultiplierSchema>;

export const adminTokenAdjustmentSchema = z.object({
  workspaceId: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().min(5),
});
export type AdminTokenAdjustmentInput = z.infer<typeof adminTokenAdjustmentSchema>;

/* ──────────────────────────────────────────────
 * Workspace Deletion
 * ────────────────────────────────────────────── */
export const cancelWorkspaceDeletionSchema = z.object({
  workspaceId: z.string().uuid(),
});
export type CancelWorkspaceDeletionInput = z.infer<typeof cancelWorkspaceDeletionSchema>;
