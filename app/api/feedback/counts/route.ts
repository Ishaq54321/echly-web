import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionFeedbackCountsRepo } from "@/lib/repositories/feedbackRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { getCachedWorkspace } from "@/lib/server/cache/workspaceCache";

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

  const workspaceId = session.workspaceId ?? session.userId ?? (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
  try {
    await getCachedWorkspace(workspaceId, () => resolveWorkspaceById(workspaceId));
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    throw err;
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
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    console.error("GET /api/feedback/counts:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
