/**
 * Asset Event Schemas — R18 §4, §8.2
 *
 * Type-safe event definitions for asset generation events.
 * These are stubs for future implementation — the schemas are
 * complete and type-safe, but no Inngest functions consume them yet.
 *
 * Authority: R18 §4, R18 §8.2, R24
 */
import { z } from 'zod';

/**
 * viyo/asset.image.requested — triggers the Multi-Model Image Pipeline.
 * R18 §8.2: asset.image.requested → generateImageJob
 */
export const assetImageRequestedSchema = z.object({
  name: z.literal('viyo/asset.image.requested'),
  data: z.object({
    assetId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    brief: z.string().min(1),
    style: z.enum(['product', 'lifestyle', 'abstract', 'custom']).optional(),
    requestedBy: z.string().uuid(),
  }),
});

export type AssetImageRequestedEvent = z.infer<typeof assetImageRequestedSchema>;
