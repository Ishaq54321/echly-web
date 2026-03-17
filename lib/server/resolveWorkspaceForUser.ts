import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import type { Workspace } from "@/lib/domain/workspace";

export interface ResolvedWorkspace {
  workspaceId: string;
  workspace: Workspace | null;
}

/**
 * Resolves the workspace for a user: gets workspace ID (user's linked workspace or uid as fallback),
 * loads the workspace, and asserts it is not suspended.
 * Use in product API routes to avoid repeating getUserWorkspaceIdRepo → getWorkspace → assertWorkspaceActive.
 */
export async function resolveWorkspaceForUser(uid: string): Promise<ResolvedWorkspace> {
  const t_resolve_start = performance.now();
  const t_get_user_ws_start = performance.now();
  const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
  console.log("[ECHLY PERF] resolveWorkspaceForUser.getUserWorkspaceIdRepo:", performance.now() - t_get_user_ws_start);
  const t_get_workspace_start = performance.now();
  const workspace = await getWorkspace(workspaceId);
  console.log("[ECHLY PERF] resolveWorkspaceForUser.getWorkspace:", performance.now() - t_get_workspace_start);
  assertWorkspaceActive(workspace);
  console.log("[ECHLY PERF] resolveWorkspaceForUser TOTAL:", performance.now() - t_resolve_start);
  return { workspaceId, workspace };
}

/**
 * Loads a workspace by ID and asserts it is not suspended.
 * Use when workspaceId comes from session/context (e.g. session.workspaceId) to avoid duplicate getWorkspace + assert in one request.
 */
export async function resolveWorkspaceById(workspaceId: string): Promise<{ workspace: Workspace | null }> {
  const workspace = await getWorkspace(workspaceId);
  assertWorkspaceActive(workspace);
  return { workspace };
}
