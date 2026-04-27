import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";

export interface WorkspaceUsage {
  memberCount: number;
  feedbackCreatedThisMonth: number;
}

/**
 * Returns current usage counts for a workspace. Used for limit checks and billing.
 */
export async function getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage | null> {
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) return null;

  const memberCount = workspace.usage?.members ?? 0;
  const feedbackCreatedThisMonth = workspace.usage?.feedbackCreatedThisMonth ?? 0;

  return {
    memberCount,
    feedbackCreatedThisMonth,
  };
}
