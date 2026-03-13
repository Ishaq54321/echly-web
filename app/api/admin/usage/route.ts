import { NextResponse } from "next/server";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAdmin } from "@/lib/server/adminAuth";
import { getWorkspaceSessionCountRepo } from "@/lib/repositories/sessionsRepository";

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
    const workspacesSnap = await getDocs(collection(db, "workspaces"));
    let freeWorkspaces = 0;
    let paidWorkspaces = 0;
    let totalFeedbackCaptured = 0;
    let totalSessions = 0;

    for (const d of workspacesSnap.docs) {
      const data = d.data();
      const plan = data.billing?.plan ?? "free";
      if (plan === "free") freeWorkspaces++;
      else paidWorkspaces++;
      totalFeedbackCaptured += data.usage?.feedbackCreated ?? 0;
      totalSessions += await getWorkspaceSessionCountRepo(d.id);
    }

    const stats: UsageStats = {
      totalWorkspaces: workspacesSnap.size,
      freeWorkspaces,
      paidWorkspaces,
      totalSessions,
      totalFeedbackCaptured,
    };
    return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /api/admin/usage:", err);
    return NextResponse.json({ error: "Failed to get usage" }, { status: 500 });
  }
}
