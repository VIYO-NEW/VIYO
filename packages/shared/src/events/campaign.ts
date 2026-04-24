/**
 * Campaign Event Schemas — R18 §4, §8
 *
 * Type-safe event definitions for campaign lifecycle events.
 * These are stubs for future implementation — the schemas are
 * complete and type-safe, but no Inngest functions consume them yet.
 *
 * Authority: R18 §4, R18 §8.1
 */
import { z } from 'zod';

/**
 * viyo/campaign.created — fired when a new campaign is created.
 */
export const campaignCreatedSchema = z.object({
  name: z.literal('viyo/campaign.created'),
  data: z.object({
    campaignId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    campaignName: z.string().min(1),
    createdBy: z.string().uuid(),
  }),
});

/**
 * viyo/campaign.concepts.requested — triggers the CMO Brain concept generation.
 * R18 §8.1: campaign.concepts.requested → generateConceptsJob
 */
export const campaignConceptsRequestedSchema = z.object({
  name: z.literal('viyo/campaign.concepts.requested'),
  data: z.object({
    campaignId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    brief: z.string().min(1),
    requestedBy: z.string().uuid(),
  }),
});

export type CampaignCreatedEvent = z.infer<typeof campaignCreatedSchema>;
export type CampaignConceptsRequestedEvent = z.infer<typeof campaignConceptsRequestedSchema>;
