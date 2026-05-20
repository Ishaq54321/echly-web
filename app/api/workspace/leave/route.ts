import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  removeWorkspaceMemberRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { repointWorkspaceClaim } from "@/lib/server/repointWorkspaceClaim";

export const dynamic = "force-dynamic";

/**
 * POST /api/workspace/leave
 *
 * Allows a non-owner member to voluntarily leave their active workspace.
 *
 * Behavior:
 * - Resolves the caller's active workspace via getUserWorkspaceIdRepo
 * - Blocks OWNER role with OWNER_MUST_TRANSFER_FIRST (owners must transfer
 *   ownership or delete the workspace first)
 * - Removes the membership (cascades sessionAccess + per-session member mirrors
 *   via removeWorkspaceMemberRepo)
 * - Repoints users/{uid}.workspaceId + custom claims to a remaining workspace
 *   or clears them if none remain
 * - Returns { leftWorkspaceId, newActiveWorkspaceId }
 *
 * Seats: Notion-style — usage.members decrements (via removeWorkspaceMemberRepo)
 * but billing.seats / Stripe quantity do NOT change. Consistent with admin
 * member-removal at [uid]/route.ts.
 *
 * Suspended workspaces are allowed via assertWorkspaceActive({ allowSuspended: true })
 * — members shouldn't be trapped if billing is broken.
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      return apiError({
        code: "NOT_FOUND",
        message: "Workspace not found",
        status: 404,
      });
    }
    // Allow leaving suspended workspaces — the member shouldn't be trapped if
    // billing is broken. Deleted workspaces still throw (which becomes 410).
    assertWorkspaceActive(workspace, { allowSuspended: true });

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (!callerMember) {
      return apiError({
        code: "FORBIDDEN",
        message: "NOT_A_MEMBER",
        status: 403,
      });
    }

    // Owners cannot leave — must transfer ownership or delete the workspace.
    if (callerMember.role === "OWNER") {
      return apiError({
        code: "INVALID_INPUT",
        message: "OWNER_MUST_TRANSFER_FIRST",
        status: 400,
      });
    }

    // Remove membership. Cascades sessionAccess + sessions/{sid}/members/{uid}
    // mirrors and arrayRemove's workspaceId from users/{uid}.workspaceMemberships.
    // Notion-style: usage.members decrements but billing.seats does NOT.
    await removeWorkspaceMemberRepo(workspaceId, user.uid);

    // Repoint claims to a remaining workspace or clear. Errors here are
    // non-fatal: removal already succeeded; stale claim expires naturally and
    // server-side resolution rejects the removed workspace.
    let newActiveWorkspaceId: string | null = null;
    try {
      newActiveWorkspaceId = await repointWorkspaceClaim(user.uid, workspaceId);
    } catch (claimErr) {
      console.error(
        `[workspace/leave] failed to repoint/clear claims for ${user.uid}:`,
        claimErr
      );
    }

    return apiSuccess({
      leftWorkspaceId: workspaceId,
      newActiveWorkspaceId,
    });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("POST /api/workspace/leave:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to leave workspace",
      status: 500,
    });
  }
}
