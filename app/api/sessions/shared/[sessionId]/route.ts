import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { corsHeaders } from "@/lib/server/cors";
import { adminDb } from "@/lib/server/firebaseAdmin";
import {
  removeSessionMemberRepo,
} from "@/lib/repositories/sessionMembersRepository.server";
import { deleteSessionAccessDoc } from "@/lib/repositories/sessionAccessRepository.server";
import { sessionAccessDocPath } from "@/lib/repositories/sessionPaths";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  const { sessionId: sessionIdRaw } = await params;
  const sessionId =
    typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const accessRef = adminDb.doc(sessionAccessDocPath(user.uid, sessionId));
    const accessSnap = await accessRef.get();
    if (!accessSnap.exists) {
      return apiError({
        code: "NOT_FOUND",
        message: "You do not have access to this session",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }

    const sessionSnap = await adminDb.doc(`sessions/${sessionId}`).get();
    const sessionData = sessionSnap.exists ? sessionSnap.data() ?? {} : {};
    const workspaceId =
      typeof sessionData.workspaceId === "string"
        ? sessionData.workspaceId.trim()
        : "";
    const sessionTitle =
      typeof sessionData.title === "string" && sessionData.title.trim()
        ? sessionData.title
        : "Untitled Session";

    const result = await removeSessionMemberRepo({
      sessionId,
      userId: user.uid,
      actorId: user.uid,
      workspaceId,
      sessionTitle,
      source: "leave_self",
    });

    if (!result.ok) {
      // Members doc missing but sessionAccess existed — clean up the orphan mirror
      // so the user isn't stuck seeing the session forever.
      await deleteSessionAccessDoc({ userId: user.uid, sessionId });
    }

    return apiSuccess(
      { type: "left" },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("DELETE /api/sessions/shared/[sessionId]:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to leave session",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
