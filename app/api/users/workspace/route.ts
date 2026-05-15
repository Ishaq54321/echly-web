import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { corsHeaders } from "@/lib/server/cors";

export const dynamic = "force-dynamic";

function unauthorizedResponse(req: NextRequest, errRes: Response): NextResponse {
  return new NextResponse(errRes.body, {
    status: errRes.status,
    statusText: errRes.statusText,
    headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
  });
}

/** PATCH /api/users/workspace — switch the user's active workspace. */
export async function PATCH(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return unauthorizedResponse(req, toAuthorizationResponse(err));
  }

  let body: { workspaceId?: unknown };
  try {
    body = (await req.json()) as { workspaceId?: unknown };
  } catch {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid JSON body",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const newWorkspaceId =
    typeof body?.workspaceId === "string" ? body.workspaceId.trim() : "";

  if (!newWorkspaceId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "workspaceId is required",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const membership = await getWorkspaceMemberRepo(newWorkspaceId, user.uid);

  if (!membership) {
    return apiError({
      code: "FORBIDDEN",
      message: "You are not a member of this workspace",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    await adminDb.doc(`users/${user.uid}`).update({
      workspaceId: newWorkspaceId,
      updatedAt: new Date(),
    });

    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const memberships: string[] = Array.isArray(userDoc.data()?.workspaceMemberships)
      ? (userDoc.data()!.workspaceMemberships as unknown[]).filter(
          (v): v is string => typeof v === "string" && v.trim() !== ""
        )
      : [];
    await setWorkspaceClaims(user.uid, newWorkspaceId, memberships);

    return apiSuccess({ workspaceId: newWorkspaceId }, null, {
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error("PATCH /api/users/workspace:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to update workspace",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
