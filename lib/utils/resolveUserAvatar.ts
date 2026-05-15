import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";

/**
 * Phase 25.1 — single source of truth for avatars is users/{uid}.avatarUrl,
 * resolved LIVE at read time.
 *
 * Denormalized avatar snapshots on member docs / comment docs / feedback
 * docs / session viewers go stale the moment a user changes their photo
 * (there is no fan-out on upload — see app/api/users/avatar/route.ts).
 * These helpers re-read users/{uid} so endpoints can OVERRIDE the stale
 * snapshot before responding.
 *
 * Note: avatar signed URLs are valid for 10 years (getSignedStorageUrl),
 * so a cached URL never 403s — the only failure mode is staleness/null,
 * which live resolution fixes.
 */
function avatarFromUserData(
  data: FirebaseFirestore.DocumentData | undefined
): string | null {
  const avatarUrl =
    typeof data?.avatarUrl === "string" ? data.avatarUrl.trim() : "";
  if (avatarUrl) return avatarUrl;
  const photoURL =
    typeof data?.photoURL === "string" ? data.photoURL.trim() : "";
  return photoURL || null;
}

/** Resolve the current avatar URL for a single user. Null if unset/missing. */
export async function resolveUserAvatar(uid: string): Promise<string | null> {
  const trimmed = uid?.trim();
  if (!trimmed) return null;
  try {
    const doc = await adminDb.doc(`users/${trimmed}`).get();
    if (!doc.exists) return null;
    return avatarFromUserData(doc.data());
  } catch {
    return null;
  }
}

/**
 * Batch version. Resolves avatars for many uids in one Firestore `getAll`.
 * Returns a Map of uid → avatarUrl (null when the user has no avatar or
 * the user doc is missing). Empty/blank uids are ignored.
 */
export async function resolveUserAvatars(
  uids: Array<string | null | undefined>
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  const uniqueUids = [
    ...new Set(
      uids
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u): u is string => u.length > 0)
    ),
  ];
  if (uniqueUids.length === 0) return result;

  try {
    const refs = uniqueUids.map((uid) => adminDb.doc(`users/${uid}`));
    const snaps = await adminDb.getAll(...refs);
    snaps.forEach((snap, i) => {
      result.set(
        uniqueUids[i]!,
        snap.exists ? avatarFromUserData(snap.data()) : null
      );
    });
  } catch {
    // On a read failure, return nulls rather than throwing — callers fall
    // back to the (possibly stale) snapshot and the UI still renders.
    for (const uid of uniqueUids) {
      if (!result.has(uid)) result.set(uid, null);
    }
  }

  return result;
}
