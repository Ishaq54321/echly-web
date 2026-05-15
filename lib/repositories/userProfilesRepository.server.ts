import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { resolveUserName } from "@/lib/utils/nameSplit";

/**
 * Phase 25.4 — public profile mirror.
 *
 * `users/{uid}` is private (rules: self-read only). Realtime client listeners
 * that need another user's avatar/name — e.g. lib/realtime/userAvatarStore.ts
 * resolving comment authors — cannot read it and fail with permission-denied.
 *
 * This collection is the rules-readable counterpart. It carries ONLY the two
 * fields the UI already displays publicly (display name + avatar) and NEVER
 * email / workspaceId / role / memberships / any private field. Admin SDK
 * writes only; the firestore.rules block denies all client writes.
 *
 * Every server path that mutates a user's name or avatar must call
 * {@link mirrorUserProfile} so the mirror never drifts from users/{uid}.
 * scripts/backfillUserProfiles.ts seeds it for users who predate this.
 */

export interface UserProfileMirror {
  /** Display name via the standard resolveUserName ladder, or null. */
  displayName: string | null;
  /**
   * avatarUrl → photoURL fallback, mirroring avatarFromUserData in
   * lib/utils/resolveUserAvatar.ts and resolveAvatarFromDoc in the client
   * store, so client and server resolve identically.
   */
  avatarUrl: string | null;
}

/** Mirror of avatarFromUserData (resolveUserAvatar.ts) for raw field inputs. */
function pickAvatar(
  avatarUrl: string | null | undefined,
  photoURL: string | null | undefined
): string | null {
  const a = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
  if (a) return a;
  const p = typeof photoURL === "string" ? photoURL.trim() : "";
  return p || null;
}

/**
 * Upsert userProfiles/{uid} from explicit name/avatar inputs.
 *
 * Best-effort: a mirror write must never fail the caller's primary operation
 * (avatar upload, onboarding, name edit). On error we log and swallow — the
 * backfill script and the next profile change both self-heal a missed write.
 */
export async function mirrorUserProfile(
  uid: string,
  input: {
    firstName?: string | null;
    lastName?: string | null;
    authDisplayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    photoURL?: string | null;
  }
): Promise<void> {
  const trimmedUid = uid?.trim();
  if (!trimmedUid) return;

  const displayName =
    resolveUserName({
      firstName: input.firstName,
      lastName: input.lastName,
      authDisplayName: input.authDisplayName,
      email: input.email,
    }) || null;
  const avatarUrl = pickAvatar(input.avatarUrl, input.photoURL);

  try {
    await adminDb.doc(`userProfiles/${trimmedUid}`).set(
      {
        uid: trimmedUid,
        displayName,
        avatarUrl,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("mirrorUserProfile: write failed", { uid: trimmedUid, e });
  }
}

/**
 * Mirror by re-reading users/{uid} — for callers that have already written
 * users/{uid} and want the mirror to reflect the post-write state without
 * threading every field through. Single read; same best-effort contract.
 */
export async function mirrorUserProfileFromUserDoc(uid: string): Promise<void> {
  const trimmedUid = uid?.trim();
  if (!trimmedUid) return;
  try {
    const snap = await adminDb.doc(`users/${trimmedUid}`).get();
    if (!snap.exists) return;
    const d = (snap.data() ?? {}) as Record<string, unknown>;
    await mirrorUserProfile(trimmedUid, {
      firstName: typeof d.firstName === "string" ? d.firstName : null,
      lastName: typeof d.lastName === "string" ? d.lastName : null,
      authDisplayName:
        typeof d.authDisplayName === "string" ? d.authDisplayName : null,
      email: typeof d.email === "string" ? d.email : null,
      avatarUrl: typeof d.avatarUrl === "string" ? d.avatarUrl : null,
      photoURL: typeof d.photoURL === "string" ? d.photoURL : null,
    });
  } catch (e) {
    console.warn("mirrorUserProfileFromUserDoc: failed", { uid: trimmedUid, e });
  }
}
