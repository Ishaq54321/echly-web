import {
  getShareLinkByToken,
  updateShareLinkLastAccessedAt,
} from "@/lib/repositories/shareLinksRepository";

export type ShareTokenFailureReason = "NOT_FOUND" | "EXPIRED" | "INACTIVE";

export type ResolveShareTokenResult =
  | {
      valid: true;
      sessionId: string;
      userId: string;
      workspaceId: string;
      generalAccess: "view" | "comment" | "resolve";
    }
  | { valid: false; reason: ShareTokenFailureReason };

/**
 * Resolve a share token to session + access tier. No auth; pure Firestore lookup + validation.
 */
export async function resolveShareToken(token: string): Promise<ResolveShareTokenResult> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 20) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  const row = await getShareLinkByToken(trimmed);
  if (!row) {
    return { valid: false, reason: "NOT_FOUND" };
  }

  if (!row.isActive) {
    return { valid: false, reason: "INACTIVE" };
  }

  const expiresAt = row.expiresAt;
  if (expiresAt && typeof expiresAt.toMillis === "function") {
    if (expiresAt.toMillis() < Date.now()) {
      return { valid: false, reason: "EXPIRED" };
    }
  }

  void (async () => {
    try {
      await updateShareLinkLastAccessedAt(row.id);
    } catch {
      /* ignore — non-blocking touch */
    }
  })();

  return {
    valid: true,
    sessionId: row.sessionId,
    userId: row.userId,
    workspaceId: row.workspaceId,
    generalAccess: row.generalAccess,
  };
}
