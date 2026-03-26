import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertQueryLimit } from "@/lib/querySafety";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

export type SessionSharePermission = AccessLevel;

export interface SessionShare {
  id: string;
  sessionId: string;
  email: string;
  permission: SessionSharePermission;
  createdAt?: Timestamp | null;
}

const SHARES_LIST_LIMIT = 100;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Deterministic doc id: one share row per session + email (Firestore `session_shares` collection). */
export function sessionShareDocId(sessionId: string, email: string): string {
  const normalized = normalizeEmail(email);
  const safe = normalized.replace(/@/g, "_at_").replace(/[^a-z0-9._-]/gi, "_");
  return `${sessionId}_${safe}`;
}

export async function upsertSessionShareRepo(
  sessionId: string,
  email: string,
  permission: SessionSharePermission
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const level = normalizeAccessLevel(permission) as SessionSharePermission;
  const id = sessionShareDocId(sessionId, normalizedEmail);
  const ref = doc(db, "session_shares", id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { permission: level });
  } else {
    await setDoc(ref, {
      sessionId,
      email: normalizedEmail,
      permission: level,
      createdAt: serverTimestamp(),
    });
  }
}

export async function listSessionSharesRepo(sessionId: string): Promise<SessionShare[]> {
  assertQueryLimit(SHARES_LIST_LIMIT, "listSessionSharesRepo");
  const q = query(
    collection(db, "session_shares"),
    where("sessionId", "==", sessionId),
    limit(SHARES_LIST_LIMIT)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const raw = d.data() as Omit<SessionShare, "id">;
    return {
      id: d.id,
      ...raw,
      permission: normalizeAccessLevel(raw.permission) as SessionSharePermission,
    };
  });
}

/** Server-only: lookup invite permission for an email (deterministic doc id). */
export async function getSessionSharePermissionForEmailRepo(
  sessionId: string,
  email: string
): Promise<AccessLevel | null> {
  const id = sessionShareDocId(sessionId, email);
  const snap = await getDoc(doc(db, "session_shares", id));
  if (!snap.exists()) return null;
  const p = (snap.data() as { permission?: unknown }).permission;
  return typeof p === "string" ? normalizeAccessLevel(p) : null;
}
