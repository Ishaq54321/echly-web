import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

/** Adds a workspaceId to users/{uid}.workspaceMemberships using arrayUnion (idempotent). */
export async function addWorkspaceMembershipRepo(
  uid: string,
  workspaceId: string
): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);
  // Use set+merge so this works even if the user doc
  // does not exist yet (race condition on first signup)
  await userRef.set(
    { workspaceMemberships: FieldValue.arrayUnion(workspaceId) },
    { merge: true }
  );
}

/** Removes a workspaceId from workspaceMemberships. Used when a user is removed from a workspace. */
export async function removeWorkspaceMembershipRepo(
  uid: string,
  workspaceId: string
): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);
  await userRef.set(
    { workspaceMemberships: FieldValue.arrayRemove(workspaceId) },
    { merge: true }
  );
}
