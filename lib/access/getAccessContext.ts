import "server-only";

import { resolveAccess, type ResolvedAccess } from "@/lib/access/resolveAccess";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import type { Session } from "@/lib/domain/session";
import { getSessionSharePermissionForEmailRepo } from "@/lib/repositories/sessionSharesRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import type { SessionUser } from "@/lib/server/session";
import {
  resolveShareLinkTokenContext,
  type ResolvedShareLinkToken,
  type ResolveShareLinkTokenContextResult,
} from "@/lib/server/shareTokenResolver";

export type AccessContextUser = SessionUser | { uid: string; email?: string | null };

type TokenPayload = {
  generalAccess: AccessLevel;
  isActive: boolean;
  expiresAt: number | null;
};

async function loadInviteAndToken(
  sid: string,
  user: AccessContextUser | null,
  viewerWorkspaceIdOverride: string | null | undefined,
  tokenString: string | undefined,
  resolvedShareToken: ResolvedShareLinkToken | undefined
): Promise<{
  userWorkspaceId: string | null;
  inviteAccess: AccessLevel | null;
  tokenPayload: TokenPayload | null;
}> {
  let userWorkspaceId: string | null = null;
  let inviteAccess: AccessLevel | null = null;

  if (user) {
    const ws =
      viewerWorkspaceIdOverride !== undefined
        ? String(viewerWorkspaceIdOverride ?? "").trim()
        : (await getUserWorkspaceIdRepo(user.uid)).trim();
    userWorkspaceId = ws || null;
    const email = user.email?.trim();
    if (email) {
      inviteAccess = await getSessionSharePermissionForEmailRepo(sid, email);
    }
  }

  let tokenPayload: TokenPayload | null = null;
  const preResolved = resolvedShareToken;
  if (preResolved && preResolved.sessionId.trim() === sid) {
    tokenPayload = {
      generalAccess: preResolved.generalAccess,
      isActive: preResolved.isActive,
      expiresAt: preResolved.expiresAtMs,
    };
  } else if (tokenString) {
    const ctx = await resolveShareLinkTokenContext(tokenString);
    if (ctx.ok && ctx.sessionId.trim() === sid) {
      tokenPayload = {
        generalAccess: ctx.generalAccess,
        isActive: ctx.isActive,
        expiresAt: ctx.expiresAtMs,
      };
    }
  }

  return { userWorkspaceId, inviteAccess, tokenPayload };
}

/** Session row missing: resolveAccess only when invite or an active link applies (avoids stub fallback-to-view leakage). */
function accessForMissingSessionDoc(
  sid: string,
  user: AccessContextUser | null,
  userWorkspaceId: string | null,
  inviteAccess: AccessLevel | null,
  tokenPayload: TokenPayload | null
): ResolvedAccess | null {
  const tokenForResolve =
    tokenPayload && tokenPayload.isActive
      ? {
          generalAccess: tokenPayload.generalAccess,
          isActive: tokenPayload.isActive,
          expiresAt: tokenPayload.expiresAt,
        }
      : null;

  if (inviteAccess == null && tokenForResolve == null) {
    return null;
  }

  return resolveAccess({
    session: {
      id: sid,
      workspaceId: "",
      accessLevel: normalizeAccessLevel("view"),
    },
    user: user ? { uid: user.uid, workspaceId: userWorkspaceId } : null,
    inviteAccess: inviteAccess ?? undefined,
    token: tokenForResolve,
  });
}

export async function getAccessContext(options: {
  sessionId: string;
  user: AccessContextUser | null;
  /** Raw share URL token; resolved only when `resolvedShareToken` is not passed. */
  tokenString?: string;
  /**
   * When set: use this session row (may be null if already known absent).
   * When omitted: load via `getSessionByIdRepo`.
   */
  session?: Session | null;
  /** When the share link row was already resolved for this request (avoids a second lookup). */
  resolvedShareToken?: ResolvedShareLinkToken;
  /**
   * When set (and `user` is non-null), skips getUserWorkspaceIdRepo and uses the trimmed value
   * (empty string → null workspace for resolveAccess).
   */
  viewerWorkspaceIdOverride?: string | null;
}): Promise<{ session: Session | null; access: ResolvedAccess | null }> {
  const sid = options.sessionId.trim();
  if (!sid) {
    return { session: null, access: null };
  }

  const session =
    options.session !== undefined
      ? options.session
      : await getSessionByIdRepo(sid);

  if (!session) {
    const { userWorkspaceId, inviteAccess, tokenPayload } = await loadInviteAndToken(
      sid,
      options.user,
      options.viewerWorkspaceIdOverride,
      options.tokenString,
      options.resolvedShareToken
    );
    const access = accessForMissingSessionDoc(
      sid,
      options.user,
      userWorkspaceId,
      inviteAccess,
      tokenPayload
    );
    return { session: null, access };
  }

  const { userWorkspaceId, inviteAccess, tokenPayload } = await loadInviteAndToken(
    sid,
    options.user,
    options.viewerWorkspaceIdOverride,
    options.tokenString,
    options.resolvedShareToken
  );

  const access = resolveAccess({
    session: {
      id: session.id,
      workspaceId: (session.workspaceId ?? "").trim(),
      accessLevel: normalizeAccessLevel(session.accessLevel),
    },
    user: options.user
      ? { uid: options.user.uid, workspaceId: userWorkspaceId }
      : null,
    inviteAccess,
    token: tokenPayload,
  });

  return { session, access };
}

/**
 * Public share entry: resolves the URL token then loads session + access in one place.
 * Callers must not run separate token routing / permission logic beyond rate limits.
 */
export async function getAccessContextForPublicShareToken(tokenString: string): Promise<{
  session: Session | null;
  access: ResolvedAccess | null;
  tokenCtx: ResolveShareLinkTokenContextResult;
}> {
  const trimmed = tokenString.trim();
  if (!trimmed) {
    return { session: null, access: null, tokenCtx: { ok: false, reason: "NOT_FOUND" } };
  }
  const tokenCtx = await resolveShareLinkTokenContext(trimmed);
  const sessionId = tokenCtx.ok ? tokenCtx.sessionId.trim() : "";
  if (!sessionId) {
    return { session: null, access: null, tokenCtx };
  }
  const { session, access } = await getAccessContext({
    sessionId,
    user: null,
    resolvedShareToken: tokenCtx.ok ? tokenCtx : undefined,
  });
  return { session, access, tokenCtx };
}
