import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";

export interface WorkspaceUsage {
  sessionCount: number;
  memberCount: number;
}

/**
 * Returns current usage counts for a workspace. Used for limit checks and billing.
 */
export async function getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage | null> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const sessionCount = await getWorkspaceSessionCountRepo(workspaceId, workspace);
  const memberCount = Array.isArray(workspace.members) ? workspace.members.length : 0;

  return {
    sessionCount,
    memberCount,
  };
}
