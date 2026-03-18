import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";

const WORKSPACE_ID_CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const workspaceIdCache = new Map<string, { workspaceId: string; expiresAt: number }>();
const resolveWorkspaceIdInFlight = new Map<string, Promise<string>>();

/**
 * Resolves ONLY the workspaceId for a user.
 *
 * Strict boundary: does not load workspace documents and does not import any
 * billing/plan/entitlement modules.
 */
export async function resolveWorkspaceForUserLight(
  uid: string,
  req?: Request
): Promise<{ workspaceId: string }> {
  console.log("[WORKSPACE] called");
  const fromRequest = (req as unknown as { __workspaceId?: unknown } | undefined)?.__workspaceId;
  if (typeof fromRequest === "string" && fromRequest.length > 0) {
    console.log("[WORKSPACE] source:", "cache");
    return { workspaceId: fromRequest };
  }

  const now = Date.now();
  const entry = workspaceIdCache.get(uid);
  if (entry && now < entry.expiresAt) {
    console.log("[WORKSPACE] source:", "cache");
    if (req) (req as unknown as { __workspaceId?: string }).__workspaceId = entry.workspaceId;
    return { workspaceId: entry.workspaceId };
  }

  const pending = resolveWorkspaceIdInFlight.get(uid);
  if (pending) {
    console.log("[WORKSPACE] source:", "cache");
    const workspaceId = await pending;
    if (req) (req as unknown as { __workspaceId?: string }).__workspaceId = workspaceId;
    return { workspaceId };
  }

  const promise = (async () => {
    console.log("[WORKSPACE] source:", "firestore");
    const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
    workspaceIdCache.set(uid, {
      workspaceId,
      expiresAt: Date.now() + WORKSPACE_ID_CACHE_TTL_MS,
    });
    return workspaceId;
  })().finally(() => {
    resolveWorkspaceIdInFlight.delete(uid);
  });

  resolveWorkspaceIdInFlight.set(uid, promise);
  const workspaceId = await promise;
  if (req) (req as unknown as { __workspaceId?: string }).__workspaceId = workspaceId;
  return { workspaceId };
}

export function invalidateWorkspaceIdCache(uid?: string): void {
  if (uid !== undefined) {
    workspaceIdCache.delete(uid);
  } else {
    workspaceIdCache.clear();
  }
}

