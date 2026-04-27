/**
 * Event Type Registry — ADR-019, T9
 *
 * Central barrel export for all VIYO event schemas and types.
 * The ViyoEvents type map is consumed by the Inngest client
 * to provide compile-time type safety for event names and payloads.
 *
 * Authority: R18 §4, ARCH_LOCK_V3 §3, T9 Master Spec
 */
export {
  workspaceCreatedSchema,
  workspaceUpdatedSchema,
  workspaceDeletedSchema,
  type WorkspaceCreatedEvent,
  type WorkspaceUpdatedEvent,
  type WorkspaceDeletedEvent,
} from './workspace.js';

export {
  campaignCreatedSchema,
  campaignConceptsRequestedSchema,
  type CampaignCreatedEvent,
  type CampaignConceptsRequestedEvent,
} from './campaign.js';

export {
  assetImageRequestedSchema,
  type AssetImageRequestedEvent,
} from './asset.js';

export {
  billingTokensLowSchema,
  billingSubscriptionChangedSchema,
  billingPaymentFailedSchema,
  billingFreeTierRenewalSchema,
  billingWorkspaceHardDeleteSchema,
  type BillingTokensLowEvent,
  type BillingSubscriptionChangedEvent,
  type BillingPaymentFailedEvent,
  type BillingFreeTierRenewalEvent,
  type BillingWorkspaceHardDeleteEvent,
} from './billing.js';

/**
 * ViyoEvents — Inngest event type map.
 *
 * Pass this as the generic parameter to `new Inngest<ViyoEvents>()`
 * to get compile-time type checking on event names and payloads.
 */
export type ViyoEvents = {
  'viyo/workspace.created': {
    data: {
      workspaceId: string;
      workspaceName: string;
      ownerId: string;
      ownerEmail: string;
      subscriptionTier: 'free' | 'starter' | 'growth' | 'agency';
      createdAt: string;
    };
  };
  'viyo/workspace.updated': {
    data: {
      workspaceId: string;
      changes: Record<string, unknown>;
      updatedBy: string;
    };
  };
  'viyo/workspace.deleted': {
    data: {
      workspaceId: string;
      deletedBy: string;
      deletedAt: string;
    };
  };
  'viyo/campaign.created': {
    data: {
      campaignId: string;
      workspaceId: string;
      campaignName: string;
      createdBy: string;
    };
  };
  'viyo/campaign.concepts.requested': {
    data: {
      campaignId: string;
      workspaceId: string;
      brief: string;
      requestedBy: string;
    };
  };
  'viyo/asset.image.requested': {
    data: {
      assetId: string;
      workspaceId: string;
      brief: string;
      style?: 'product' | 'lifestyle' | 'abstract' | 'custom';
      requestedBy: string;
    };
  };
  'viyo/billing.tokens.low': {
    data: {
      workspaceId: string;
      currentBalance: number;
      threshold: number;
    };
  };
  'viyo/billing.subscription.changed': {
    data: {
      workspaceId: string;
      oldTier: 'free' | 'starter' | 'growth' | 'agency';
      newTier: 'free' | 'starter' | 'growth' | 'agency';
      stripeSubscriptionId: string;
    };
  };
  'viyo/billing.payment.failed': {
    data: {
      workspaceId: string;
      stripeInvoiceId: string;
      amountDue: number;
      attemptCount: number;
    };
  };
  'viyo/billing.free_tier.renewal': {
    data: {
      workspaceId: string;
      tokensGranted: number;
      newBalance: number;
    };
  };
  'viyo/billing.workspace.hard_delete': {
    data: {
      workspaceId: string;
      deletedAt: string;
    };
  };
};
