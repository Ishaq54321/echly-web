import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const userRef = doc(db, "users", decoded.uid);
  const snap = await getDoc(userRef);
  const isAdmin = snap.exists() && (snap.data() as { isAdmin?: boolean }).isAdmin === true;

  if (!isAdmin) {
    throw new Response(
      JSON.stringify({ error: "Forbidden - Admin access required" }),
      { status: 403 }
    );
  }

  return { uid: decoded.uid, isAdmin: true };
}

/**
 * Returns whether the given uid has isAdmin === true in Firestore users collection.
 * Used server-side (e.g. API routes).
 */
export async function isAdminUser(uid: string): Promise<boolean> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() && (snap.data() as { isAdmin?: boolean }).isAdmin === true;
}
