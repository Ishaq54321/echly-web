import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await adminDb.collection("adminLogs").add({
      adminId: params.adminId,
      action: params.action,
      workspaceId: params.workspaceId ?? null,
      metadata: params.metadata ?? null,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("ADMIN LOG WRITE FAILED", err);
  }
}
