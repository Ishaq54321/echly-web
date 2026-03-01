import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import type { FeedbackPriority } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackRepo,
  getFeedbackByIdRepo,
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackCountRepo,
  getSessionFeedbackCountsRepo,
} from "@/lib/repositories/feedbackRepository";
import {
  getSessionByIdRepo,
  updateSessionUpdatedAtRepo,
} from "@/lib/repositories/sessionsRepository";

function serializeFeedback(item: Feedback): Record<string, unknown> {
  const out = { ...item } as Record<string, unknown>;
  const createdAt = item.createdAt as { toDate?: () => Date; seconds?: number } | null;
  if (createdAt != null && typeof createdAt.toDate === "function") {
    out.createdAt = { seconds: Math.floor(createdAt.toDate().getTime() / 1000) };
  } else if (createdAt != null && typeof (createdAt as { seconds?: number }).seconds === "number") {
    out.createdAt = { seconds: (createdAt as { seconds: number }).seconds };
  }
  return out;
}

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20
 * Returns { feedback: [], nextCursor: string | null, hasMore: boolean }
 */
export async function GET(req: Request) {
  const start = Date.now();
  console.log("[API] GET /api/feedback start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const cursor = searchParams.get("cursor") ?? "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 50) : 20;

  if (!sessionId || sessionId.trim() === "") {
    return NextResponse.json(
      { error: "Missing sessionId" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const isFirstPage = !cursor || cursor.trim() === "";
    const pageResult = await getSessionFeedbackPageWithStringCursorRepo(
      sessionId,
      limit,
      isFirstPage ? undefined : cursor
    );
    let total: number | undefined;
    let activeCount: number | undefined;
    let resolvedCount: number | undefined;
    if (isFirstPage) {
      total = await getSessionFeedbackCountRepo(sessionId);
      const counts = await getSessionFeedbackCountsRepo(sessionId);
      activeCount = counts.open;
      resolvedCount = counts.resolved;
    }
    const { feedback, nextCursor, hasMore } = pageResult;

    console.log("[API] GET /api/feedback duration:", Date.now() - start);
    return NextResponse.json({
      feedback: feedback.map(serializeFeedback),
      nextCursor,
      hasMore,
      ...(typeof total === "number" && { total }),
      ...(typeof activeCount === "number" && { activeCount }),
      ...(typeof resolvedCount === "number" && { resolvedCount }),
    });
  } catch (err) {
    console.error("GET /api/feedback:", err);
    console.log("[API] GET /api/feedback duration (error):", Date.now() - start);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/** POST /api/feedback — create feedback (ticket) for a session. Returns same shape as GET /api/tickets/:id. */
const POST_BODY_PRIORITY: FeedbackPriority[] = ["low", "medium", "high", "critical"];

export async function POST(req: Request) {
  const start = Date.now();
  console.log("[API] POST /api/feedback start");
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  let body: {
    sessionId?: string;
    title?: string;
    description?: string;
    suggestion?: string;
    screenshotUrl?: string;
    contextSummary?: string;
    actionItems?: string[];
    impact?: string;
    suggestedTags?: string[];
    priority?: string;
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "sessionId is required" },
      { status: 400 }
    );
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!title || !description) {
    return NextResponse.json(
      { success: false, error: "title and description are required" },
      { status: 400 }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }
  if (session.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const meta = body.metadata;
  const priority =
    typeof body.priority === "string" &&
    POST_BODY_PRIORITY.includes(body.priority as FeedbackPriority)
      ? (body.priority as FeedbackPriority)
      : "medium";

  const structuredData = {
    title,
    description,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionItems: Array.isArray(body.actionItems) ? body.actionItems : undefined,
    impact: typeof body.impact === "string" ? body.impact : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    priority,
    screenshotUrl:
      typeof body.screenshotUrl === "string" ? body.screenshotUrl : undefined,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
  };

  try {
    const docRef = await addFeedbackRepo(sessionId, user.uid, structuredData);
    const created = await getFeedbackByIdRepo(docRef.id);
    if (!created) {
      return NextResponse.json(
        { success: false, error: "Feedback created but could not be read" },
        { status: 500 }
      );
    }
    await updateSessionUpdatedAtRepo(sessionId);
    console.log("[API] POST /api/feedback duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(created),
    });
  } catch (err) {
    console.error("POST /api/feedback:", err);
    console.log("[API] POST /api/feedback duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
