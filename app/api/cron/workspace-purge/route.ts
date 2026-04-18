// Scheduled daily at 03:00 UTC via vercel.json cron
// Hard-purges workspaces that have passed their 30-day soft-delete window

import { adminDb } from "@/lib/server/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { purgeWorkspaceRepo } from "@/lib/repositories/workspaceMembersRepository.server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!secret || bearer !== secret) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });
  }

  try {
    const now = Timestamp.now();

    const snap = await adminDb
      .collection("workspaces")
      .where("deletedAt", "!=", null)
      .where("deleteScheduledPurgeAt", "<=", now)
      .get();

    let workspacesPurged = 0;
    let errors = 0;

    for (const doc of snap.docs) {
      const data = doc.data() as { deleteScheduledPurgeAt?: { seconds: number } | null };
      // Client-side safety check: only purge if purge date is actually in the past
      const purgeAt = data.deleteScheduledPurgeAt;
      if (!purgeAt || purgeAt.seconds > now.seconds) continue;

      const workspaceId = doc.id;
      console.log(`[PURGE] Starting purge for workspace ${workspaceId}`);

      try {
        const result = await purgeWorkspaceRepo(workspaceId);
        console.log(
          `[PURGE] Completed workspace ${workspaceId}: ${result.sessionsDeleted} sessions, ${result.feedbackDeleted} feedback items deleted`
        );
        workspacesPurged++;
      } catch (err) {
        console.error(`[PURGE] Failed for workspace ${workspaceId}:`, err);
        errors++;
      }
    }

    return apiSuccess({ workspacesPurged, errors });
  } catch (err) {
    console.error("[workspace-purge] Cron error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Cron job failed", status: 500 });
  }
}
