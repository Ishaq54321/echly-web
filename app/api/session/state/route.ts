import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getSessionByIdRepo, updateSessionStatusRepo } from "@/lib/repositories/sessionsRepository";
import { corsHeaders } from "@/lib/server/cors";

export const dynamic = "force-dynamic";

type SessionStateAction = "pause" | "resume" | "end";

const ACTION_TO_STATUS: Record<SessionStateAction, "active" | "paused" | "ended"> = {
  pause: "paused",
  resume: "active",
  end: "ended",
};

/**
 * POST /api/session/state
 * Body: { sessionId: string, action: "pause" | "resume" | "end" }
 * Returns: { success: true, status: "active" | "paused" | "ended" }
 */
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    const errRes = res as Response;
    return new NextResponse(errRes.body, {
      status: errRes.status,
      statusText: errRes.statusText,
      headers: { ...Object.fromEntries(errRes.headers), ...corsHeaders(request) },
    });
  }

  let body: { sessionId?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const action = body.action as SessionStateAction | undefined;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing sessionId" },
      { status: 400, headers: corsHeaders(request) }
    );
  }
  if (!action || !["pause", "resume", "end"].includes(action)) {
    return NextResponse.json(
      { success: false, error: "Invalid action; use pause, resume, or end" },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const session = await getSessionByIdRepo(sessionId);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404, headers: corsHeaders(request) }
    );
  }

  if (session.userId !== user.uid) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403, headers: corsHeaders(request) }
    );
  }

  const status = ACTION_TO_STATUS[action];
  await updateSessionStatusRepo(sessionId, status);

  return NextResponse.json(
    { success: true, status },
    { headers: corsHeaders(request) }
  );
}
