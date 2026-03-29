import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { normalizeTicketStatus } from "@/lib/domain/normalizeTicketStatus";
import {
  getDiscussionInboxFeedbackForUserRepo,
  getSessionFeedbackPageForUserWithStringCursorRepo,
} from "@/lib/repositories/feedbackRepository.server";
import { getAccessContext } from "@/lib/access/getAccessContext";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { verifyExtensionToken } from "@/lib/server/extensionAuth";
import { verifyIdToken, type AuthUser } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";

function unauthorized(): Response {
  return Response.json(
    {
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "User is not authenticated",
    },
    {
      status: 401,
    }
  );
}

function missingExtensionToken(): Response {
  return Response.json(
    { error: "MISSING_EXTENSION_TOKEN" },
    {
      status: 401,
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
  } catch (err) {
    console.error("[feedback] peekJwtPayload parse failed:", err);
    return null;
  }
}

async function requireAuthFast(req: NextRequest): Promise<AuthUser> {
  const extensionToken = req.headers.get("x-extension-token")?.trim() ?? "";
  const origin = req.headers.get("origin")?.toLowerCase() ?? "";
  const isExtensionRequest = origin.startsWith("chrome-extension://");

  if (isExtensionRequest && !extensionToken) {
    throw missingExtensionToken();
  }

  if (extensionToken) {
    const decoded = await verifyExtensionToken(extensionToken);
    if (!decoded) throw unauthorized();
    return { uid: decoded.uid, email: decoded.email ?? undefined };
  }

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

  const rawStatus =
    typeof (item as { status?: string }).status === "string"
      ? ((item as { status?: string }).status as string)
      : (item as { isResolved?: boolean }).isResolved
        ? "resolved"
        : "open";
  const normalizedStatus = normalizeTicketStatus(rawStatus);

  return {
    id: item.id,
    sessionId: item.sessionId,
    createdAt: createdAtOut,

    // Fields used by capture widget + discussion UI
    title: item.title,
    instruction: item.instruction ?? item.description,
    description: item.description,
    type: item.type,
    actionSteps: item.actionSteps ?? undefined,

    commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
    lastCommentPreview: item.lastCommentPreview,
    lastCommentAt: lastCommentAtOut ?? undefined,
    status: normalizedStatus,
    isResolved: normalizedStatus === "resolved",
    isDeleted: item.isDeleted ?? false,

    screenshotUrl: item.screenshotUrl ?? null,
    screenshotStatus: item.screenshotStatus ?? null,
  };
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20&status=open|resolved
 * Returns { feedback: [], nextCursor: string | null, hasMore: boolean }
 *
 * When `status` is omitted, returns the mixed-status session list.
 * When `status=open` or `status=resolved`, filters by Firestore `status` (paginated separately).
 *
 * Session-scoped pagination excludes soft-deleted feedback (`isDeleted === true`).
 * The repository applies the same rule as `where("isDeleted","!=",true)` without
 * dropping legacy docs that omit `isDeleted` (see getSessionFeedbackPageForUserWithStringCursorRepo).
 */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAuthFast(req);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(req) },
    });
  }

  const userId = user.uid;

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
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

  // When sessionId is omitted, return Discussion inbox (session-scoped queries per accessible session).
  if (!sessionId || sessionId.trim() === "") {
    try {
      const feedback = await getDiscussionInboxFeedbackForUserRepo({
        userId,
        userEmail: user.email,
        limit: safeLimit,
      });

      const sessionIds = [...new Set(feedback.map((f) => f.sessionId).filter(Boolean))];
      const titleBySessionId = new Map<string, string>();
      await Promise.all(
        sessionIds.map(async (sid) => {
          const row = await getSessionByIdRepo(sid);
          if (row) titleBySessionId.set(sid, row.title ?? "");
        })
      );

      const payload = feedback.map((f) => ({
        ...serializeFeedbackMinimal(f),
        sessionName: titleBySessionId.get(f.sessionId) ?? "",
      }));

      return NextResponse.json(
        {
          feedback: payload,
          nextCursor: null,
          hasMore: false,
        },
        { headers: corsHeaders(req) }
      );
    } catch (err) {
      console.error("GET /api/feedback (all):", err);
      return NextResponse.json(
        { error: "Server error" },
        { status: 500, headers: corsHeaders(req) }
      );
    }
  }

  try {
    const sid = sessionId.trim();
    const { access } = await getAccessContext({
      sessionId: sid,
      user: { uid: userId, email: user.email ?? null },
    });
    if (!access?.canView) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: corsHeaders(req) }
      );
    }

    const isFirstPage = !cursor || cursor.trim() === "";

    const pageResult = await getSessionFeedbackPageForUserWithStringCursorRepo({
      sessionId: sid,
      limit: safeLimit,
      cursor: isFirstPage ? undefined : cursor,
      ...(statusFilter ? { statusFilter } : {}),
    });
    const { feedback, nextCursor, hasMore } = pageResult;

    const responseBody = {
      feedback: feedback.map(serializeFeedbackMinimal),
      nextCursor,
      hasMore,
    };

    return NextResponse.json(
      responseBody,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    console.error("GET /api/feedback:", err);
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
