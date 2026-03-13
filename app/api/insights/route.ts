import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository";
import { getWorkspace } from "@/lib/repositories/workspacesRepository";
import { assertWorkspaceActive, WORKSPACE_SUSPENDED_RESPONSE } from "@/lib/server/assertWorkspaceActive";
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
    const workspaceId = (await getUserWorkspaceIdRepo(user.uid)) ?? user.uid;
    const workspace = await getWorkspace(workspaceId);
    assertWorkspaceActive(workspace);
    const data = await computeInsights(user.uid);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.message === "WORKSPACE_SUSPENDED") {
      return NextResponse.json(WORKSPACE_SUSPENDED_RESPONSE, { status: 403 });
    }
    console.error("GET /api/insights:", err);
    return NextResponse.json(
      { error: "Failed to load insights" },
      { status: 500 }
    );
  }
}
