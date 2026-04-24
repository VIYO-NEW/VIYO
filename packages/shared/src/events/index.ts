/**
 * Event Type Registry — ADR-019
 *
 * Central barrel export for all VIYO event schemas and types.
 * The ViyoEvents type map is consumed by the Inngest client
 * to provide compile-time type safety for event names and payloads.
 *
 * Authority: R18 §4, ARCH_LOCK_V3 §3
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

/**
 * ViyoEvents — Inngest event type map.
 *
 * Pass this as the generic parameter to `new Inngest<ViyoEvents>()`
 * to get compile-time type checking on event names and payloads.
 *
 * Usage:
 * ```ts
 * import type { ViyoEvents } from '@viyo/shared';
 * const inngest = new Inngest({ id: 'viyo-worker', schemas: new EventSchemas().fromRecord<ViyoEvents>() });
 * ```
 */
export type ViyoEvents = {
  'viyo/workspace.created': {
    data: {
      workspaceId: string;
      workspaceName: string;
      ownerId: string;
      subscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise';
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
};
