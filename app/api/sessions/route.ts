import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { createSessionRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  createActivityEvent,
  resolveActorForActivityEvent,
} from "@/lib/repositories/activityEventsRepository.server";
import { WORKSPACE_SUSPENDED_MESSAGE } from "@/lib/server/assertWorkspaceActive";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { corsHeaders } from "@/lib/server/cors";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { listAccessibleSessionsForUser } from "@/lib/server/listAccessibleSessionsForUser";
import type { Session } from "@/lib/domain/session";
import { assert } from "@/lib/utils/assert";
import { adminDb } from "@/lib/server/firebaseAdmin";

function sessionFieldToIso(value: Session["updatedAt"]): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  const v = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof v.toMillis === "function") {
    return new Date(v.toMillis()).toISOString();
  }
  if (typeof v.toDate === "function") {
    return v.toDate().toISOString();
  }
  return null;
}

export const dynamic = "force-dynamic";
const SESSION_PAGE_SIZE = 30;

function decodeCursor(raw: string | null): number {
  if (!raw) return 0;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const n = Number.parseInt(decoded, 10);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  } catch {
    return 0;
  }
}

function encodeCursor(index: number): string {
  const safe = Math.max(0, Math.floor(index));
  return Buffer.from(String(safe), "utf8").toString("base64url");
}

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

/** GET /api/sessions — list sessions for the authenticated user. */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const apiTimer = `API /sessions ${requestId}`;
  console.time(apiTimer);
  try {
    const cursorParam = req.nextUrl.searchParams.get("cursor");
    const offset = decodeCursor(cursorParam);

    const queryTimer = `Firestore query ${requestId}`;
    console.time(queryTimer);
    let sessions: Session[];
    try {
      sessions = await listAccessibleSessionsForUser({
        userId: user.uid,
        limit: 100,
      });
    } finally {
      console.timeEnd(queryTimer);
    }

    sessions.forEach((s) => {
      assert(s.accessLevel, "Session missing accessLevel");
      assert(s.generalAccess, "Session missing generalAccess");
    });

    const pagedSessions = sessions.slice(offset, offset + SESSION_PAGE_SIZE);

    const creatorIds = [
      ...new Set(pagedSessions.map((s) => s.createdByUserId).filter(Boolean)),
    ];
    const creatorSnaps = await Promise.all(
      creatorIds.map((id) => adminDb.doc(`users/${id}`).get())
    );
    const creatorNameMap = new Map<string, string>();
    for (const snap of creatorSnaps) {
      if (snap.exists) {
        const d = snap.data()!;
        const first = typeof d.firstName === "string" ? d.firstName : "";
        const last = typeof d.lastName === "string" ? d.lastName : "";
        const composed = `${first} ${last}`.trim();
        const email = typeof d.email === "string" ? d.email : "";
        const name = composed || email.split("@")[0] || "Unknown";
        creatorNameMap.set(snap.id, name);
      }
    }

    const sessionsPayload = pagedSessions.map((session) => {
      const updatedAt =
        sessionFieldToIso(session.updatedAt) ??
        sessionFieldToIso(session.createdAt) ??
        null;
      const createdAt = sessionFieldToIso(session.createdAt) ?? null;
      const title =
        typeof session.title === "string" && session.title.trim() !== ""
          ? session.title.trim()
          : "Untitled Session";
      const openCount = typeof session.openCount === "number" ? session.openCount : 0;
      const resolvedCount =
        typeof session.resolvedCount === "number" ? session.resolvedCount : 0;
      const totalCount =
        typeof session.totalCount === "number"
          ? session.totalCount
          : typeof session.feedbackCount === "number"
            ? session.feedbackCount
            : 0;
      const feedbackCount =
        typeof session.feedbackCount === "number"
          ? session.feedbackCount
          : typeof session.totalCount === "number"
            ? session.totalCount
            : 0;

      const viewCount =
        typeof session.viewCount === "number" ? session.viewCount : 0;
      const recentViewers = Array.isArray(session.recentViewers)
        ? session.recentViewers
        : [];
      const commentCount =
        typeof session.commentCount === "number" ? session.commentCount : 0;

      return {
        id: session.id,
        workspaceId: session.workspaceId,
        createdByUserId: session.createdByUserId,
        title,
        name: title,
        accessLevel: session.accessLevel,
        generalAccess: session.generalAccess,
        updatedAt,
        createdAt,
        archived: session.archived === true || session.isArchived === true,
        openCount,
        resolvedCount,
        totalCount,
        feedbackCount,
        viewCount,
        recentViewers,
        commentCount,
        creatorName: creatorNameMap.get(session.createdByUserId) ?? "Unknown",
      };
    });
    const nextOffset = offset + sessionsPayload.length;
    const hasMore = nextOffset < sessions.length;
    const nextCursor = hasMore ? encodeCursor(nextOffset) : null;
    return apiSuccess(
      { sessions: sessionsPayload, hasMore, nextCursor },
      null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return apiError({
        code: "FORBIDDEN",
        message: "Workspace not found",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    console.error("GET /api/sessions:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to load sessions",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  } finally {
    console.timeEnd(apiTimer);
  }
}

/**
 * POST /api/sessions — create a new session. Returns `{ success, data: { session: { id } }, access: null }`.
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (err) {
    return withCors(req, toAuthorizationResponse(err));
  }

  try {
    const workspaceId = await getUserWorkspaceIdRepo(user.uid);

    let title: string | undefined;
    try {
      const body = await req.json();
      if (typeof body.title === "string" && body.title.trim()) {
        title = body.title.trim().substring(0, 100);
      }
    } catch {
      // empty body is fine — fallback to default
    }

    const id = await createSessionRepo(workspaceId, user.uid, title);

    const actor = await resolveActorForActivityEvent(user.uid);
    await createActivityEvent({
      workspaceId,
      sessionId: id,
      eventType: "session.created",
      actorId: user.uid,
      actorName: actor.actorName,
      actorPhotoURL: actor.actorPhotoURL,
      metadata: { sessionTitle: title ?? "Untitled Session" },
    });

    return apiSuccess({ session: { id } }, null, { headers: corsHeaders(req) });
  } catch (err) {
    if (err instanceof Error && err.message === "Missing workspaceId for user") {
      return apiError({
        code: "FORBIDDEN",
        message: "Workspace not found",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return apiError({
        code: "FORBIDDEN",
        message: WORKSPACE_SUSPENDED_MESSAGE,
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    console.error("POST /api/sessions:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to create session",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
