import { NextResponse } from "next/server";
import type { Feedback } from "@/lib/domain/feedback";
import {
  getSessionFeedbackPageWithStringCursorRepo,
  getSessionFeedbackCountRepo,
} from "@/lib/repositories/feedbackRepository";

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

  try {
    const isFirstPage = !cursor || cursor.trim() === "";
    const pageResult = await getSessionFeedbackPageWithStringCursorRepo(
      sessionId,
      limit,
      isFirstPage ? undefined : cursor
    );
    const total = isFirstPage
      ? await getSessionFeedbackCountRepo(sessionId)
      : undefined;
    const { feedback, nextCursor, hasMore } = pageResult;

    return NextResponse.json({
      feedback: feedback.map(serializeFeedback),
      nextCursor,
      hasMore,
      ...(typeof total === "number" && { total }),
    });
  } catch (err) {
    console.error("GET /api/feedback:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
