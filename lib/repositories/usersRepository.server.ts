import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";

export type UserLike = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export function invalidateUserWorkspaceIdCache(uid?: string): void {
  void uid;
}

/** Set or update user's workspaceId (e.g. after onboarding). Creates user doc if missing. */
export async function setUserWorkspaceIdRepo(
  user: UserLike,
  workspaceId: string,
  extra?: { role?: string; companySize?: string }
): Promise<void> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  const payload: Record<string, unknown> = {
    workspaceId,
    updatedAt: FieldValue.serverTimestamp(),
    ...(extra?.role && { role: extra.role }),
    ...(extra?.companySize && { companySize: extra.companySize }),
  };
  if (!snap.exists) {
    await userRef.set({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      workspaceId,
      ...(extra?.role && { role: extra.role }),
      ...(extra?.companySize && { companySize: extra.companySize }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.update(payload);
  }
}

export async function ensureUserRepo(user: UserLike): Promise<void> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await userRef.set({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function getUserWorkspaceIdRepo(uid: string): Promise<string | null> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const data = snap.data() as { workspaceId?: string | null };
  const wid = data.workspaceId ?? null;
  return typeof wid === "string" && wid.trim() ? wid.trim() : null;
}

export async function ensureUserWorkspaceLinkRepo(
  user: UserLike
): Promise<{ workspaceId: string }> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const defaultWorkspaceId = user.uid; // migration + default: 1 workspace per user for now

  const result = await adminDb.runTransaction(async (tx) => {
    // Reads (must all happen before any writes)
    const userSnap = await tx.get(userRef);
    const existingWorkspaceId = userSnap.exists
      ? ((userSnap.data() as { workspaceId?: string | null }).workspaceId ?? null)
      : null;
    const workspaceId = (existingWorkspaceId ?? defaultWorkspaceId).trim() || defaultWorkspaceId;
    const workspaceRef = adminDb.doc(`workspaces/${workspaceId}`);
    const workspaceSnap = await tx.get(workspaceRef);

    // Writes
    if (!userSnap.exists) {
      tx.set(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        workspaceId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (!existingWorkspaceId) {
      tx.set(
        userRef,
        {
          workspaceId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (!workspaceSnap.exists) {
      const payload = defaultWorkspaceDoc({
        ownerId: user.uid,
        name: user.displayName ? `${user.displayName}'s Workspace` : "My Workspace",
        logoUrl: user.photoURL ?? null,
      });
      tx.set(workspaceRef, {
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { workspaceId };
  });
  return result;
}

export interface UserDoc {
  uid: string;
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  workspaceId?: string | null;
  isAdmin?: boolean;
  [key: string]: unknown;
}

/** Fetch a user document by id from Firestore users/{uid}. Returns null if missing. */
export async function getUserByIdRepo(uid: string): Promise<UserDoc | null> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const data = snap.data() as UserDoc;
  return { ...data, uid: data.uid ?? uid };
}

