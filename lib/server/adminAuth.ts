import { adminDb } from "@/lib/server/firebaseAdmin";
import { apiError } from "@/lib/server/apiResponse";
import { requireAuth } from "@/lib/server/auth";

export interface AdminUser {
  uid: string;
  isAdmin: true;
}

/**
 * Requires authenticated user and checks Firestore users/{uid}.isAdmin === true.
 * Use in admin API routes. Throws Response (401/403) on failure.
 *
 * To grant admin: set the user document in Firestore: users/{uid} with field isAdmin: true.
 */
export async function requireAdmin(request: Request): Promise<AdminUser> {
  const decoded = await requireAuth(request);
  const snap = await adminDb.doc(`users/${decoded.uid}`).get();
  const isAdmin = snap.exists && (snap.data() as { isAdmin?: boolean } | undefined)?.isAdmin === true;

  if (!isAdmin) {
    throw apiError({
      code: "FORBIDDEN",
      message: "Admin access required",
      status: 403,
    });
  }

  return { uid: decoded.uid, isAdmin: true };
}

/**
 * Returns whether the given uid has isAdmin === true in Firestore users collection.
 * Used server-side (e.g. API routes).
 */
export async function isAdminUser(uid: string): Promise<boolean> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  return snap.exists && (snap.data() as { isAdmin?: boolean } | undefined)?.isAdmin === true;
}
