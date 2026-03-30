import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

export type UserLike = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
}

export function invalidateUserWorkspaceIdCache(uid?: string): void {
  void uid;
}

/** Set or update user's workspaceId (e.g. after onboarding). Creates user doc if missing. */
export async function setUserWorkspaceIdRepo(
  user: UserLike,
  workspaceId: string,
  extra?: { role?: string; companySize?: string }
): Promise<void> {
  const resolvedWorkspaceId = requireUserId(workspaceId, "setUserWorkspaceIdRepo");
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  const payload: Record<string, unknown> = {
    workspaceId: resolvedWorkspaceId,
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
      workspaceId: resolvedWorkspaceId,
      ...(extra?.role && { role: extra.role }),
      ...(extra?.companySize && { companySize: extra.companySize }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.update(payload);
  }
}

export async function updateUserFieldsRepo(
  uid: string,
  updates: { role?: string; companySize?: string }
): Promise<void> {
  const userRef = adminDb.doc(`users/${uid}`);
  const snap = await userRef.get();
  const payload: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (typeof updates.role === "string" && updates.role.trim()) {
    payload.role = updates.role.trim();
  }
  if (typeof updates.companySize === "string" && updates.companySize.trim()) {
    payload.companySize = updates.companySize.trim();
  }

  if (!snap.exists) {
    await userRef.set({
      uid,
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  await userRef.set(payload, { merge: true });
}

/** Ensure a Firestore users/{uid} row exists (no workspace required). Used by POST /api/users before claims sync. */
export async function ensureUserRepo(user: UserLike): Promise<void> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  const email = user.email ?? null;
  const displayName = user.displayName ?? null;

  if (!snap.exists) {
    await userRef.set({
      uid: user.uid,
      email,
      ...(displayName != null && displayName !== ""
        ? { displayName, name: displayName }
        : {}),
      ...(user.photoURL != null ? { photoURL: user.photoURL, avatarUrl: user.photoURL } : {}),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  await userRef.set(
    {
      email,
      ...(displayName != null && displayName !== ""
        ? { displayName, name: displayName }
        : {}),
      ...(user.photoURL != null ? { photoURL: user.photoURL, avatarUrl: user.photoURL } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

/** UIDs minted by {@link createShareAuthToken} — no `users/{uid}` workspace row; API must not load workspace by user. */
export function isShareAuthUid(uid: string): boolean {
  return typeof uid === "string" && uid.startsWith("share_");
}

export async function getUserWorkspaceIdRepo(uid: string): Promise<string> {
  if (isShareAuthUid(uid)) {
    return "";
  }
  const snap = await adminDb.doc(`users/${uid}`).get();
  if (!snap.exists) {
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  const raw = typeof data.workspaceId === "string" ? data.workspaceId : "";
  const workspaceId = raw.trim();
  if (!workspaceId) {
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  return workspaceId;
}

export async function ensureUserWorkspaceLinkRepo(
  user: UserLike
): Promise<{ workspaceId: string }> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  if (!snap.exists) {
    throw new Error("Missing user document");
  }
  const userRow = (snap.data() ?? {}) as Record<string, unknown>;
  const raw =
    typeof userRow.workspaceId === "string" ? userRow.workspaceId.trim() : "";
  if (!raw) {
    throw new Error("Missing workspaceId on user document");
  }
  return { workspaceId: requireUserId(raw, "ensureUserWorkspaceLinkRepo") };
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

