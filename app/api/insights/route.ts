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

  const data = await computeInsights(user.uid);
  // Always return both lifetime and last30Days windows, plus additional insights.
  return NextResponse.json(data);
}
