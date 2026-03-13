import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  workspaceId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await addDoc(collection(db, "adminLogs"), {
    adminId: params.adminId,
    action: params.action,
    workspaceId: params.workspaceId ?? null,
    metadata: params.metadata ?? null,
    timestamp: serverTimestamp(),
  });
}
