import type { NextRequest } from "next/server";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { assertWorkspaceActive } from "@/lib/server/assertWorkspaceActive";
import { workspaceGuardErrorResponse } from "@/lib/server/workspaceGuardErrorResponse";
import {
  getWorkspaceMemberRepo,
  transferWorkspaceOwnershipRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  let body: { newOwnerUid?: unknown; confirmName?: unknown };
  try {
    body = (await req.json()) as { newOwnerUid?: unknown; confirmName?: unknown };
  } catch {
    return apiError({ code: "INVALID_INPUT", message: "Invalid JSON body", status: 400 });
  }

  if (typeof body.newOwnerUid !== "string" || !body.newOwnerUid.trim()) {
    return apiError({ code: "INVALID_INPUT", message: "newOwnerUid is required", status: 400 });
  }
  const newOwnerUid = body.newOwnerUid.trim();

  if (newOwnerUid === user.uid) {
    return apiError({ code: "INVALID_INPUT", message: "ALREADY_OWNER", status: 400 });
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    if (!workspace) {
      return apiError({ code: "NOT_FOUND", message: "Workspace not found", status: 404 });
    }

    const callerMember = await getWorkspaceMemberRepo(workspaceId, user.uid);
    if (callerMember?.role !== "OWNER") {
      return apiError({ code: "FORBIDDEN", message: "Only the workspace owner can transfer ownership", status: 403 });
    }

    // Verify confirmation name matches exactly
    if (typeof body.confirmName !== "string" || body.confirmName !== workspace.name) {
      return apiError({ code: "INVALID_INPUT", message: "Workspace name confirmation does not match", status: 400 });
    }

    const newOwnerMember = await getWorkspaceMemberRepo(workspaceId, newOwnerUid);
    if (!newOwnerMember) {
      return apiError({ code: "NOT_FOUND", message: "NOT_A_MEMBER", status: 404 });
    }

    await transferWorkspaceOwnershipRepo(workspaceId, user.uid, newOwnerUid);

    // Refresh claims for both users (memberships unchanged on transfer, but
    // we still re-issue so token shape stays consistent).
    const [callerSnap, newOwnerSnap] = await Promise.all([
      adminDb.collection("users").doc(user.uid).get(),
      adminDb.collection("users").doc(newOwnerUid).get(),
    ]);
    function readMemberships(snap: FirebaseFirestore.DocumentSnapshot, activeWid: string): string[] {
      const raw = snap.data()?.workspaceMemberships;
      const list: string[] = Array.isArray(raw)
        ? (raw as unknown[]).filter(
            (v): v is string => typeof v === "string" && v.trim() !== ""
          )
        : [];
      if (!list.includes(activeWid)) list.push(activeWid);
      return list;
    }
    await Promise.allSettled([
      setWorkspaceClaims(user.uid, workspaceId, readMemberships(callerSnap, workspaceId)),
      setWorkspaceClaims(newOwnerUid, workspaceId, readMemberships(newOwnerSnap, workspaceId)),
    ]);

    return apiSuccess({ success: true });
  } catch (err) {
    const guardResponse = workspaceGuardErrorResponse(err);
    if (guardResponse) return guardResponse;

    console.error("PATCH /api/workspace/ownership:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to transfer ownership", status: 500 });
  }
}
