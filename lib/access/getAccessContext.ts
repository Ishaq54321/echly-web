import "server-only";

import {
  resolveAccess,
  buildCapabilities,
  type AccessContext,
} from "@/lib/access/resolveAccess";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import type { Session } from "@/lib/domain/session";
import { normalizeGeneralAccess } from "@/lib/domain/session";
import { getSessionSharePermissionForEmailRepo } from "@/lib/repositories/sessionSharesRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import {
  getUserWorkspaceIdRepo,
  isShareAuthUid,
} from "@/lib/repositories/usersRepository.server";
import type { SessionUser } from "@/lib/server/session";
import {
  resolveShareLinkTokenContext,
  type ResolvedShareLinkToken,
} from "@/lib/server/shareTokenResolver";

export type AccessContextUser = SessionUser | { uid: string; email?: string | null };

type TokenPayload = {
  generalAccess: AccessLevel;
  isActive: boolean;
  expiresAt: number | null;
};

/** Baseline policy: every loaded session row participates in resolveAccess with a defined tier. */
function withSessionAccessBaseline(session: Session): Session {
  return {
    ...session,
    accessLevel: normalizeAccessLevel(session.accessLevel ?? "view"),
  };
}

/** Share link is an optional enhancer; only active rows are passed to {@link resolveAccess}. */
function tokenPayloadForResolve(payload: TokenPayload | null) {
  if (!payload?.isActive) return null;
  return {
    generalAccess: payload.generalAccess,
    isActive: true,
    expiresAt: payload.expiresAt,
  };
}

function sessionOwnerUserId(
  session: Pick<Session, "createdBy" | "userId" | "createdByUserId"> | null
): string | null {
  if (!session) return null;
  const canonical = session.createdByUserId?.trim();
  if (canonical) return canonical;
  const fromCreatedBy = session.createdBy?.id?.trim();
  if (fromCreatedBy) return fromCreatedBy;
  const legacyUserId = session.userId?.trim();
  return legacyUserId || null;
}

function toAccessContext(params: {
  sessionId: string;
  workspaceId: string;
  user: AccessContextUser | null;
  role: AccessContext["role"];
}): AccessContext {
  const { sessionId, workspaceId, user, role } = params;
  const userId = user?.uid?.trim() ?? null;
  return {
    sessionId,
    workspaceId,
    role,
    userId,
    isPublicViewer: user === null,
    capabilities: buildCapabilities(role, userId),
  };
}

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

/** Session row missing: no `session.accessLevel` in Firestore — grant access only via invite or an active share link (no orphan baseline). */
function accessForMissingSessionDoc(
  sid: string,
  user: AccessContextUser | null,
  userWorkspaceId: string | null,
  inviteAccess: AccessLevel | null,
  tokenPayload: TokenPayload | null
): AccessContext | null {
  const tokenForResolve = tokenPayloadForResolve(tokenPayload);

  if (inviteAccess == null && tokenForResolve == null) {
    return null;
  }

  const { role } = resolveAccess({
    session: {
      id: sid,
      workspaceId: "",
      accessLevel: normalizeAccessLevel("view"),
      ownerUserId: null,
    },
    user: user ? { uid: user.uid, workspaceId: userWorkspaceId } : null,
    inviteAccess: inviteAccess ?? undefined,
    token: tokenForResolve,
  });

  return toAccessContext({
    sessionId: sid,
    workspaceId: "",
    user,
    role,
  });
}

export async function getAccessContext(options: {
  sessionId: string;
  user: AccessContextUser | null;
  /**
   * Share link token (`?shareToken=` or `x-share-token`). Resolved via {@link resolveShareLinkTokenContext} / `share_links` (no duplicate validation elsewhere).
   * When present with `user: null`, the viewer is a public share identity: {@link AccessContext.isPublicViewer} is true and `userId` on the context is null; role comes from the link (and {@link resolveAccess}).
   */
  tokenString?: string;
  /**
   * When set: use this session row (may be null if already known absent).
   * When omitted: load via `getSessionByIdRepo`.
   */
  session?: Session | null;
  /** When the share link row was already resolved for this request (avoids a second lookup). */
  resolvedShareToken?: ResolvedShareLinkToken;
  /**
   * When defined (including `null` → treat as empty workspace), skips getUserWorkspaceIdRepo.
   * Omit (`undefined`) to always load `users/{uid}.workspaceId` for real users.
   */
  viewerWorkspaceIdOverride?: string | null;
}): Promise<{ session: Session | null; access: AccessContext | null }> {
  const sid = options.sessionId.trim();
  if (!sid) {
    return { session: null, access: null };
  }

  const rawSession =
    options.session !== undefined
      ? options.session
      : await getSessionByIdRepo(sid);

  if (!rawSession) {
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

  const session = withSessionAccessBaseline(rawSession);

  const { userWorkspaceId, inviteAccess, tokenPayload } = await loadInviteAndToken(
    sid,
    options.user,
    options.viewerWorkspaceIdOverride,
    options.tokenString,
    options.resolvedShareToken
  );

  const generalAccess = normalizeGeneralAccess(session.generalAccess);
  if (generalAccess === "restricted") {
    const ownerId = sessionOwnerUserId(session);
    const uid = options.user?.uid?.trim() ?? "";
    const isOwner = uid !== "" && ownerId != null && uid === ownerId;
    const sessionWs = (session.workspaceId ?? "").trim();
    const viewerWs = (userWorkspaceId ?? "").trim();
    const isWorkspaceMember =
      uid !== "" &&
      !isShareAuthUid(uid) &&
      viewerWs !== "" &&
      viewerWs === sessionWs;
    const hasUserAccess = isOwner || isWorkspaceMember;
    const hasShareAccess = tokenPayloadForResolve(tokenPayload) != null;
    if (!hasUserAccess && !hasShareAccess) {
      return {
        session,
        access: {
          sessionId: sid,
          workspaceId: (session.workspaceId ?? "").trim(),
          role: "VIEWER",
          userId: null,
          isPublicViewer: true,
          capabilities: {
            canView: false,
            canComment: false,
            canResolve: false,
            canAssign: false,
            canDeleteOwnComment: false,
            canDeleteTicket: false,
          },
        },
      };
    }
  }

  const { role } = resolveAccess({
    session: {
      id: session.id,
      workspaceId: (session.workspaceId ?? "").trim(),
      accessLevel: normalizeAccessLevel(session.accessLevel ?? "view"),
      ownerUserId: sessionOwnerUserId(session),
    },
    user: options.user
      ? { uid: options.user.uid, workspaceId: userWorkspaceId }
      : null,
    inviteAccess,
    token: tokenPayloadForResolve(tokenPayload),
  });

  const access = toAccessContext({
    sessionId: sid,
    workspaceId: (session.workspaceId ?? "").trim(),
    user: options.user,
    role,
  });

  return { session, access };
}
