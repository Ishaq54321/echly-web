import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

/**
 * Sets the user's workspace-related Firebase custom claims.
 * - workspaceId: currently active workspace (single string)
 * - workspaceIds: every workspace the user is a member of (array)
 *
 * Both must stay in sync with users/{uid}.workspaceMemberships[].
 * Rules check `wid in token.workspaceIds` for membership.
 * Routes read token.workspaceId for "active workspace" context.
 */
export async function setWorkspaceClaims(
  uid: string,
  activeWorkspaceId: string | null,
  workspaceMemberships: string[],
): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, {
    workspaceId: activeWorkspaceId,
    workspaceIds: workspaceMemberships,
  });
}
