import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import { requireAuth } from "@/lib/server/auth";
import {
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackCountRepo,
  getSessionFeedbackCountsRepo,
} from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

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
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
