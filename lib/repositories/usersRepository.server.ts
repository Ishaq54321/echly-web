import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import {
  createWorkspaceRepo,
  getWorkspace,
} from "@/lib/repositories/workspacesRepository.server";
import { composeFullName, splitFullName } from "@/lib/utils/nameSplit";
import { mirrorUserProfileFromUserDoc } from "@/lib/repositories/userProfilesRepository.server";
export {
  addWorkspaceMembershipRepo,
  removeWorkspaceMembershipRepo,
} from "@/lib/repositories/userMembershipsRepository.server";

export type UserLike = {
  uid: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Composed name from Firebase Auth — used to seed firstName/lastName when neither is provided. */
  authDisplayName?: string | null;
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

  const composed =
    composeFullName(user.firstName, user.lastName) ||
    (user.authDisplayName?.trim() ?? "");
  const name = composed || "My Workspace";

  await createWorkspaceRepo({
    workspaceId: uid,
    ownerId: uid,
    name,
    logoUrl: user.photoURL ?? null,
    ownerEmail: user.email ?? null,
    ownerName: composed || null,
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
    const split = splitFullName(user.authDisplayName);
    const seedFirstName = (user.firstName?.trim() ?? "") || split.firstName;
    const seedLastName = (user.lastName?.trim() ?? "") || split.lastName;
    await userRef.set({
      uid: user.uid,
      firstName: seedFirstName,
      lastName: seedLastName,
      email: user.email,
      photoURL: user.photoURL,
      workspaceId: resolvedWorkspaceId,
      onboardingCompleted: false,
      ...(extra?.role && { role: extra.role }),
      ...(extra?.companySize && { companySize: extra.companySize }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.update(payload);
  }
  await mirrorUserProfileFromUserDoc(user.uid);
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
  const onboardingCompleted = row.onboardingCompleted === true;
  // Self-heal only for users who SHOULD have a workspace (completed onboarding)
  // but somehow lost it. Mid-onboarding users have workspaceId: null by design.
  if (!wid && onboardingCompleted) {
    await ensureUserRepo({
      uid,
      email: typeof row.email === "string" ? row.email : null,
      firstName: typeof row.firstName === "string" ? row.firstName : null,
      lastName: typeof row.lastName === "string" ? row.lastName : null,
      photoURL: typeof row.photoURL === "string" ? row.photoURL : null,
    });
  }
}

/**
 * Ensure users/{uid} exists. Workspace creation is deferred to onboarding completion
 * (POST /api/onboarding) — fresh signups receive workspaceId: null and complete the
 * onboarding flow before a workspace doc is created.
 *
 * Used by POST /api/users before claims sync.
 */
export async function ensureUserRepo(user: UserLike): Promise<{ workspaceId: string | null; avatarUrl: string | null }> {
  const userRef = adminDb.doc(`users/${user.uid}`);
  const snap = await userRef.get();
  const email = user.email ?? null;
  const priorData = snap.exists
    ? ((snap.data() ?? {}) as Record<string, unknown>)
    : null;

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

  if (!snap.exists) {
    // Fresh signup: create the user doc with workspaceId: null. Workspace will
    // be created when the user completes onboarding (POST /api/onboarding).
    const split = splitFullName(user.authDisplayName);
    const seedFirstName = (user.firstName?.trim() ?? "") || split.firstName;
    const seedLastName = (user.lastName?.trim() ?? "") || split.lastName;
    const newUserDoc: Record<string, unknown> = {
      uid: user.uid,
      email,
      firstName: seedFirstName,
      lastName: seedLastName,
      // Store the raw auth display name so resolveUserName can fall back to it
      // (esp. OAuth users whose firstName/lastName split may end up empty).
      authDisplayName: user.authDisplayName ?? null,
      workspaceId: null,
      onboardingCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (user.photoURL != null) {
      newUserDoc.photoURL = user.photoURL;
      newUserDoc.avatarUrl = user.photoURL;
    }
    await userRef.set(newUserDoc, { merge: true });
    await mirrorUserProfileFromUserDoc(user.uid);

    // Phase 5: fire-and-forget welcome email. The fresh-signup branch only
    // runs when the user doc didn't exist, but two concurrent ensureUserRepo
    // calls could both reach here for the same uid — so claim the
    // emailSends.welcome marker in a transaction and only the winner sends.
    // Signup must never block on (or fail because of) the email send.
    void (async () => {
      try {
        const claimed = await adminDb.runTransaction(async (tx) => {
          const snap = await tx.get(userRef);
          if (snap.data()?.emailSends?.welcome) return false;
          tx.set(
            userRef,
            { emailSends: { welcome: FieldValue.serverTimestamp() } },
            { merge: true }
          );
          return true;
        });
        if (claimed) {
          const { sendWelcomeEmail } = await import(
            "@/lib/email/notificationEmails"
          );
          await sendWelcomeEmail({
            user: {
              uid: user.uid,
              email,
              emailPreferences: undefined,
              firstName: seedFirstName || null,
              lastName: seedLastName || null,
              authDisplayName: user.authDisplayName ?? null,
            },
          });
        }
      } catch (err) {
        console.error("[welcome-email] failed:", err);
      }
    })();

    return { workspaceId: null, avatarUrl: resolvedAvatarUrl };
  }

  // Existing user.
  const priorWid =
    priorData != null && typeof priorData.workspaceId === "string"
      ? priorData.workspaceId.trim()
      : "";
  const onboardingCompleted = priorData?.onboardingCompleted === true;

  let resolvedWorkspaceId: string | null = priorWid || null;

  // Edge-case recovery: a user who completed onboarding somehow lost their
  // workspaceId. Re-resolve via the legacy path. We do NOT run this for
  // unboarded users — they are mid-flow and will create their workspace at
  // step 5 of onboarding.
  if (!priorWid && onboardingCompleted) {
    resolvedWorkspaceId = await resolveOrAssignWorkspaceIdRepo(user, priorData);
  }

  const profile: Record<string, unknown> = {
    uid: user.uid,
    email,
    ...(shouldRefreshGooglePhoto && user.photoURL != null
      ? { photoURL: user.photoURL, avatarUrl: user.photoURL }
      : {}),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (resolvedWorkspaceId) {
    profile.workspaceId = resolvedWorkspaceId;
  }

  await userRef.set(profile, { merge: true });
  await mirrorUserProfileFromUserDoc(user.uid);
  return { workspaceId: resolvedWorkspaceId, avatarUrl: resolvedAvatarUrl };
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
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  workspaceId?: string | null;
  /** Array of all workspaceIds this user is a member of.
   * workspaceId = currently active workspace (unchanged).
   * workspaceMemberships includes workspaceId plus any
   * other workspaces the user has been invited to. */
  workspaceMemberships?: string[];
  isAdmin?: boolean;

  /**
   * Last time the user made an authenticated request. Written by requireAuth,
   * throttled to at most once per hour (see maybeUpdateLastActive in
   * lib/server/auth.ts). Approximate by design — last-write-wins under races.
   */
  lastActiveAt?: Timestamp;

  /**
   * Per-category email opt-out preferences. Field is OPTIONAL: existing users
   * won't have it, and a missing field (or missing key) means that category is
   * still enabled. Always read via getEmailPreferences() in
   * lib/email/preferences.ts so defaults apply. Transactional email
   * (password reset, verification, billing, security) ignores this entirely.
   */
  emailPreferences?: {
    lifecycle: boolean; // welcome, drip, milestone emails
    notifications: boolean; // comment, mention, assignment, session-opened
    digest: boolean; // weekly digest (deferred to post-launch)
    marketing: boolean; // future product announcements
  };

  /**
   * Tracks one-time email sends so cron retries / duplicate triggers don't
   * re-send. Each key is set to the server timestamp of the first send.
   */
  emailSends?: {
    welcome?: Timestamp;
    // Future: day1Capture, day3Sessions, day7InviteTeam, day14CheckIn, inactivity
  };

  [key: string]: unknown;
}

/** Fetch a user document by id from Firestore users/{uid}. Returns null if missing. */
export async function getUserByIdRepo(uid: string): Promise<UserDoc | null> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const data = snap.data() as UserDoc;
  return { ...data, uid: data.uid ?? uid };
}


