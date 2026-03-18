import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getSessionFeedbackPageForUserWithStringCursorRepo,
  getWorkspaceFeedbackAllRepo,
  getWorkspaceFeedbackWithCommentsRepo,
} from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { resolveWorkspaceForUserLight } from "@/lib/server/resolveWorkspaceForUserLight";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { log } from "@/lib/utils/logger";
import { corsHeaders } from "@/lib/server/cors";
import { requireAuth, type AuthUser } from "@/lib/server/auth";
import {
  getCachedFeedbackPage,
  setCachedFeedbackPage,
} from "@/lib/server/cache/feedbackCache";

const prefetchInFlight = new Set<string>();

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

function serializeFeedback(item: Feedback): Record<string, unknown> {
  const out = { ...item } as Record<string, unknown>;
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = { seconds: Math.floor(createdAt.toDate().getTime() / 1000) };
  } else if (createdAt != null && typeof (createdAt as { seconds?: number }).seconds === "number") {
    out.createdAt = { seconds: (createdAt as { seconds: number }).seconds };
  }
  const lastCommentAt = item.lastCommentAt as { toDate?: () => Date; seconds?: number } | null | undefined;
  if (lastCommentAt != null && typeof lastCommentAt.toDate === "function") {
    out.lastCommentAt = { seconds: Math.floor(lastCommentAt.toDate().getTime() / 1000) };
  } else if (lastCommentAt != null && typeof (lastCommentAt as { seconds?: number }).seconds === "number") {
    out.lastCommentAt = { seconds: (lastCommentAt as { seconds: number }).seconds };
  }
  return out;
}

function serializeFeedbackMinimal(item: Feedback): Record<string, unknown> {
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  const createdAtOut =
    createdAt != null && typeof createdAt.toDate === "function"
      ? { seconds: Math.floor(createdAt.toDate().getTime() / 1000) }
      : createdAt != null && typeof (createdAt as { seconds?: number }).seconds === "number"
        ? { seconds: (createdAt as { seconds: number }).seconds }
        : null;

  const lastCommentAt = item.lastCommentAt as { toDate?: () => Date; seconds?: number } | null | undefined;
  const lastCommentAtOut =
    lastCommentAt != null && typeof lastCommentAt.toDate === "function"
      ? { seconds: Math.floor(lastCommentAt.toDate().getTime() / 1000) }
      : lastCommentAt != null && typeof (lastCommentAt as { seconds?: number }).seconds === "number"
        ? { seconds: (lastCommentAt as { seconds: number }).seconds }
        : null;

  return {
    id: item.id,
    sessionId: item.sessionId,
    createdAt: createdAtOut ?? undefined,

    // Fields used by capture widget + discussion UI
    title: item.title,
    description: item.description,
    type: item.type,
    actionSteps: item.actionSteps ?? undefined,

    commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
    lastCommentPreview: item.lastCommentPreview,
    lastCommentAt: lastCommentAtOut ?? undefined,
    status: (item as unknown as { status?: string }).status,
    isResolved: (item as unknown as { isResolved?: boolean }).isResolved,
    isSkipped: (item as unknown as { isSkipped?: boolean }).isSkipped,

    // Screenshot for feedback list and detail
    screenshotUrl: item.screenshotUrl ?? null,
  };
}

async function fetchNextPageInBackground(
  workspaceId: string,
  sessionId: string,
  cursor: string,
  userId: string,
  limit: number
) {
  const key = `${workspaceId}:${sessionId}:${cursor}`;
  if (prefetchInFlight.has(key)) return;
  prefetchInFlight.add(key);
  try {
    const nextPage = await getSessionFeedbackPageForUserWithStringCursorRepo({
      workspaceId,
      sessionId,
      userId,
      limit,
      cursor,
    });
    const data = {
      feedback: nextPage.feedback.map(serializeFeedbackMinimal),
      nextCursor: nextPage.nextCursor,
      hasMore: nextPage.hasMore,
    };
    setCachedFeedbackPage(workspaceId, sessionId, cursor, data);

    // Second-level prefetch: next-next page so user never hits Firestore while scrolling
    if (nextPage.nextCursor) {
      const nextKey = `${workspaceId}:${sessionId}:${nextPage.nextCursor}`;
      if (!prefetchInFlight.has(nextKey)) {
        prefetchInFlight.add(nextKey);
        try {
          const nextNextPage = await getSessionFeedbackPageForUserWithStringCursorRepo({
            workspaceId,
            sessionId,
            userId,
            limit,
            cursor: nextPage.nextCursor,
          });
          const nextNextData = {
            feedback: nextNextPage.feedback.map(serializeFeedbackMinimal),
            nextCursor: nextNextPage.nextCursor,
            hasMore: nextNextPage.hasMore,
          };
          setCachedFeedbackPage(
            workspaceId,
            sessionId,
            nextPage.nextCursor,
            nextNextData
          );
        } catch {
          // Prefetch is best-effort; ignore errors
        }
        prefetchInFlight.delete(nextKey);
      }
    }
  } catch {
    // Prefetch is best-effort; ignore errors
  } finally {
    prefetchInFlight.delete(key);
  }
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20
 * Returns { feedback: [], nextCursor: string | null, hasMore: boolean }
 */
export async function GET(req: NextRequest) {
  const totalStart = Date.now();
  console.log("[TRACE] STEP 1: request received");
  log("[API] GET /api/feedback start");
  console.log("[FEEDBACK ROUTE CHECK]", {
    hasBilling: typeof (globalThis as unknown as { getWorkspaceEntitlements?: unknown }).getWorkspaceEntitlements !== "undefined",
  });
  const userIdFromHeader = req.headers.get("x-user-id");
  const authPromise =
    typeof userIdFromHeader === "string" && userIdFromHeader.trim()
      ? Promise.resolve({ uid: userIdFromHeader.trim() } as AuthUser)
      : requireAuth(req);
  const workspacePromise = authPromise.then((auth) => resolveWorkspaceForUserLight(auth.uid, req));

  let auth: AuthUser;
  let resolvedWorkspaceId: string | null = null;
  try {
    console.log("[TRACE] STEP 2+3: auth + workspace parallel start");
    const t0 = Date.now();
    const [authResult, workspaceResult] = await Promise.all([
      authPromise,
      workspacePromise,
    ]);
    auth = authResult;
    resolvedWorkspaceId = workspaceResult.workspaceId;
    const parallelTime = Date.now() - t0;
    console.log("[TRACE] STEP 2+3: auth + workspace done");
    console.log("[TIME] auth+workspace parallel:", parallelTime);
    (req as unknown as { __echly_authTime?: number }).__echly_authTime = parallelTime;
    (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime = 0;
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    const errRes = err as Response;
    if (errRes?.status) {
      return new NextResponse(errRes.body, {
        status: errRes.status,
        statusText: errRes.statusText,
        headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
      });
    }
    throw err;
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  /** Session feedback list: default 25, enforce exactly 25 per page for consistent initial load and scroll (25 → 50 → 75). */
  const limit = Number(searchParams.get("limit")) || 25;
  const safeLimit = Math.min(Math.max(1, limit), 25);

  // When sessionId is omitted, return feedback across sessions (Discussion inbox)
  // Use conversationsOnly=true to fetch only feedback with comments (conversation feed)
  if (!sessionId || sessionId.trim() === "") {
    const conversationsOnly = searchParams.get("conversationsOnly") === "true";
    try {
      const workspaceId = resolvedWorkspaceId ?? auth.uid;
      console.log("[TRACE] STEP 4: firestore query start");
      const tFs0 = Date.now();
      const feedback = conversationsOnly
        ? await getWorkspaceFeedbackWithCommentsRepo({
            workspaceId,
            limit: safeLimit,
            cursor,
          })
        : await getWorkspaceFeedbackAllRepo(workspaceId, safeLimit);
      const firestoreTime = Date.now() - tFs0;
      console.log("[TRACE] STEP 4: firestore done");
      console.log("[TIME] firestore:", firestoreTime);

      const totalTime = Date.now() - totalStart;
      console.log("[PERF BREAKDOWN]", {
        authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
        workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
        firestoreTime,
        totalTime,
      });

      log("[API] GET /api/feedback (all) duration:", totalTime);
      console.log("[TRACE] STEP 5: response sent");
      return NextResponse.json(
        {
          feedback: feedback.map(serializeFeedbackMinimal),
          nextCursor: null,
          hasMore: false,
        },
        { headers: corsHeaders(req) }
      );
    } catch (err) {
      if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
        return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
          status: 403,
          headers: corsHeaders(req),
        });
      }
      console.error("GET /api/feedback (all):", err);
      log("[API] GET /api/feedback (all) duration (error):", Date.now() - totalStart);
      return NextResponse.json(
        { error: "Server error" },
        { status: 500, headers: corsHeaders(req) }
      );
    }
  }

  try {
    const workspaceId = resolvedWorkspaceId ?? auth.uid;
    const isFirstPage = !cursor || cursor.trim() === "";
    const cursorKey = isFirstPage ? "FIRST" : cursor;

    const cached = getCachedFeedbackPage(workspaceId, sessionId!, cursorKey);
    if (cached) {
      const totalTime = Date.now() - totalStart;
      console.log("[CACHE CHECK]", { hit: true, cursorKey });
      console.log("[PERF BREAKDOWN]", {
        authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
        workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
        firestoreTime: 0,
        totalTime,
      });
      log("[API] GET /api/feedback duration (cached):", totalTime);
      console.log("[TRACE] STEP 5: response sent");
      return NextResponse.json(cached, { headers: corsHeaders(req) });
    }

    console.log("[TRACE] STEP 4: firestore query start");
    const tFs0 = Date.now();
    const [pageResult, sessionDoc] = await Promise.all([
      getSessionFeedbackPageForUserWithStringCursorRepo({
        workspaceId,
        sessionId,
        userId: auth.uid,
        limit: safeLimit,
        cursor: isFirstPage ? undefined : cursor,
      }),
      getSessionByIdRepo(sessionId),
    ]);
    const firestoreTime = Date.now() - tFs0;
    console.log("[TRACE] STEP 4: firestore done");
    console.log("[TIME] firestore:", firestoreTime);
    const { feedback, nextCursor, hasMore } = pageResult;
    const totalCount = typeof sessionDoc?.feedbackCount === "number" ? sessionDoc.feedbackCount : 0;
    const openCount = typeof sessionDoc?.openCount === "number" ? sessionDoc.openCount : 0;
    const resolvedCount = typeof sessionDoc?.resolvedCount === "number" ? sessionDoc.resolvedCount : 0;
    const skippedCount = typeof sessionDoc?.skippedCount === "number" ? sessionDoc.skippedCount : 0;

    const responseBody = {
      feedback: feedback.map(serializeFeedbackMinimal),
      nextCursor,
      hasMore,
      totalCount,
      openCount,
      resolvedCount,
      skippedCount,
    };

    setCachedFeedbackPage(workspaceId, sessionId, cursorKey, responseBody);

    if (nextCursor) {
      fetchNextPageInBackground(workspaceId, sessionId, nextCursor, auth.uid, safeLimit).catch(() => {});
    }

    const totalTime = Date.now() - totalStart;
    console.log("[PERF BREAKDOWN]", {
      authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
      workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
      firestoreTime,
      totalTime,
    });

    log("[API] GET /api/feedback duration:", totalTime);
    console.log("[TRACE] STEP 5: response sent");
    return NextResponse.json(
      responseBody,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    console.error("GET /api/feedback:", err);
    const totalTime = Date.now() - totalStart;
    console.log("[PERF BREAKDOWN]", {
      authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
      workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
      firestoreTime: null,
      totalTime,
    });
    log("[API] GET /api/feedback duration (error):", totalTime);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

export async function POST(req: NextRequest) {
  const mod = await import("./post");
  return mod.POST(req);
}
