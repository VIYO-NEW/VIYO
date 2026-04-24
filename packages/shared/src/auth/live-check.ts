/**
 * Live Check Utility — PO Directive 2026-04-24
 *
 * For high-privilege actions (billing changes, member management, API key
 * rotation, workspace deletion), the JWT alone is not sufficient because
 * workspace membership could have been revoked after the JWT was issued.
 *
 * This module provides a `verifyWorkspaceMembership` function that performs
 * a real-time database lookup to confirm the user still has the required
 * role in the target workspace.
 *
 * Usage in Hono route handlers:
 *   const check = await verifyWorkspaceMembership(serviceClient, userId, workspaceId, ['owner', 'admin']);
 *   if (!check.valid) return c.json({ error: check.reason }, 403);
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceMemberRole } from '../types/workspace.js';

/** Roles ordered by privilege level (highest first) */
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export interface LiveCheckResult {
  /** Whether the user passes the live membership check */
  valid: boolean;
  /** The user's current role (null if no membership found) */
  currentRole: WorkspaceMemberRole | null;
  /** Human-readable reason if check fails */
  reason: string;
}

/**
 * Perform a real-time database check to verify that a user still holds
 * the required role in a workspace. This bypasses JWT claims and queries
 * the workspace_members table directly using a service_role client.
 *
 * @param serviceClient - Supabase client with service_role privileges (bypasses RLS)
 * @param userId - The user's auth.uid()
 * @param workspaceId - The target workspace UUID
 * @param requiredRoles - Array of roles that satisfy the check (e.g., ['owner', 'admin'])
 * @returns LiveCheckResult indicating pass/fail with reason
 */
export async function verifyWorkspaceMembership(
  serviceClient: SupabaseClient,
  userId: string,
  workspaceId: string,
  requiredRoles: WorkspaceMemberRole[],
): Promise<LiveCheckResult> {
  // Query workspace_members for the user's current role
  const { data: membership, error } = await serviceClient
    .from('workspace_members')
    .select('role')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .limit(1)
    .single();

  if (error || !membership) {
    return {
      valid: false,
      currentRole: null,
      reason: 'User is not a member of this workspace. Membership may have been revoked.',
    };
  }

  const currentRole = membership.role as WorkspaceMemberRole;

  // Check if the user's current role is in the required roles list
  const hasRequiredRole = requiredRoles.includes(currentRole);

  if (!hasRequiredRole) {
    const requiredStr = requiredRoles.join(' or ');
    return {
      valid: false,
      currentRole,
      reason: `Action requires ${requiredStr} role, but user has ${currentRole} role.`,
    };
  }

  return {
    valid: true,
    currentRole,
    reason: 'Live check passed.',
  };
}

/**
 * Check if a role meets a minimum privilege level.
 * Useful for "at least admin" type checks without listing all qualifying roles.
 *
 * @param currentRole - The user's current role
 * @param minimumRole - The minimum required role
 * @returns true if currentRole >= minimumRole in the hierarchy
 */
export function meetsMinimumRole(
  currentRole: WorkspaceMemberRole,
  minimumRole: WorkspaceMemberRole,
): boolean {
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minimumRole] ?? 0);
}

/**
 * Convenience: verify membership with a minimum role threshold.
 * Equivalent to verifyWorkspaceMembership with all roles >= minimumRole.
 */
export async function verifyMinimumRole(
  serviceClient: SupabaseClient,
  userId: string,
  workspaceId: string,
  minimumRole: WorkspaceMemberRole,
): Promise<LiveCheckResult> {
  const qualifyingRoles = (Object.entries(ROLE_HIERARCHY) as [WorkspaceMemberRole, number][])
    .filter(([, level]) => level >= (ROLE_HIERARCHY[minimumRole] ?? 0))
    .map(([role]) => role);

  return verifyWorkspaceMembership(serviceClient, userId, workspaceId, qualifyingRoles);
}
