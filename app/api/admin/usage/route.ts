import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository.server";
import type { Workspace } from "@/lib/domain/workspace";

export interface UsageStats {
  totalWorkspaces: number;
  freeWorkspaces: number;
  paidWorkspaces: number;
  totalSessions: number;
  totalFeedbackCaptured: number;
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
    let freeWorkspaces = 0;
    let paidWorkspaces = 0;
    let totalFeedbackCaptured = 0;

    for (const d of docs) {
      const data = d.data();
      const plan = data.billing?.plan ?? "free";
      if (plan === "free") freeWorkspaces++;
      else paidWorkspaces++;
      totalFeedbackCaptured += data.usage?.feedbackCreated ?? 0;
    }

    const sessionCounts = await Promise.all(
      docs.map((d) =>
        getWorkspaceSessionCountRepo(d.id, { id: d.id, ...d.data() } as Workspace)
      )
    );
    const totalSessions = sessionCounts.reduce((a, b) => a + b, 0);

    const stats: UsageStats = {
      totalWorkspaces: workspacesSnap.size,
      freeWorkspaces,
      paidWorkspaces,
      totalSessions,
      totalFeedbackCaptured,
    };
    return apiSuccess(stats);
  } catch (err) {
    console.error("GET /api/admin/usage:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Failed to get usage",
      status: 500,
    });
  }
}
