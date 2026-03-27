import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { resolveWorkspaceById } from "@/lib/server/resolveWorkspaceForUser";
import { WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
import { resolveSessionFeedbackCounts } from "@/lib/server/resolveSessionFeedbackCounts";
import { adminDb } from "@/lib/server/firebaseAdmin";

/**
 * GET /api/feedback/counts?sessionId=ID
 * Returns Firestore-backed aggregation counts independent of pagination.
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

  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }
  const session = sessionSnap.data() as Record<string, unknown> | undefined;
  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }
  const sessionUserId = (session as { userId?: unknown }).userId;
  if (sessionUserId !== user.uid) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const workspaceIdRaw =
    (session as { workspaceId?: unknown }).workspaceId ??
    sessionUserId ??
    (await getUserWorkspaceIdRepo(user.uid)) ??
    user.uid;
  const workspaceId = typeof workspaceIdRaw === "string" ? workspaceIdRaw : user.uid;
  try {
    await resolveWorkspaceById(workspaceId);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    throw err;
  }

  try {
    const counts = await resolveSessionFeedbackCounts(
      sessionId,
      session as Record<string, unknown>
    );
    return NextResponse.json(counts);
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
