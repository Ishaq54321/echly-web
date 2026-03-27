import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { assertQueryLimit } from "@/lib/querySafety";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

export type SessionSharePermission = AccessLevel;

export interface SessionShare {
  id: string;
  sessionId: string;
  email: string;
  permission: SessionSharePermission;
  createdAt?: FirebaseFirestore.Timestamp | Date | null;
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
  const ref = adminDb.doc(`session_shares/${id}`);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({ permission: level });
  } else {
    await ref.set({
      sessionId,
      email: normalizedEmail,
      permission: level,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function listSessionSharesRepo(sessionId: string): Promise<SessionShare[]> {
  assertQueryLimit(SHARES_LIST_LIMIT, "listSessionSharesRepo");
  const snap = await adminDb
    .collection("session_shares")
    .where("sessionId", "==", sessionId)
    .limit(SHARES_LIST_LIMIT)
    .get();
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
  const snap = await adminDb.doc(`session_shares/${id}`).get();
  if (!snap.exists) return null;
  const p = (snap.data() as { permission?: unknown }).permission;
  return typeof p === "string" ? normalizeAccessLevel(p) : null;
}
