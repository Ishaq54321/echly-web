import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { computeInsights } from "@/lib/analytics/computeInsights";

/**
 * GET /api/insights
 * Returns analytics for the authenticated user: lifetime and last-30-days metrics,
 * activity trends, issue type distribution, response speed, and heatmap data.
 * Queries Firestore collections: feedback, comments, sessions (filtered by userId).
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
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/insights:", err);
    return NextResponse.json(
      { error: "Failed to load insights" },
      { status: 500 }
    );
  }
}
