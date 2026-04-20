import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import {
  createWorkspaceRepo,
  getWorkspace,
} from "@/lib/repositories/workspacesRepository.server";
export {
  addWorkspaceMembershipRepo,
  removeWorkspaceMembershipRepo,
} from "@/lib/repositories/userMembershipsRepository.server";

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

/**
 * Resolves a non-empty workspace id for the user: reuse valid existing link,
 * canonical workspaces/{uid}, any workspace owned by uid, or create workspaces/{uid}.
 */
async function resolveOrAssignWorkspaceIdRepo(
  user: UserLike,
  priorData: Record<string, unknown> | null
): Promise<string> {
  const uid = requireUserId(user.uid, "resolveOrAssignWorkspaceIdRepo");
  const priorWid =
    typeof priorData?.workspaceId === "string"
      ? priorData.workspaceId.trim()
      : "";

  if (priorWid) {
    const linked = await getWorkspace(priorWid);
    if (linked) {
      return priorWid;
    }
    console.error("CRITICAL: User without workspaceId (stale workspaceId)", {
      uid,
      priorWid,
    });
  }

  // INV-002 FIX: also skip workspace creation if the user already has
  // workspace memberships (e.g. they accepted an invite before this ran)
  const memberships = Array.isArray(priorData?.workspaceMemberships)
    ? (priorData.workspaceMemberships as unknown[])
    : [];
  if (memberships.length > 0) {
    const firstMembership = memberships[0];
    if (typeof firstMembership === "string" && firstMembership.trim()) {
      return firstMembership.trim();
    }
  }

  const canonical = await getWorkspace(uid);
  if (canonical) {
    return uid;
  }

  const ownedSnap = await adminDb
    .collection("workspaces")
    .where("ownerId", "==", uid)
    .limit(1)
    .get();
  if (!ownedSnap.empty) {
    return ownedSnap.docs[0].id;
  }

  const displayName = user.displayName ?? null;
  const name =
    typeof displayName === "string" && displayName.trim()
      ? displayName.trim()
      : "My Workspace";

  await createWorkspaceRepo({
    userId: uid,
    ownerId: uid,
    name,
    logoUrl: user.photoURL ?? null,
    ownerEmail: user.email ?? null,
    ownerName: typeof user.displayName === "string" && user.displayName.trim() ? user.displayName.trim() : null,
  });
  return uid;
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
    await ensureUserRepo({ uid });
    await userRef.set(payload, { merge: true });
    return;
  }

  await userRef.set(payload, { merge: true });

  const row = ((await userRef.get()).data() ?? {}) as Record<string, unknown>;
  const wid =
    typeof row.workspaceId === "string" ? row.workspaceId.trim() : "";
  if (!wid) {
    await ensureUserRepo({
      uid,
      email: typeof row.email === "string" ? row.email : null,
      displayName:
        typeof row.displayName === "string"
          ? row.displayName
          : typeof row.name === "string"
            ? row.name
            : null,
      photoURL: typeof row.photoURL === "string" ? row.photoURL : null,
    });
  }
}

/**
 * Ensure users/{uid} exists and always has a valid workspaceId (create or link workspace as needed).
 * Used by POST /api/users before claims sync.
 */
export async function ensureUserRepo(user: UserLike): Promise<{ workspaceId: string; avatarUrl: string | null }> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  const email = user.email ?? null;
  const displayName = user.displayName ?? null;
  const priorData = snap.exists
    ? ((snap.data() ?? {}) as Record<string, unknown>)
    : null;

  const workspaceId = await resolveOrAssignWorkspaceIdRepo(user, priorData);

  const existingPhotoURL =
    priorData != null && typeof priorData.photoURL === "string"
      ? priorData.photoURL
      : null;
  const existingAvatarUrl =
    priorData != null && typeof priorData.avatarUrl === "string"
      ? priorData.avatarUrl
      : null;
  const hasCustomAvatar =
    typeof existingAvatarUrl === "string" &&
    existingAvatarUrl.includes("firebasestorage");

  const shouldRefreshGooglePhoto =
    user.photoURL != null &&
    user.photoURL !== existingPhotoURL &&
    !hasCustomAvatar;

  const resolvedAvatarUrl =
    (!snap.exists || shouldRefreshGooglePhoto) && user.photoURL != null
      ? user.photoURL
      : (existingAvatarUrl ?? null);

  const profile = {
    uid: user.uid,
    email,
    ...(displayName != null && displayName !== ""
      ? { displayName, name: displayName }
      : {}),
    ...(!snap.exists || shouldRefreshGooglePhoto
      ? user.photoURL != null
        ? { photoURL: user.photoURL, avatarUrl: user.photoURL }
        : {}
      : {}),
    workspaceId,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    await userRef.set({
      ...profile,
      workspaceMemberships: [],
      createdAt: FieldValue.serverTimestamp(),
    });
    return { workspaceId, avatarUrl: resolvedAvatarUrl };
  }

  await userRef.set(profile, { merge: true });
  return { workspaceId, avatarUrl: resolvedAvatarUrl };
}

/** Returns the user's workspace id or throws — never a null/empty success path. */
export async function getUserWorkspaceIdRepo(uid: string): Promise<string> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  if (!snap.exists) {
    console.error("CRITICAL: User without workspaceId", { uid, reason: "missing_user_doc" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  const raw = typeof data.workspaceId === "string" ? data.workspaceId : "";
  const workspaceId = raw.trim();
  if (!workspaceId) {
    console.error("CRITICAL: User without workspaceId", { uid, reason: "missing_workspaceId_field" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  return workspaceId;
}

/**
 * Single `users/{uid}` read for {@link buildRequestContext} + {@link getAccessContext}.
 * Mirrors {@link loadUserEmailAndWorkspaceForAccess} semantics (override skips workspace field from doc).
 */
export async function getUserProfileForRequestContextRepo(
  uid: string,
  workspaceIdOverride?: string
): Promise<{ email: string | null; workspaceId: string }> {
  const trimmedUid = uid.trim();
  if (!trimmedUid) {
    throw new Error("getUserProfileForRequestContextRepo: missing uid");
  }
  const snap = await adminDb.doc(`users/${trimmedUid}`).get();
  const data = (snap.exists ? snap.data() ?? {} : {}) as Record<string, unknown>;
  const emailRaw = data.email;
  const userEmail =
    typeof emailRaw === "string"
      ? emailRaw.trim() || null
      : emailRaw == null
        ? null
        : String(emailRaw).trim() || null;

  if (workspaceIdOverride !== undefined) {
    return { email: userEmail, workspaceId: workspaceIdOverride.trim() };
  }
  if (!snap.exists) {
    console.error("CRITICAL: User without workspaceId", { uid: trimmedUid, reason: "missing_user_doc" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  const rawWs = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
  if (!rawWs) {
    console.error("CRITICAL: User without workspaceId", { uid: trimmedUid, reason: "missing_workspaceId_field" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  return { email: userEmail, workspaceId: rawWs };
}

export async function ensureUserWorkspaceLinkRepo(
  user: UserLike
): Promise<{ workspaceId: string }> {
  const workspaceId = await getUserWorkspaceIdRepo(user.uid);
  return { workspaceId: requireUserId(workspaceId, "ensureUserWorkspaceLinkRepo") };
}

export interface UserDoc {
  uid: string;
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  workspaceId?: string | null;
  /** Array of all workspaceIds this user is a member of.
   * workspaceId = currently active workspace (unchanged).
   * workspaceMemberships includes workspaceId plus any
   * other workspaces the user has been invited to. */
  workspaceMemberships?: string[];
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


