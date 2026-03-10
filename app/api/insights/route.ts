import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { computeInsights } from "@/lib/analytics/computeInsights";

/**
 * GET /api/insights
 * Returns analytics for the authenticated user (from Firestore).
 */
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    const data = await computeInsights(user.uid);
    return NextResponse.json({
      ticketsCaptured: data.ticketsCaptured,
      repliesMade: data.repliesMade,
      sessionsReviewed: data.sessionsReviewed,
      resolvedDiscussions: data.resolvedDiscussions,
      mostCommentedSessions: data.mostCommentedSessions,
      mostReportedIssueTypes: data.mostReportedIssueTypes,
      responseSpeed: data.responseSpeed,
      mostActiveSession: data.mostActiveSession,
      timeSaved: data.timeSaved,
    });
  } catch (err) {
    console.error("GET /api/insights:", err);
    return NextResponse.json(
      { error: "Failed to load insights" },
      { status: 500 }
    );
  }
}
