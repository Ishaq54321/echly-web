/**
 * Active share_links row for a session — isolated module to avoid Turbopack stale re-exports
 * on `shareLinksRepository` after hot reload.
 */
import { adminDb } from "@/lib/server/firebaseAdmin";

export type ActiveShareLinkIds = { id: string; token: string; generalAccess: string };

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

  const raw = d.data() as { token?: unknown; generalAccess?: unknown };
  const token = typeof raw.token === "string" ? raw.token.trim() : "";
  if (!token) return null;
  const generalAccess = typeof raw.generalAccess === "string" ? raw.generalAccess : "view";

  return { id: d.id, token, generalAccess };
}

/** Returns the first active link for the session that matches the requested access level.
 *  "view" matches both "view" and legacy "comment" links. */
export async function getActiveShareLinkByAccessForSession(
  sessionId: string,
  access: "view" | "resolve"
): Promise<ActiveShareLinkIds | null> {
  const trimmed = sessionId.trim();
  if (!trimmed) return null;

  const snap = await adminDb
    .collection("share_links")
    .where("sessionId", "==", trimmed)
    .where("isActive", "==", true)
    .get();

  for (const d of snap.docs) {
    const raw = d.data() as { token?: unknown; generalAccess?: unknown };
    const token = typeof raw.token === "string" ? raw.token.trim() : "";
    if (!token) continue;
    const ga = typeof raw.generalAccess === "string" ? raw.generalAccess : "view";
    const matches =
      access === "resolve" ? ga === "resolve" : ga === "view" || ga === "comment";
    if (matches) return { id: d.id, token, generalAccess: ga };
  }
  return null;
}
