import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { resolveSessionFeedbackCounts } from "@/lib/server/resolveSessionFeedbackCounts";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { resolveShareToken } from "@/lib/server/shareTokenResolver";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

/**
 * GET /api/feedback/counts?sessionId=ID
 * Returns Firestore-backed aggregation counts independent of pagination.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const token = searchParams.get("token");

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
  const sessionWorkspaceId =
    typeof session.workspaceId === "string" ? session.workspaceId.trim() : "";
  if (!sessionWorkspaceId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let user: Awaited<ReturnType<typeof requireAuth>> | null = null;
  try {
    user = await requireAuth(req);
  } catch {
    user = null;
  }

  if (user) {
    let wid: string;
    try {
      wid = await getUserWorkspaceIdRepo(user.uid);
    } catch {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    if (wid !== sessionWorkspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

  } else {
    const rawToken = typeof token === "string" ? token.trim() : "";
    if (!rawToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const resolved = await resolveShareToken(rawToken);
    if (!resolved.valid || resolved.sessionId !== sessionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ownerMatchesToken = resolved.workspaceId === sessionWorkspaceId;
    if (!ownerMatchesToken) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const counts = await resolveSessionFeedbackCounts(
      sessionId,
      sessionWorkspaceId,
      session as Record<string, unknown>
    );
    return NextResponse.json(counts);
  } catch (err) {
    console.error("GET /api/feedback/counts:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
