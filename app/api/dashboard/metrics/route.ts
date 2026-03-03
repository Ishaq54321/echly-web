import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserSessionsRepo } from "@/lib/repositories/sessionsRepository";

const METRICS_SESSION_LIMIT = 500;

/**
 * GET /api/dashboard/metrics
 * Returns aggregate metrics from session counters only (no N+1 feedback reads).
 * Auth required. Queries sessions by userId and aggregates server-side.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const sessions = await getUserSessionsRepo(user.uid, METRICS_SESSION_LIMIT);
    let totalOpen = 0;
    let totalResolved = 0;
    let sessionsWithOpen = 0;
    for (const s of sessions) {
      const open = s.openCount ?? 0;
      const resolved = s.resolvedCount ?? 0;
      totalOpen += open;
      totalResolved += resolved;
      if (open > 0) sessionsWithOpen += 1;
    }
    return NextResponse.json({
      totalOpen,
      totalResolved,
      totalSessions: sessions.length,
      sessionsWithOpen,
    });
  } catch (err) {
    console.error("GET /api/dashboard/metrics:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
