import { doc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { defaultWorkspaceDoc } from "@/lib/domain/workspace";

/** Set or update user's workspaceId (e.g. after onboarding). Creates user doc if missing. */
export async function setUserWorkspaceIdRepo(
  user: User,
  workspaceId: string,
  extra?: { role?: string; companySize?: string }
): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const payload: Record<string, unknown> = {
    workspaceId,
    updatedAt: serverTimestamp(),
    ...(extra?.role && { role: extra.role }),
    ...(extra?.companySize && { companySize: extra.companySize }),
  };
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      workspaceId,
      ...(extra?.role && { role: extra.role }),
      ...(extra?.companySize && { companySize: extra.companySize }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, payload);
  }
}

export async function ensureUserRepo(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserWorkspaceIdRepo(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { workspaceId?: string | null };
  const wid = (data.workspaceId ?? null);
  return typeof wid === "string" && wid.trim() ? wid.trim() : null;
}

export async function ensureUserWorkspaceLinkRepo(user: User): Promise<{ workspaceId: string }> {
  const userRef = doc(db, "users", user.uid);
  const defaultWorkspaceId = user.uid; // migration + default: 1 workspace per user for now

  return await runTransaction(db, async (tx) => {
    // Reads (must all happen before any writes)
    const userSnap = await tx.get(userRef);
    const existingWorkspaceId = userSnap.exists()
      ? ((userSnap.data() as { workspaceId?: string | null }).workspaceId ?? null)
      : null;
    const workspaceId = (existingWorkspaceId ?? defaultWorkspaceId).trim() || defaultWorkspaceId;
    const workspaceRef = doc(db, "workspaces", workspaceId);
    const workspaceSnap = await tx.get(workspaceRef);

    // Writes
    if (!userSnap.exists()) {
      tx.set(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        workspaceId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (!existingWorkspaceId) {
      tx.set(
        userRef,
        {
          workspaceId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (!workspaceSnap.exists()) {
      const payload = defaultWorkspaceDoc({
        ownerId: user.uid,
        name: user.displayName ? `${user.displayName}'s Workspace` : "My Workspace",
        logoUrl: user.photoURL ?? null,
      });
      tx.set(workspaceRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { workspaceId };
  });
}

