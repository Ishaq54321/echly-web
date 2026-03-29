import type { AccessLevel } from "@/lib/domain/accessLevel";
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
      generalAccess: AccessLevel;
    }
  | { valid: false; reason: ShareTokenFailureReason };

export type ResolvedShareLinkToken = {
  ok: true;
  linkDocId: string;
  sessionId: string;
  userId: string;
  workspaceId: string;
  generalAccess: AccessLevel;
  isActive: boolean;
  expiresAtMs: number | null;
};

export type ResolveShareLinkTokenContextResult =
  | ResolvedShareLinkToken
  | { ok: false; reason: ShareTokenFailureReason };

/**
 * Resolve a share token row for {@link getAccessContext} / {@link resolveAccess}.
 * Missing rows fail; inactive rows return `ok: true` with `isActive: false` so the engine decides.
 * Expired links still return `ok: true` so resolveAccess can downgrade to view.
 */
export async function resolveShareLinkTokenContext(
  token: string
): Promise<ResolveShareLinkTokenContextResult> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 20) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const row = await getShareLinkByToken(trimmed);
  if (!row) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  let expiresAtMs: number | null = null;
  if (row.expiresAt && typeof row.expiresAt.toMillis === "function") {
    expiresAtMs = row.expiresAt.toMillis();
  }

  return {
    ok: true,
    linkDocId: row.id,
    sessionId: row.sessionId,
    userId: row.userId,
    workspaceId: row.workspaceId,
    generalAccess: row.generalAccess,
    isActive: row.isActive,
    expiresAtMs,
  };
}

function touchShareLinkLastAccessed(linkDocId: string): void {
  void (async () => {
    try {
      await updateShareLinkLastAccessedAt(linkDocId);
    } catch {
      /* ignore — non-blocking touch */
    }
  })();
}

/**
 * Strict share token validation (e.g. internal tools): expired and inactive links are rejected.
 */
export async function resolveShareToken(token: string): Promise<ResolveShareTokenResult> {
  const ctx = await resolveShareLinkTokenContext(token);
  if (!ctx.ok) {
    return { valid: false, reason: ctx.reason };
  }

  if (!ctx.isActive) {
    return { valid: false, reason: "INACTIVE" };
  }

  if (ctx.expiresAtMs != null && Date.now() > ctx.expiresAtMs) {
    return { valid: false, reason: "EXPIRED" };
  }

  touchShareLinkLastAccessed(ctx.linkDocId);

  return {
    valid: true,
    sessionId: ctx.sessionId,
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    generalAccess: ctx.generalAccess,
  };
}
