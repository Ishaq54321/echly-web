import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type ScreenshotStatus = "TEMP" | "ATTACHED";

export interface ScreenshotRecord {
  id: string;
  status: ScreenshotStatus;
  createdAt: FirebaseFirestore.Timestamp | Date | null;
  feedbackId?: string | null;
  /** Storage path for cleanup (delete from Firebase Storage when deleting TEMP). */
  storagePath?: string | null;
}

/**
 * Create a new screenshot record with status TEMP.
 * Call this at the start of upload; when feedback is created, update to ATTACHED.
 */
export async function createScreenshotRepoSync(
  userId: string,
  screenshotId: string,
  storagePath: string
): Promise<void> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("Missing userId - invalid state");
  }
  const ref = adminDb.doc(`screenshots/${screenshotId}`);
  await ref.set({
    userId: normalizedUserId,
    status: "TEMP",
    createdAt: FieldValue.serverTimestamp(),
    storagePath,
  });
}

/**
 * Get a screenshot record by id.
 */
export async function getScreenshotByIdRepo(
  screenshotId: string
): Promise<ScreenshotRecord | null> {
  const snap = await adminDb.doc(`screenshots/${screenshotId}`).get();
  if (!snap.exists) return null;
  const d = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    id: snap.id,
    status: (d.status === "ATTACHED" ? "ATTACHED" : "TEMP") as ScreenshotStatus,
    createdAt: (d.createdAt ?? null) as FirebaseFirestore.Timestamp | Date | null,
    feedbackId: (d.feedbackId as string | null | undefined) ?? null,
    storagePath: (d.storagePath as string | null | undefined) ?? null,
  };
}

/**
 * List TEMP screenshots with createdAt older than the given timestamp (ms).
 * Used by cleanup job to delete orphans.
 */
export async function getTempScreenshotsOlderThanRepo(
  createdBeforeMs: number
): Promise<ScreenshotRecord[]> {
  const snapshot = await adminDb.collection("screenshots").where("status", "==", "TEMP").get();
  const results: ScreenshotRecord[] = [];
  for (const s of snapshot.docs) {
    const d = s.data();
    const createdAt = d.createdAt as FirebaseFirestore.Timestamp | Date | null | undefined;
    if (!createdAt) continue;
    const ms =
      createdAt instanceof Date
        ? createdAt.getTime()
        : typeof (createdAt as { toDate?: () => Date }).toDate === "function"
          ? (createdAt as { toDate: () => Date }).toDate().getTime()
          : (createdAt as { seconds?: number }).seconds != null
            ? (createdAt as { seconds: number }).seconds * 1000
            : 0;
    if (ms < createdBeforeMs) {
      results.push({
        id: s.id,
        status: "TEMP",
        createdAt: (d.createdAt ?? null) as FirebaseFirestore.Timestamp | Date | null,
        feedbackId: d.feedbackId ?? null,
        storagePath: d.storagePath ?? null,
      });
    }
  }
  return results;
}

/**
 * Delete a screenshot record (e.g. during cleanup of TEMP orphans).
 */
export async function deleteScreenshotRepo(screenshotId: string): Promise<void> {
  await adminDb.doc(`screenshots/${screenshotId}`).delete();
}
