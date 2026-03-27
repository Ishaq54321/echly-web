import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import type { Workspace } from "@/lib/domain/workspace";

export interface ResolvedWorkspace {
  workspaceId: string;
  workspace: Workspace | null;
}

/**
 * Invalidate workspace resolution cache. Call when user switches workspace or workspace is updated.
 * @param uid - If provided, clear only this user's entry. Otherwise clear entire cache.
 */
export function invalidateWorkspaceCache(uid?: string): void {
  void uid;
}

/**
 * Resolves ONLY the workspaceId for a user. This is a strict "light" variant intended
 * for routes that must not load workspace documents (and therefore must not touch any
 * billing/entitlement/usage code paths that other workspace resolution helpers might pull in).
 *
 * Always resolves directly from repository data.
 */
export async function resolveWorkspaceForUserLight(uid: string): Promise<{ workspaceId: string }> {
  const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
  return { workspaceId };
}

/**
 * Resolves the workspace for a user: gets workspace ID (user's linked workspace or uid as fallback),
 * loads the workspace, and asserts it is not suspended.
 * Always resolves directly from repository data.
 */
export async function resolveWorkspaceForUser(uid: string): Promise<ResolvedWorkspace> {
  const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
  const workspace = await getWorkspace(workspaceId);
  assertWorkspaceActive(workspace);
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
