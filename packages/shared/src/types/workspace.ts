import { z } from 'zod';

/**
 * Workspace — primary tenant entity in VIYO.
 * All data (campaigns, flows, credits) is scoped to a workspace_id.
 * Authority: ARCH_LOCK_V3 §1, R20
 */
export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

/**
 * Brand — child entity of a workspace.
 * One workspace may manage multiple brands.
 * Authority: ARCH_LOCK_V3 §1, R20
 */
export const BrandSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  vertical: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Brand = z.infer<typeof BrandSchema>;

/**
 * WorkspaceMember — join table linking users to workspaces with roles.
 * Authority: R22
 */
export const WorkspaceMemberRoleSchema = z.enum(['owner', 'admin', 'editor', 'viewer']);
export type WorkspaceMemberRole = z.infer<typeof WorkspaceMemberRoleSchema>;

export const WorkspaceMemberSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: WorkspaceMemberRoleSchema,
  created_at: z.string().datetime(),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
