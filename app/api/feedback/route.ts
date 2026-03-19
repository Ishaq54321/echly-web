import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getSessionFeedbackPageForUserWithStringCursorRepo,
  getWorkspaceFeedbackAllRepo,
  getWorkspaceFeedbackWithCommentsRepo,
} from "@/lib/repositories/feedbackRepository";
import { resolveWorkspaceForUserLight } from "@/lib/server/resolveWorkspaceForUserLight";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { log } from "@/lib/utils/logger";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";
import { getCachedFeedback, setCachedFeedback } from "@/lib/server/cache/feedbackCache";

function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "User is not authenticated",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function base64UrlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  // Node runtime (Next.js): Buffer exists.
  return Buffer.from(padded, "base64").toString("utf8");
}

function peekJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecodeToString(parts[1] ?? "");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function requireAuthFast(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = peekJwtPayload(token);
    if (payload && payload.type === "extension") {
      const decoded = await verifyExtensionToken(token);
      if (!decoded) throw unauthorized();
      return { uid: decoded.uid, email: decoded.email ?? undefined };
    }
    const decoded = await verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  }

  const sessionUser = await getSessionUser(req);
  if (sessionUser) return { uid: sessionUser.uid, email: sessionUser.email ?? undefined };
  throw unauthorized();
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

function serializeFeedback(item: Feedback): Record<string, unknown> {
  const out = { ...item } as Record<string, unknown>;
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  out.createdAt = createdAt != null && typeof createdAt.toDate === "function" ? createdAt.toDate().toISOString() : null;
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
      ? createdAt.toDate().toISOString()
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
    createdAt: createdAtOut,

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
  };
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20
 * Returns { feedback: [], nextCursor: string | null, hasMore: boolean }
 */
export async function GET(req: NextRequest) {
  const totalStart = Date.now();
  log("[API] GET /api/feedback start");
  console.log("[FEEDBACK ROUTE CHECK]", {
    hasBilling: typeof (globalThis as unknown as { getWorkspaceEntitlements?: unknown }).getWorkspaceEntitlements !== "undefined",
  });
  let user;
  try {
    const t0 = Date.now();
    user = await requireAuthFast(req);
    const authTime = Date.now() - t0;
    // Keep authTime for perf breakdown log later
    (req as unknown as { __echly_authTime?: number }).__echly_authTime = authTime;
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }

  const tWorkspace0 = Date.now();
  let resolvedWorkspaceId: string | null = null;
  try {
    const { workspaceId } = await resolveWorkspaceForUserLight(user.uid, req);
    resolvedWorkspaceId = workspaceId;
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, {
        status: 403,
        headers: corsHeaders(req),
      });
    }
    throw err;
  }
  const workspaceTime = Date.now() - tWorkspace0;
  (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime = workspaceTime;

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  const limitParam = searchParams.get("limit");
  const DEFAULT_LIMIT = 20;
  const requestedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
  const normalizedRequestedLimit = Number.isFinite(requestedLimit) ? Math.max(1, requestedLimit) : DEFAULT_LIMIT;
  const safeLimit = Math.min(normalizedRequestedLimit, 50);

  // When sessionId is omitted, return feedback across sessions (Discussion inbox)
  // Use conversationsOnly=true to fetch only feedback with comments (conversation feed)
  if (!sessionId || sessionId.trim() === "") {
    const conversationsOnly = searchParams.get("conversationsOnly") === "true";
    try {
      const workspaceId = resolvedWorkspaceId ?? user.uid;
      const tFs0 = Date.now();
      const feedback = conversationsOnly
        ? await getWorkspaceFeedbackWithCommentsRepo({
            workspaceId,
            limit: safeLimit,
            cursor,
          })
        : await getWorkspaceFeedbackAllRepo(workspaceId, safeLimit);
      const firestoreTime = Date.now() - tFs0;

      const totalTime = Date.now() - totalStart;
      console.log("[PERF BREAKDOWN]", {
        authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
        workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
        firestoreTime,
        totalTime,
      });

      log("[API] GET /api/feedback (all) duration:", totalTime);
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
    const workspaceId = resolvedWorkspaceId ?? user.uid;
    const isFirstPage = !cursor || cursor.trim() === "";

    if (isFirstPage) {
      const cached = getCachedFeedback(workspaceId, sessionId);
      if (cached) {
        const totalTime = Date.now() - totalStart;
        console.log("[PERF BREAKDOWN]", {
          authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
          workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
          firestoreTime: 0,
          totalTime,
        });

        log("[API] GET /api/feedback duration (cached):", totalTime);
        return NextResponse.json(cached, { headers: corsHeaders(req) });
      }
    }

    const tFs0 = Date.now();
    const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
      workspaceId,
      sessionId,
      userId: user.uid,
      limit: safeLimit,
      cursor: isFirstPage ? undefined : cursor,
    });
    const firestoreTime = Date.now() - tFs0;
    const { feedback, nextCursor, hasMore } = pageResult;

    const responseBody = {
      feedback: feedback.map(serializeFeedbackMinimal),
      nextCursor,
      hasMore,
    };

    if (isFirstPage) {
      setCachedFeedback(workspaceId, sessionId, responseBody);
    }

    const totalTime = Date.now() - totalStart;
    console.log("[PERF BREAKDOWN]", {
      authTime: (req as unknown as { __echly_authTime?: number }).__echly_authTime ?? null,
      workspaceTime: (req as unknown as { __echly_workspaceTime?: number }).__echly_workspaceTime ?? null,
      firestoreTime,
      totalTime,
    });

    log("[API] GET /api/feedback duration:", totalTime);
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
