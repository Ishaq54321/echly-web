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
import { composeFullName } from "@/lib/utils/nameSplit";

async function loadViewerProfileForBundle(
  uid: string
): Promise<{ displayName: string | null; avatarUrl: string | null }> {
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  let email: string | null = null;
  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (snap.exists) {
      const d = snap.data() ?? {};
      const composed = composeFullName(
        typeof d.firstName === "string" ? d.firstName : null,
        typeof d.lastName === "string" ? d.lastName : null
      );
      displayName = composed || null;
      avatarUrl =
        typeof d.photoURL === "string" && d.photoURL.trim()
          ? d.photoURL.trim()
          : typeof d.avatarUrl === "string" && d.avatarUrl.trim()
            ? d.avatarUrl.trim()
            : null;
      if (typeof d.email === "string" && d.email.trim()) {
        email = d.email.trim();
      }
    }
  } catch {
    // Firestore read failed — fall through to Auth lookup
  }

  if (!displayName || !avatarUrl) {
    try {
      const { getAuth } = await import("firebase-admin/auth");
      const authUser = await getAuth().getUser(uid);
      if (!displayName) {
        const fallbackEmail = email ?? authUser?.email ?? null;
        if (fallbackEmail) {
          displayName = fallbackEmail.split("@")[0] ?? null;
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
 * Auth-aware bundle. Viewers with a direct session grant (workspace members and
 * cross-workspace session-invited users via Phase 6b's sessionAccess rules) get
 * session metadata only — their feedback listener streams the ticket list.
 * Viewers without a direct grant (anonymous share-link viewers, and authed
 * link_view viewers whose listener attach would be denied) also receive the
 * first page of feedback (limit 50).
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

    const built = await tryBuildRequestContext({
      req,
      sessionId: trimmedSid,
      optionalAuth: true,
      session: sessionRow,
    });

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
    const sessionJson = serializeSession(session, access);
    const requestPayload = ctx.accessRequest ?? ({ pendingResolve: false } as const);

    // Bundle includes feedback whenever the viewer cannot use Firestore listeners:
    //   - anonymous viewers (no auth)
    //   - authed link_view viewers (no member doc, no sessionAccess mirror — rules
    //     would deny their listener attach, so they need bundle feedback)
    // Workspace members and explicit session-members skip — they use realtime listeners.
    const needsBundleFeedback = !access.hasDirectSessionGrant;
    let feedbackPayload: Record<string, unknown>[] | undefined;
    let nextCursor: string | null | undefined;
    let hasMore: boolean | undefined;
    if (needsBundleFeedback) {
      const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
        sessionId: trimmedSid,
        limit: BUNDLE_FEEDBACK_LIMIT,
        cursor: undefined,
      });
      feedbackPayload = pageResult.feedback.map((f) => serializeFeedback(f, access));
      nextCursor = pageResult.nextCursor;
      hasMore = pageResult.hasMore;
    }

    let pendingAccessRequestsCount = 0;
    if (access?.capabilities.canResolve) {
      const pending = await listPendingAccessRequests(trimmedSid);
      pendingAccessRequestsCount = pending.length;
    }

    return apiSuccess(
      {
        session: sessionJson,
        ...(feedbackPayload !== undefined
          ? { feedback: feedbackPayload, nextCursor, hasMore }
          : {}),
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
