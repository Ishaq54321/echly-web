import "server-only";
import { getUserWorkspaceIdRepo, invalidateUserWorkspaceIdCache } from "@/lib/repositories/usersRepository.server";
import { getWorkspace, invalidateWorkspaceDocCache } from "@/lib/repositories/workspacesRepository.server";
import { getWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { AuthorizationError } from "@/lib/server/auth/authorize";

/**
 * Thrown when the user's active workspace exists but the user is no longer
 * a member of it (removed by admin, workspace deleted, etc.). The dashboard
 * fetch wrapper intercepts this and signs the user out.
 */
export class WorkspaceAccessRevokedError extends AuthorizationError {
  constructor() {
    super("WORKSPACE_ACCESS_REVOKED", 403, "FORBIDDEN");
  }
}

type RequestWithWorkspace = Request & { __workspaceId?: string };

function getWorkspaceIdFromRequest(req?: Request): string | null {
  const value = (req as RequestWithWorkspace | undefined)?.__workspaceId;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function setWorkspaceIdOnRequest(req: Request | undefined, workspaceId: string): void {
  if (!req) return;
  (req as RequestWithWorkspace).__workspaceId = workspaceId;
}

/**
 * Resolve workspace id for a user and keep request-local cache for the current route.
 */
export async function resolveWorkspaceForUserLight(
  uid: string,
  req?: Request
): Promise<{ workspaceId: string }> {
  const cached = getWorkspaceIdFromRequest(req);
  if (cached) return { workspaceId: cached };

  const workspaceId = (await getUserWorkspaceIdRepo(uid)).trim();
  if (!workspaceId) {
    throw new AuthorizationError("Missing workspaceId for user", 403, "FORBIDDEN");
  }

  setWorkspaceIdOnRequest(req, workspaceId);
  return { workspaceId };
}

/**
 * Resolve workspace and enforce suspension checks for server routes.
 * Also verifies that `uid` is still a member of the active workspace. If not,
 * throws WorkspaceAccessRevokedError so the dashboard signs the user out.
 */
export async function resolveWorkspaceForUser(
  uid: string,
  req?: Request
): Promise<{ workspaceId: string }> {
  const { workspaceId } = await resolveWorkspaceForUserLight(uid, req);
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    // Active workspace doc is gone — treat as revoked access.
    throw new WorkspaceAccessRevokedError();
  }
  assertWorkspaceActive(workspace);
  const member = await getWorkspaceMemberRepo(workspaceId, uid);
  if (!member) {
    throw new WorkspaceAccessRevokedError();
  }
  return { workspaceId };
}

export function invalidateWorkspaceCache(uid?: string): void {
  invalidateUserWorkspaceIdCache(uid);
  invalidateWorkspaceDocCache(uid);
}
