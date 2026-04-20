import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { adminDb } from "@/lib/server/firebaseAdmin";
import {
  createAccessRequest,
  getRequestByUser,
} from "@/lib/repositories/accessRequestsRepository.server";
import { getSessionMember } from "@/lib/repositories/sessionMembersRepository.server";
import { getWorkspaceMembersRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { sendAccessRequestNotificationEmail } from "@/lib/email/workspaceEmails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://echly.com";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId: sessionIdRaw } = await params;
  const sessionId = typeof sessionIdRaw === "string" ? sessionIdRaw.trim() : "";
  if (!sessionId) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId,
  });
  if (!built.ok) {
    return built.response;
  }
  const context = built.ctx;

  if (context.identityType !== "USER" || !context.userId?.trim()) {
    return apiError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }

  const userId = context.userId.trim();

  if (context.access?.capabilities.canResolve) {
    return apiError({
      code: "FORBIDDEN",
      message: "You already have resolve access",
      status: 403,
    });
  }

  const existing = await getRequestByUser(sessionId, userId);
  if (existing?.status === "pending") {
    return apiSuccess({
      type: "already_requested" as const,
    });
  }

  if (existing?.status === "approved") {
    const member = await getSessionMember(sessionId, userId);
    if (member?.access === "resolve") {
      return apiError({
        code: "INVALID_INPUT",
        message: "An approved access request already exists for this user",
        status: 400,
      });
    }
  }

  const userSnap = await adminDb.doc(`users/${userId}`).get();
  const requesterEmail =
    typeof userSnap.data()?.email === "string"
      ? userSnap.data()!.email.trim()
      : "";
  if (!requesterEmail) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing email on user profile",
      status: 400,
    });
  }

  let body: { access?: unknown } | null = null;
  try { body = (await req.json()) as { access?: unknown }; } catch { /* no body */ }
  const rawAccess = body?.access;
  const requestedAccess: "view" | "resolve" = rawAccess === "view" ? "view" : "resolve";

  try {
    await createAccessRequest({
      sessionId,
      requesterUserId: userId,
      requesterEmail,
      requestedAccess,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes("already_requested") ||
      msg.includes("already pending")
    ) {
      return apiSuccess({
        type: "already_requested" as const,
      });
    }
    throw e;
  }

  void (async () => {
    try {
      const sess = context.session;
      if (!sess) return;
      const workspaceId = typeof sess.workspaceId === "string" ? sess.workspaceId.trim() : "";
      if (!workspaceId) return;
      const members = await getWorkspaceMembersRepo(workspaceId);
      const emails = members.map((m) => m.email).filter((e) => e && e !== requesterEmail);
      if (emails.length === 0) return;
      await sendAccessRequestNotificationEmail({
        to: emails,
        requesterEmail,
        sessionName: sess.title ?? "a session",
        sessionUrl: `${APP_URL}/dashboard/${sessionId}`,
        workspaceName: workspaceId,
      });
    } catch {
      // email failure must not fail the route
    }
  })();

  return apiSuccess({
    type: "request_created" as const,
  });
}
