import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getSharedSessionMembershipsRepo } from "@/lib/repositories/sessionMembersRepository.server";

function withCors(req: NextRequest, res: Response): NextResponse {
  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: { ...Object.fromEntries(res.headers), ...corsHeaders(req) },
  });
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  try {
    const userSnap = await adminDb.doc(`users/${user.uid}`).get();
    const userData = (
      userSnap.exists ? (userSnap.data() ?? {}) : {}
    ) as Record<string, unknown>;

    const workspaceId =
      typeof userData.workspaceId === "string"
        ? userData.workspaceId.trim()
        : "";
    const workspaceMemberships = Array.isArray(userData.workspaceMemberships)
      ? (userData.workspaceMemberships as unknown[]).filter(
          (x): x is string => typeof x === "string" && x.trim() !== ""
        )
      : [];

    const userWorkspaceIds = [
      ...new Set([...workspaceMemberships, workspaceId].filter(Boolean)),
    ];

    const sessions = await getSharedSessionMembershipsRepo(
      user.uid,
      userWorkspaceIds
    );

    return apiSuccess({ sessions }, null, { headers: corsHeaders(req) });
  } catch (err) {
    console.error("GET /api/sessions/shared:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load shared sessions",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
