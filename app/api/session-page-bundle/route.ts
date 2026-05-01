export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { getSessionFeedbackPageForUserWithStringCursorRepo } from "@/lib/repositories/feedbackRepository.server";
import {
  getSessionByIdRepo,
  recordSessionViewIfNewRepo,
} from "@/lib/repositories/sessionsRepository.server";
import { listPendingAccessRequests } from "@/lib/repositories/accessRequestsRepository.server";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import { serializeSession } from "@/lib/server/serializeSession";
import { corsHeaders } from "@/lib/server/cors";
import { fireAndForget } from "@/lib/server/fireAndForget";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";

async function loadViewerProfileForBundle(
  uid: string
): Promise<{ displayName: string | null; avatarUrl: string | null }> {
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (snap.exists) {
      const d = snap.data() ?? {};
      displayName =
        typeof d.displayName === "string" && d.displayName.trim()
          ? d.displayName.trim()
          : typeof d.name === "string" && d.name.trim()
            ? d.name.trim()
            : null;
      avatarUrl =
        typeof d.photoURL === "string" && d.photoURL.trim()
          ? d.photoURL.trim()
          : typeof d.avatarUrl === "string" && d.avatarUrl.trim()
            ? d.avatarUrl.trim()
            : null;
    }
  } catch {
    // Firestore read failed — fall through to Auth lookup
  }

  if (!displayName || !avatarUrl) {
    try {
      const { getAuth } = await import("firebase-admin/auth");
      const authUser = await getAuth().getUser(uid);
      if (!displayName) {
        if (authUser?.displayName?.trim()) {
          displayName = authUser.displayName.trim();
        } else if (authUser?.email) {
          displayName = authUser.email.split("@")[0];
        }
      }
      if (!avatarUrl && authUser?.photoURL) {
        avatarUrl = authUser.photoURL;
      }
    } catch {
      // Auth lookup failed — continue with whatever we have
    }
  }

  return { displayName, avatarUrl };
}

const BUNDLE_FEEDBACK_LIMIT = 50;

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/session-page-bundle?sessionId=...&token=...|shareToken=...
 *
 * Single {@link tryBuildRequestContext} (share token via query/Bearer same as /api/feedback),
 * then first page of session feedback (limit 50).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionIdRaw = searchParams.get("sessionId");
  const trimmedSid = sessionIdRaw?.trim() ?? "";

  if (trimmedSid === "") {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing session id",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  try {
    const sessionRow = await getSessionByIdRepo(trimmedSid);

    const [built, pageResult] = await Promise.all([
      tryBuildRequestContext({
        req,
        sessionId: trimmedSid,
        optionalAuth: true,
        session: sessionRow,
      }),
      getSessionFeedbackPageForUserWithStringCursorRepo({
        sessionId: trimmedSid,
        limit: BUNDLE_FEEDBACK_LIMIT,
        cursor: undefined,
      }),
    ]);

    if (!built.ok) {
      return new Response(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }

    const ctx = built.ctx;
    const access = ctx.access;
    if (!access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        data: {
          access: access ? { capabilities: access.capabilities } : null,
          accessRequestStatus: ctx.accessRequest?.requestStatus ?? null,
        },
        init: { headers: corsHeaders(req) },
      });
    }

    const session = ctx.session;
    if (!session) {
      return apiError({
        code: "NOT_FOUND",
        message: "Not found",
        status: 404,
        init: { headers: corsHeaders(req) },
      });
    }

    /** Same semantics as POST /api/sessions/:id/view: Loom-style count once per viewer; no second context build on the client. */
    const uid = ctx.userId;
    const anonViewerIdRaw = searchParams.get("viewerId")?.trim() ?? "";
    const anonViewerId =
      anonViewerIdRaw.startsWith("anon_") ? anonViewerIdRaw : "";
    if (uid || anonViewerId !== "") {
      const viewerKey = uid ?? anonViewerId;
      const rateKey = `session-view:${trimmedSid}:${clientKeyFromRequest(req)}`;
      const rate = checkRateLimit({ key: rateKey, max: 60, windowMs: 60_000 });
      if (rate.allowed) {
        fireAndForget("session-page-bundle recordSessionView", async () => {
          const profile = uid ? await loadViewerProfileForBundle(uid) : undefined;
          await recordSessionViewIfNewRepo(trimmedSid, viewerKey, profile);
        });
      }
    }
    const { feedback, nextCursor, hasMore } = pageResult;

    const sessionJson = serializeSession(session, access);
    const feedbackPayload = feedback.map((f) => serializeFeedback(f, access));
    const requestPayload = ctx.accessRequest ?? ({ pendingResolve: false } as const);

    let pendingAccessRequestsCount = 0;
    if (access?.capabilities.canResolve) {
      const pending = await listPendingAccessRequests(trimmedSid);
      pendingAccessRequestsCount = pending.length;
    }

    return apiSuccess(
      {
        session: sessionJson,
        feedback: feedbackPayload,
        nextCursor,
        hasMore,
        request: requestPayload,
        access: ctx.access,
        pendingAccessRequestsCount,
        user:
          ctx.userId != null
            ? { uid: ctx.userId, workspaceId: ctx.workspaceId }
            : null,
      },
      access,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/session-page-bundle:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
