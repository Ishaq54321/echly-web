import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import type { Workspace } from "@/lib/domain/workspace";

export interface ResolvedWorkspace {
  workspaceId: string;
  workspace: Workspace | null;
}

const WORKSPACE_CACHE_TTL_MS = 30_000; // 30 seconds
const workspaceCache = new Map<string, { data: ResolvedWorkspace; expiresAt: number }>();
const resolveInFlight = new Map<string, Promise<ResolvedWorkspace>>();

/**
 * Invalidate workspace resolution cache. Call when user switches workspace or workspace is updated.
 * @param uid - If provided, clear only this user's entry. Otherwise clear entire cache.
 */
export function invalidateWorkspaceCache(uid?: string): void {
  if (uid !== undefined) {
    workspaceCache.delete(uid);
  } else {
    workspaceCache.clear();
  }
}

/**
 * Resolves the workspace for a user: gets workspace ID (user's linked workspace or uid as fallback),
 * loads the workspace, and asserts it is not suspended.
 * Cached per uid with 30s TTL so resolveWorkspaceForUser is near-instant on cache hit (~10–50ms vs ~1200ms).
 */
export async function resolveWorkspaceForUser(uid: string): Promise<ResolvedWorkspace> {
  const now = Date.now();
  const entry = workspaceCache.get(uid);
  if (entry && now < entry.expiresAt) {
    console.log("[ECHLY CACHE] workspace hit");
    console.log("RESOLVED WORKSPACE:", {
      userId: uid,
      workspaceId: entry.data.workspaceId,
    });
    return entry.data;
  }
  console.log("[ECHLY CACHE] workspace miss");

  const pending = resolveInFlight.get(uid);
  if (pending) {
    return pending;
  }

  const doResolve = async (): Promise<ResolvedWorkspace> => {
    const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    const result: ResolvedWorkspace = { workspaceId, workspace };
    workspaceCache.set(uid, {
      data: result,
      expiresAt: Date.now() + WORKSPACE_CACHE_TTL_MS,
    });
    console.log("RESOLVED WORKSPACE:", {
      userId: uid,
      workspaceId,
    });
    return result;
  };

  const promise = doResolve().finally(() => {
    resolveInFlight.delete(uid);
  });
  resolveInFlight.set(uid, promise);
  return promise;
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
