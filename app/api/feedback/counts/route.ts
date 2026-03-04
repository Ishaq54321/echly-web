import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionFeedbackCountsRepo } from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";

/**
 * GET /api/feedback/counts?sessionId=ID
 * Lightweight: returns only total, openCount, resolvedCount for immediate display.
 * Use to avoid count flicker (0 → N) while paginated list loads.
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
    const hasCounters =
      typeof session.openCount === "number" &&
      typeof session.resolvedCount === "number";
    let openCount: number;
    let resolvedCount: number;
    let skippedCount: number;
    if (hasCounters) {
      openCount = session.openCount ?? 0;
      resolvedCount = session.resolvedCount ?? 0;
      skippedCount = session.skippedCount ?? 0;
    } else {
      const counts = await getSessionFeedbackCountsRepo(sessionId);
      openCount = counts.open;
      resolvedCount = counts.resolved;
      skippedCount = counts.skipped;
    }
    const total = openCount + resolvedCount + skippedCount;
    return NextResponse.json({ total, openCount, resolvedCount, skippedCount });
  } catch (err) {
    console.error("GET /api/feedback/counts:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
