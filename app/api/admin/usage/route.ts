import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";

export interface UsageStats {
  totalWorkspaces: number;
  starterWorkspaces: number;
  paidWorkspaces: number;
  totalFeedbackCaptured: number;
  totalFeedbackThisMonth: number;
  avgFeedbackTicketsThisMonth: number;
}

/**
 * GET /api/admin/usage
 * Returns aggregate usage stats for the platform.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch (e) {
    return e as Response;
  }
  try {
    const workspacesSnap = await adminDb.collection("workspaces").get();
    const docs = workspacesSnap.docs;
    let starterWorkspaces = 0;
    let paidWorkspaces = 0;
    let totalFeedbackCaptured = 0;
    let totalFeedbackThisMonth = 0;

    for (const d of docs) {
      const data = d.data();
      const plan = data.billing?.plan ?? "starter";
      if (plan === "starter") starterWorkspaces++;
      else paidWorkspaces++;
      totalFeedbackCaptured += data.usage?.feedbackCreated ?? 0;
      totalFeedbackThisMonth += data.usage?.feedbackCreatedThisMonth ?? 0;
    }

    const avgFeedbackTicketsThisMonth =
      docs.length > 0 ? Math.round(totalFeedbackThisMonth / docs.length) : 0;

    const stats: UsageStats = {
      totalWorkspaces: workspacesSnap.size,
      starterWorkspaces,
      paidWorkspaces,
      totalFeedbackCaptured,
      totalFeedbackThisMonth,
      avgFeedbackTicketsThisMonth,
    };
    return apiSuccess(stats);
  } catch (err) {
    console.error("GET /api/admin/usage:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Failed to get usage", status: 500 });
  }
}
