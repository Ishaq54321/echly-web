import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ScreenshotStatus = "TEMP" | "ATTACHED";

export interface ScreenshotRecord {
  id: string;
  status: ScreenshotStatus;
  createdAt: Timestamp | null;
  feedbackId?: string | null;
  /** Storage path for cleanup (delete from Firebase Storage when deleting TEMP). */
  storagePath?: string | null;
}

/**
 * Create a new screenshot record with status TEMP.
 * Call this at the start of upload; when feedback is created, update to ATTACHED.
 */
export async function createScreenshotRepoSync(
  screenshotId: string,
  storagePath: string
): Promise<void> {
  const ref = doc(db, "screenshots", screenshotId);
  await setDoc(ref, {
    status: "TEMP",
    createdAt: serverTimestamp(),
    storagePath,
  });
}

/**
 * Get a screenshot record by id.
 */
export async function getScreenshotByIdRepo(
  screenshotId: string
): Promise<ScreenshotRecord | null> {
  const snap = await getDoc(doc(db, "screenshots", screenshotId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    status: (d.status === "ATTACHED" ? "ATTACHED" : "TEMP") as ScreenshotStatus,
    createdAt: (d.createdAt ?? null) as Timestamp | null,
    feedbackId: d.feedbackId ?? null,
    storagePath: d.storagePath ?? null,
  };
}

/**
 * Update screenshot to ATTACHED when feedback is created.
 */
export async function updateScreenshotAttachedRepo(
  screenshotId: string,
  feedbackId: string
): Promise<void> {
  const ref = doc(db, "screenshots", screenshotId);
  await setDoc(
    ref,
    { status: "ATTACHED", feedbackId },
    { merge: true }
  );
}

/**
 * List TEMP screenshots with createdAt older than the given timestamp (ms).
 * Used by cleanup job to delete orphans.
 */
export async function getTempScreenshotsOlderThanRepo(
  createdBeforeMs: number
): Promise<ScreenshotRecord[]> {
  const coll = collection(db, "screenshots");
  const q = query(
    coll,
    where("status", "==", "TEMP")
    // Firestore doesn't support compound inequality on different fields;
  );
  const snapshot = await getDocs(q);
  const results: ScreenshotRecord[] = [];
  for (const s of snapshot.docs) {
    const d = s.data();
    const createdAt = d.createdAt as Timestamp | null | undefined;
    if (!createdAt) continue;
    const ms = typeof createdAt.toDate === "function"
      ? createdAt.toDate().getTime()
      : (createdAt as { seconds?: number }).seconds != null
        ? (createdAt as { seconds: number }).seconds * 1000
        : 0;
    if (ms < createdBeforeMs) {
      results.push({
        id: s.id,
        status: "TEMP",
        createdAt: (d.createdAt ?? null) as Timestamp | null,
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
  await deleteDoc(doc(db, "screenshots", screenshotId));
}
