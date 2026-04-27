/**
 * Workspace Event Schemas — R18 §4, ADR-019, T9
 *
 * Type-safe event definitions for workspace lifecycle events.
 * These schemas are consumed by the Inngest client type parameter
 * and validated at runtime via Zod.
 *
 * Event naming convention: viyo/<domain>.<action>
 * Authority: R18 §4, ARCH_LOCK_V3 §3, T9 Master Spec §2
 */
import { z } from 'zod';

/**
 * viyo/workspace.created — fired after a new workspace row is inserted.
 * Triggers the provisioning pipeline: Stripe customer, token balance, welcome email.
 */
export const workspaceCreatedSchema = z.object({
  name: z.literal('viyo/workspace.created'),
  data: z.object({
    workspaceId: z.string().uuid(),
    workspaceName: z.string().min(1),
    ownerId: z.string().uuid(),
    ownerEmail: z.string().email(),
    subscriptionTier: z.enum(['free', 'starter', 'growth', 'agency']).default('free'),
    createdAt: z.string().datetime(),
  }),
});

/**
 * viyo/workspace.updated — fired after workspace settings change.
 */
export const workspaceUpdatedSchema = z.object({
  name: z.literal('viyo/workspace.updated'),
  data: z.object({
    workspaceId: z.string().uuid(),
    changes: z.record(z.unknown()),
    updatedBy: z.string().uuid(),
  }),
});

/**
 * viyo/workspace.deleted — fired when a workspace is soft-deleted.
 * Triggers 30-day deletion countdown, Stripe cancellation, team notification.
 */
export const workspaceDeletedSchema = z.object({
  name: z.literal('viyo/workspace.deleted'),
  data: z.object({
    workspaceId: z.string().uuid(),
    deletedBy: z.string().uuid(),
    deletedAt: z.string().datetime(),
  }),
});

export type WorkspaceCreatedEvent = z.infer<typeof workspaceCreatedSchema>;
export type WorkspaceUpdatedEvent = z.infer<typeof workspaceUpdatedSchema>;
export type WorkspaceDeletedEvent = z.infer<typeof workspaceDeletedSchema>;
