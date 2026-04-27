import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import type { Workspace } from "@/lib/domain/workspace";

export interface WorkspaceUsage {
  memberCount: number;
  feedbackCreatedThisMonth: number;
}

/**
 * Returns current usage counts for a workspace. Used for limit checks and billing.
 * Pass a pre-fetched workspace to avoid an extra Firestore read.
 */
export async function getWorkspaceUsage(workspaceId: string, workspace?: Workspace): Promise<WorkspaceUsage | null> {
  const ws = workspace ?? await getWorkspace(workspaceId);
  if (!ws) return null;

  const memberCount = ws.usage?.members ?? 0;
  const feedbackCreatedThisMonth = ws.usage?.feedbackCreatedThisMonth ?? 0;

  return {
    memberCount,
    feedbackCreatedThisMonth,
  };
}
