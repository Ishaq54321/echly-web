import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

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
  const fromRequest = (req as unknown as { __workspaceId?: unknown } | undefined)?.__workspaceId;
  if (typeof fromRequest === "string" && fromRequest.length > 0) {
    return { workspaceId: fromRequest };
  }

  const workspaceId = (await getUserWorkspaceIdRepo(uid)) ?? uid;
  if (req) (req as unknown as { __workspaceId?: string }).__workspaceId = workspaceId;
  return { workspaceId };
}

export function invalidateWorkspaceIdCache(uid?: string): void {
  void uid;
}

