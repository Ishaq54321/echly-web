// Scheduled daily at 09:00 UTC via vercel.json cron
// Sends day-25 reminder emails for expiring workspace invitations

import { adminDb } from "@/lib/server/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  updateWorkspaceInvitationRepo,
} from "@/lib/repositories/workspaceMembersRepository.server";
import { sendWorkspaceInviteReminderEmail } from "@/lib/email/workspaceEmails";
import type { WorkspaceInvitation } from "@/lib/domain/workspaceInvitation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!secret || bearer !== secret) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized", status: 401 });
  }

  try {
    const now = Date.now();
    // Invitations created 25–26 days ago (1-day window to avoid duplicate sends)
    const reminderWindowStart = Timestamp.fromMillis(now - 26 * 24 * 60 * 60 * 1000);
    const reminderWindowEnd = Timestamp.fromMillis(now - 25 * 24 * 60 * 60 * 1000);

    const snap = await adminDb
      .collection("workspaceInvitations")
      .where("status", "==", "pending")
      .where("createdAt", ">=", reminderWindowStart)
      .where("createdAt", "<=", reminderWindowEnd)
      .get();

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const doc of snap.docs) {
      const data = doc.data() as Omit<WorkspaceInvitation, "id">;
      // Skip if reminder already sent
      if (data.reminderSentAt != null) {
        processed++;
        continue;
      }

      processed++;
      const expiresInDays = 5;

      try {
        await sendWorkspaceInviteReminderEmail({
          to: data.email,
          workspaceName: data.workspaceName,
          token: doc.id,
          expiresInDays,
        });
        await updateWorkspaceInvitationRepo(doc.id, {
          reminderSentAt: Timestamp.now(),
        });
        sent++;
      } catch (err) {
        console.error(`[invite-reminders] Failed for token ${doc.id}:`, err);
        failed++;
      }
    }

    return apiSuccess({ processed, sent, failed });
  } catch (err) {
    console.error("[invite-reminders] Cron error:", err);
    return apiError({ code: "INTERNAL_ERROR", message: "Cron job failed", status: 500 });
  }
}
