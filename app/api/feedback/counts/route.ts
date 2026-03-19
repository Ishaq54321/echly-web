import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { getCachedWorkspace } from "@/lib/server/cache/workspaceCache";

/**
 * GET /api/feedback/counts?sessionId=ID
 * Returns Firestore-backed aggregation counts independent of pagination.
 */
export async function GET(req: Request) {
  const safeCount = (value: unknown): number =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

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
    console.time("COUNT_ROUTE");
    try {
      return NextResponse.json({
        open: safeCount(session.openCount),
        resolved: safeCount(session.resolvedCount),
        skipped: safeCount(session.skippedCount),
        total: safeCount(session.totalCount),
      });
    } finally {
      console.timeEnd("COUNT_ROUTE");
    }
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
