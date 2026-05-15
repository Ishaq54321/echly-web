import type { NextRequest } from "next/server";
import {
  getDiscussionInboxFeedbackForUserRepo,
  getDiscussionMentionsForUserRepo,
  getSessionFeedbackPageForUserWithStringCursorRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { serializeFeedback } from "@/lib/server/serializeFeedback";
import type { AccessContext } from "@/lib/access/resolveAccess";
import { corsHeaders } from "@/lib/server/cors";
import { tryGetAuthUser } from "@/lib/server/auth/authorize";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { resolveUserName } from "@/lib/utils/nameSplit";
import { resolveUserAvatars } from "@/lib/utils/resolveUserAvatar";
import type { Feedback } from "@/lib/domain/feedback";

async function buildUserNameMap(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter((id) => typeof id === "string" && id.trim()))];
  if (unique.length === 0) return new Map();
  const snaps = await Promise.all(
    unique.map((uid) => adminDb.collection("users").doc(uid).get())
  );
  const map = new Map<string, string>();
  for (const snap of snaps) {
    if (!snap.exists) continue;
    const data = snap.data() ?? {};
    const name = resolveUserName({
      firstName: typeof data.firstName === "string" ? data.firstName : null,
      lastName: typeof data.lastName === "string" ? data.lastName : null,
      authDisplayName:
        typeof data.authDisplayName === "string" ? data.authDisplayName : null,
      email: typeof data.email === "string" ? data.email : null,
    });
    map.set(snap.id, name);
  }
  return map;
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20&status=open|resolved
 * GET /api/feedback?mentionsUserId=UID&limit=20  → discussion @mentions
 *
 * Session-scoped and inbox: `buildRequestContext` → `access.capabilities`.
 *
 * NOTE: As of Phase 2 the web session page no longer uses this endpoint —
 * authenticated viewers get tickets via the Firestore listener in
 * `lib/realtime/feedbackStore.ts`. Remaining live consumers are:
 *   - `echly-extension/src/background.ts` (paginated session ticket sync)
 *   - `app/(app)/discussion/page.tsx` (no-sessionId inbox + mentions paths)
 *   - `app/api/session-page-bundle/route.ts` for anonymous share-link viewers (first page only)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionIdRaw = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  const limitParam = searchParams.get("limit");
  const statusParam = searchParams.get("status")?.trim().toLowerCase();
  const statusFilter =
    statusParam === "open" || statusParam === "resolved"
      ? statusParam
      : undefined;
  const DEFAULT_LIMIT = 20;
  const requestedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
  const normalizedRequestedLimit = Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : DEFAULT_LIMIT;
  const safeLimit = Math.min(normalizedRequestedLimit, 50);

  const trimmedSid = sessionIdRaw?.trim() ?? "";
  const mentionsUserIdRaw = searchParams.get("mentionsUserId")?.trim() ?? "";

  if (trimmedSid === "") {
    const user = await tryGetAuthUser(req);
    if (!user) {
      return apiError({
        code: "UNAUTHORIZED",
        message: "User is not authenticated",
        status: 401,
        init: { headers: corsHeaders(req) },
      });
    }

    try {
      let feedback: Feedback[];
      if (mentionsUserIdRaw) {
        if (mentionsUserIdRaw !== user.uid) {
          return apiError({
            code: "FORBIDDEN",
            message: "Cannot query mentions for another user",
            status: 403,
            init: { headers: corsHeaders(req) },
          });
        }
        feedback = await getDiscussionMentionsForUserRepo({
          userId: user.uid,
          limit: safeLimit,
        });
      } else {
        feedback = await getDiscussionInboxFeedbackForUserRepo({
          userId: user.uid,
          limit: safeLimit,
        });
      }

      const sessionIds = [...new Set(feedback.map((f) => f.sessionId).filter(Boolean))];
      const titleBySessionId = new Map<string, string>();
      const accessBySessionId = new Map<string, AccessContext>();

      await Promise.all(
        sessionIds.map(async (sid) => {
          const row = await getSessionByIdRepo(sid);
          if (!row) {
            return;
          }
          titleBySessionId.set(sid, row.title);
          const built = await tryBuildRequestContext({
            req,
            authenticatedUser: user,
            sessionId: sid,
            session: row,
          });
          if (!built.ok) {
            return;
          }
          const rowCtx = built.ctx;
          if (rowCtx.access?.capabilities.canView) {
            accessBySessionId.set(sid, rowCtx.access);
          }
        })
      );

      const accessibleFeedback = feedback.filter((f) => accessBySessionId.has(f.sessionId));
      const userNameMap = await buildUserNameMap(
        accessibleFeedback.map((f) => f.userId).filter((id): id is string => typeof id === "string")
      );

      // Phase 25.1: resolve creator + assignee avatars LIVE from
      // users/{uid}. The creatorAvatarUrl / assigneeAvatarUrl frozen on
      // the feedback doc go stale on photo change (no fan-out).
      const liveAvatarByUid = await resolveUserAvatars([
        ...accessibleFeedback.map((f) => f.userId),
        ...accessibleFeedback.map((f) => f.assigneeId),
      ]);

      const payload = accessibleFeedback.map((f) => {
        const sid = f.sessionId;
        const name = titleBySessionId.get(sid);
        const uid = typeof f.userId === "string" ? f.userId : "";
        const assigneeId =
          typeof f.assigneeId === "string" ? f.assigneeId : "";
        const base = serializeFeedback(f, accessBySessionId.get(sid)!);
        return {
          ...base,
          creatorAvatarUrl:
            (uid && liveAvatarByUid.get(uid)) ??
            base.creatorAvatarUrl ??
            null,
          assigneeAvatarUrl:
            (assigneeId && liveAvatarByUid.get(assigneeId)) ??
            base.assigneeAvatarUrl ??
            null,
          sessionName: name === undefined ? "" : name,
          userName: (uid && userNameMap.get(uid)) || "Anonymous",
        };
      });

      return apiSuccess({ feedback: payload, nextCursor: null, hasMore: false }, null, {
        headers: corsHeaders(req),
      });
    } catch (err) {
      console.error("GET /api/feedback (all):", err);
      return apiError({
        code: "INTERNAL_ERROR",
        message: "Server error",
        status: 500,
        init: { headers: corsHeaders(req) },
      });
    }
  }

  try {
    const built = await tryBuildRequestContext({
      req,
      sessionId: trimmedSid,
      optionalAuth: true,
    });
    if (!built.ok) {
      return new Response(built.response.body, {
        status: built.response.status,
        statusText: built.response.statusText,
        headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
      });
    }
    const context = built.ctx;
    const access = context.access;
    if (!access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }

    const isFirstPage = !cursor || cursor.trim() === "";

    const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
      sessionId: trimmedSid,
      limit: safeLimit,
      cursor: isFirstPage ? undefined : cursor,
      ...(statusFilter ? { statusFilter } : {}),
    });
    const { feedback, nextCursor, hasMore } = pageResult;

    // Phase 25.1: override stale creator/assignee avatar snapshots with
    // the live users/{uid} avatar.
    const liveAvatarByUid = await resolveUserAvatars([
      ...feedback.map((f) => f.userId),
      ...feedback.map((f) => f.assigneeId),
    ]);

    return apiSuccess(
      {
        feedback: feedback.map((f) => {
          const uid = typeof f.userId === "string" ? f.userId : "";
          const assigneeId =
            typeof f.assigneeId === "string" ? f.assigneeId : "";
          const base = serializeFeedback(f, access);
          return {
            ...base,
            creatorAvatarUrl:
              (uid && liveAvatarByUid.get(uid)) ??
              base.creatorAvatarUrl ??
              null,
            assigneeAvatarUrl:
              (assigneeId && liveAvatarByUid.get(assigneeId)) ??
              base.assigneeAvatarUrl ??
              null,
          };
        }),
        nextCursor,
        hasMore,
      },
      access,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/feedback:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}

export async function POST(req: NextRequest) {
  const mod = await import("./post");
  return mod.POST(req);
}
