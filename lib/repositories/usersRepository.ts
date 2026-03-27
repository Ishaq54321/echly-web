import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

export { MISSING_USER_WORKSPACE_ERROR };

const userIdInFlight = new Map<string, Promise<string>>();

export function invalidateUserWorkspaceIdCache(uid?: string): void {
  if (uid) {
    userIdInFlight.delete(uid);
    return;
  }
  userIdInFlight.clear();
}

/** @deprecated Client cannot set workspaceId; use POST /api/workspaces for onboarding. */
export async function setUserWorkspaceIdRepo(
  _user: User,
  _workspaceId: string,
  _extra?: { role?: string; companySize?: string }
): Promise<void> {
  throw new Error("workspaceId is server-controlled only; use POST /api/workspaces to create a workspace.");
}

export async function ensureUserRepo(user: User): Promise<void> {
  const res = await authFetch("/api/users", { method: "POST" });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to ensure user: ${msg}`);
  }
  userIdInFlight.delete(user.uid);
}

export async function getUserWorkspaceIdRepo(uid: string): Promise<string> {
  const inFlight = userIdInFlight.get(uid);
  if (inFlight) return inFlight;

  const loadPromise = (async () => {
    const ref = doc(db, "users", uid);
    let snap;
    try {
      snap = await getDocFromServer(ref);
    } catch {
      snap = await getDoc(ref);
    }
    if (!snap.exists()) {
      throw new Error(MISSING_USER_WORKSPACE_ERROR);
    }
    const data = (snap.data() ?? {}) as Record<string, unknown>;
    const raw = typeof data.workspaceId === "string" ? data.workspaceId : "";
    const workspaceId = raw.trim();
    if (!workspaceId) {
      throw new Error(MISSING_USER_WORKSPACE_ERROR);
    }
    return workspaceId;
  })();

  userIdInFlight.set(uid, loadPromise);
  try {
    return await loadPromise;
  } finally {
    userIdInFlight.delete(uid);
  }
}

/** @deprecated Client writes removed. Uses server API route (/api/users POST). */
export async function ensureUserWorkspaceLinkRepo(user: User): Promise<{ workspaceId: string }> {
  const res = await authFetch("/api/users", { method: "POST" });
  if (!res || !res.ok) {
    const msg = res ? await res.text() : "Not authenticated";
    throw new Error(`Failed to ensure user workspace link: ${msg}`);
  }
  const payload = (await res.json()) as Record<string, unknown>;
  const wid =
    typeof payload.workspaceId === "string" && payload.workspaceId.trim()
      ? payload.workspaceId.trim()
      : "";
  if (!wid) {
    throw new Error("Missing workspaceId on user document");
  }
  return { workspaceId: wid };
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
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserDoc;
  return { ...data, uid: data.uid ?? uid };
}


