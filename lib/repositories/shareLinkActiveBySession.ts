/**
 * Active share_links row for a session — isolated module to avoid Turbopack stale re-exports
 * on `shareLinksRepository` after hot reload.
 */
import { adminDb } from "@/lib/server/firebaseAdmin";

export type ActiveShareLinkIds = { id: string; token: string };

export async function getActiveShareLinkForSession(sessionId: string): Promise<ActiveShareLinkIds | null> {
  const trimmed = sessionId.trim();
  if (!trimmed) return null;

  const snap = await adminDb
    .collection("share_links")
    .where("sessionId", "==", trimmed)
    .where("isActive", "==", true)
    .limit(1)
    .get();
  const d = snap.docs[0];
  if (!d) return null;

  const raw = d.data() as { token?: unknown };
  const token = typeof raw.token === "string" ? raw.token.trim() : "";
  if (!token) return null;

  return { id: d.id, token };
}
