import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";

export { MISSING_USER_WORKSPACE_ERROR };

const userIdInFlight = new Map<string, Promise<string>>();

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
