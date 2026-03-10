import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import { serializeTicket } from "@/lib/server/serializeFeedback";
import {
  addFeedbackWithSessionCountersRepo,
  getFeedbackByIdRepo,
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackCountsRepo,
  getUserFeedbackAllRepo,
  getUserFeedbackWithCommentsRepo,
} from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { log } from "@/lib/utils/logger";
import { updateScreenshotAttachedRepo } from "@/lib/repositories/screenshotsRepository";
import { generateTicketTitle } from "@/lib/tickets/generateTicketTitle";

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

/**
 * GET /api/feedback?sessionId=ID&cursor=XYZ&limit=20
 * Returns { feedback: [], nextCursor: string | null, hasMore: boolean }
 */
export async function GET(req: Request) {
  const start = Date.now();
  log("[API] GET /api/feedback start");
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

  // When sessionId is omitted, return feedback across sessions (Discussion inbox)
  // Use conversationsOnly=true to fetch only feedback with comments (conversation feed)
  if (!sessionId || sessionId.trim() === "") {
    const conversationsOnly = searchParams.get("conversationsOnly") === "true";
    try {
      const feedback = conversationsOnly
        ? await getUserFeedbackWithCommentsRepo(user.uid, limit)
        : await getUserFeedbackAllRepo(user.uid, limit);
      const sessionIds = [...new Set(feedback.map((f) => f.sessionId))];
      const sessions = await Promise.all(
        sessionIds.map((id) => getSessionByIdRepo(id))
      );
      const sessionMap = new Map(
        sessions.filter(Boolean).map((s) => [s!.id, s!.title])
      );
      const enriched = feedback.map((f) => {
        const serialized = serializeFeedback(f) as Record<string, unknown>;
        serialized.sessionName = sessionMap.get(f.sessionId) ?? "Unknown Session";
        return serialized;
      });
      // Sort by lastCommentAt DESC (newest activity first) for discussion inbox
      if (conversationsOnly) {
        enriched.sort((a, b) => {
          const aTs = (a.lastCommentAt as { seconds?: number })?.seconds ?? 0;
          const bTs = (b.lastCommentAt as { seconds?: number })?.seconds ?? 0;
          return bTs - aTs;
        });
      }
      log("[API] GET /api/feedback (all) duration:", Date.now() - start);
      return NextResponse.json({
        feedback: enriched,
        nextCursor: null,
        hasMore: false,
      });
    } catch (err) {
      console.error("GET /api/feedback (all):", err);
      log("[API] GET /api/feedback (all) duration (error):", Date.now() - start);
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }
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
    let skippedCount: number | undefined;
    if (isFirstPage) {
      const hasCounters =
        typeof session.openCount === "number" &&
        typeof session.resolvedCount === "number";
      if (hasCounters) {
        activeCount = session.openCount ?? 0;
        resolvedCount = session.resolvedCount ?? 0;
        skippedCount = session.skippedCount ?? 0;
        total = activeCount + resolvedCount + skippedCount;
      } else {
        const counts = await getSessionFeedbackCountsRepo(sessionId);
        activeCount = counts.open;
        resolvedCount = counts.resolved;
        skippedCount = counts.skipped;
        total = activeCount + resolvedCount + skippedCount;
      }
    }
    const { feedback, nextCursor, hasMore } = pageResult;

    log("[API] GET /api/feedback duration:", Date.now() - start);
    return NextResponse.json({
      feedback: feedback.map(serializeFeedback),
      nextCursor,
      hasMore,
      ...(typeof total === "number" && { total }),
      ...(typeof activeCount === "number" && { activeCount }),
      ...(typeof resolvedCount === "number" && { resolvedCount }),
      ...(typeof skippedCount === "number" && { skippedCount }),
    });
  } catch (err) {
    console.error("GET /api/feedback:", err);
    log("[API] GET /api/feedback duration (error):", Date.now() - start);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/** POST /api/feedback — create feedback (ticket) for a session. Returns same shape as GET /api/tickets/:id. */
export async function POST(req: Request) {
  const start = Date.now();
  log("[API] POST /api/feedback start");
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
    actionSteps?: string[];
    suggestedTags?: string[];
    metadata?: {
      url?: string;
      viewportWidth?: number;
      viewportHeight?: number;
      userAgent?: string;
      clientTimestamp?: number;
    };
    clarityScore?: number;
    clarityStatus?: "clear" | "needs_improvement" | "unclear";
    clarityIssues?: string[];
    clarityConfidence?: number;
    /** Optional: structured instructions from structure-feedback; used to update global instruction graph. */
    extractedInstructions?: Array<{
      intent?: string;
      entity?: string;
      action?: string;
      confidence?: number;
    }>;
    /** Optional: screenshotId from async upload; marks screenshot as ATTACHED to this ticket. */
    screenshotId?: string;
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
  const actionSteps =
    Array.isArray(body.actionSteps)
      ? body.actionSteps.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
      : [];
  const title =
    actionSteps.length > 0
      ? generateTicketTitle(actionSteps)
      : (typeof body.title === "string" ? body.title.trim() : "");
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (!title) {
    return NextResponse.json(
      { success: false, error: "title is required (or provide actionSteps)" },
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

  const structuredData = {
    title,
    description: description || title,
    suggestion: typeof body.suggestion === "string" ? body.suggestion : undefined,
    type: "general" as const,
    contextSummary:
      typeof body.contextSummary === "string" ? body.contextSummary : undefined,
    actionSteps: actionSteps.length > 0 ? actionSteps : undefined,
    suggestedTags: Array.isArray(body.suggestedTags)
      ? body.suggestedTags
      : undefined,
    screenshotUrl:
      typeof body.screenshotUrl === "string" ? body.screenshotUrl : undefined,
    url: meta?.url,
    viewportWidth: meta?.viewportWidth,
    viewportHeight: meta?.viewportHeight,
    userAgent: meta?.userAgent,
    timestamp: meta?.clientTimestamp,
    clarityScore:
      typeof body.clarityScore === "number" && body.clarityScore >= 0 && body.clarityScore <= 100
        ? body.clarityScore
        : undefined,
    clarityStatus:
      body.clarityStatus === "clear" ||
      body.clarityStatus === "needs_improvement" ||
      body.clarityStatus === "unclear"
        ? body.clarityStatus
        : undefined,
    clarityIssues: Array.isArray(body.clarityIssues) ? body.clarityIssues : undefined,
    clarityConfidence:
      typeof body.clarityConfidence === "number" &&
      body.clarityConfidence >= 0 &&
      body.clarityConfidence <= 1
        ? body.clarityConfidence
        : undefined,
  };

  try {
    const docRef = await addFeedbackWithSessionCountersRepo(
      sessionId,
      user.uid,
      structuredData
    );
    const screenshotId =
      typeof body.screenshotId === "string" ? body.screenshotId.trim() : "";
    if (screenshotId) {
      updateScreenshotAttachedRepo(screenshotId, docRef.id).catch((err) => {
        console.error("[feedback] updateScreenshotAttachedRepo failed:", err);
      });
    }
    const created = await getFeedbackByIdRepo(docRef.id);
    if (!created) {
      return NextResponse.json(
        { success: false, error: "Feedback created but could not be read" },
        { status: 500 }
      );
    }

    log("[API] POST /api/feedback duration:", Date.now() - start);
    return NextResponse.json({
      success: true,
      ticket: serializeTicket(created),
    });
  } catch (err) {
    console.error("POST /api/feedback:", err);
    log("[API] POST /api/feedback duration (error):", Date.now() - start);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
