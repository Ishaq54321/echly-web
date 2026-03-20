const WORKSPACE_TTL = 5 * 60 * 1000; // 5 minutes

type WorkspaceCacheEntry = {
  workspace: any;
  cachedAt: number;
};

// Module-level in-memory cache shared across requests.
const workspaceCache = new Map<string, WorkspaceCacheEntry>();

export async function getCachedWorkspace(
  workspaceId: string,
  fetcher: () => Promise<any>
): Promise<any> {
  const now = Date.now();
  const hit = workspaceCache.get(workspaceId);

  if (hit && now - hit.cachedAt < WORKSPACE_TTL) {
    return hit.workspace;
  }

  const workspace = await fetcher();

  workspaceCache.set(workspaceId, {
    workspace,
    cachedAt: now,
  });

  return workspace;
}

