import "server-only";

import {
  resolveAccess,
  buildCapabilities,
  type AccessContext,
} from "@/lib/access/resolveAccess";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import type { Session } from "@/lib/domain/session";
import { getShareLinkByToken } from "@/lib/repositories/shareLinksRepository";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { AuthorizationError } from "@/lib/server/auth/authorize";
import type { SessionUser } from "@/lib/server/session";
import type { SystemContext } from "@/lib/server/systemContext";
import { assert } from "@/lib/utils/assert";

export type AccessContextUser = SessionUser | { uid: string; email?: string | null };

type TokenPayload = {
  generalAccess: AccessLevel;
  isActive: boolean;
  expiresAt: number | null;
};

/** Share link is an optional enhancer; only active rows are passed to {@link resolveAccess}. */
function tokenPayloadForResolve(payload: TokenPayload | null) {
  if (!payload?.isActive) return null;
  return {
    generalAccess: payload.generalAccess,
    isActive: true,
    expiresAt: payload.expiresAt,
  };
}

async function loadShareLinkPayloadForSession(
  token: string,
  sessionId: string
): Promise<TokenPayload | null> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length < 20) {
    return null;
  }
  const row = await getShareLinkByToken(trimmed);
  if (!row || row.sessionId.trim() !== sessionId.trim()) {
    return null;
  }

  let expiresAtMs: number | null = null;
  if (row.expiresAt && typeof row.expiresAt.toMillis === "function") {
    expiresAtMs = row.expiresAt.toMillis();
  }

  return {
    generalAccess: row.generalAccess,
    isActive: row.isActive,
    expiresAt: expiresAtMs,
  };
}

function toAccessContext(params: {
  sessionId: string;
  workspaceId: string;
  user: AccessContextUser | null;
  role: AccessContext["role"];
  sessionGranted: boolean;
}): AccessContext {
  const { sessionId, workspaceId, user, role, sessionGranted } = params;
  const userId = user == null ? null : user.uid.trim();
  if (user != null) {
    assert(userId, "Missing user uid for access context");
  }
  return {
    sessionId,
    workspaceId,
    role,
    userId,
    isPublicViewer: user === null,
    capabilities: buildCapabilities(role, userId, sessionGranted),
  };
}

async function loadTokenContext(
  sid: string,
  user: AccessContextUser | null,
  viewerWorkspaceIdOverride: string | null | undefined,
  tokenString: string | undefined
): Promise<{
  userWorkspaceId: string;
  tokenPayload: TokenPayload | null;
}> {
  let userWorkspaceId = "";

  if (user) {
    let ws: string;
    if (viewerWorkspaceIdOverride === undefined) {
      ws = (await getUserWorkspaceIdRepo(user.uid)).trim();
    } else if (viewerWorkspaceIdOverride === null) {
      ws = "";
    } else {
      ws = viewerWorkspaceIdOverride.trim();
    }
    userWorkspaceId = ws;
  }

  let tokenPayload: TokenPayload | null = null;
  if (tokenString) {
    tokenPayload = await loadShareLinkPayloadForSession(tokenString, sid);
  }

  return { userWorkspaceId, tokenPayload };
}

function accessInputsFromContext(context: SystemContext): {
  user: AccessContextUser | null;
  tokenString: string | undefined;
  viewerWorkspaceIdOverride: string | null | undefined;
} {
  if (context.identityType === "USER" && context.userId) {
    const uid = context.userId.trim();
    if (!uid) {
      return {
        user: null,
        tokenString: undefined,
        viewerWorkspaceIdOverride: undefined,
      };
    }
    const ws = context.workspaceId == null ? "" : context.workspaceId.trim();
    return {
      user: { uid },
      tokenString: undefined,
      viewerWorkspaceIdOverride: ws !== "" ? ws : undefined,
    };
  }

  if (context.identityType === "SHARE") {
    const tok =
      context.shareToken == null || context.shareToken === ""
        ? ""
        : context.shareToken.trim();
    return {
      user: null,
      tokenString: tok !== "" ? tok : undefined,
      viewerWorkspaceIdOverride: undefined,
    };
  }

  return {
    user: null,
    tokenString: undefined,
    viewerWorkspaceIdOverride: undefined,
  };
}

export async function getAccessContext(options: {
  sessionId: string;
  context: SystemContext;
  /**
   * When set: use this session row.
   * When omitted: load via `getSessionByIdRepo`.
   */
  session?: Session | null;
}): Promise<{ session: Session; access: AccessContext }> {
  const sid = options.sessionId.trim();
  if (!sid) {
    throw new AuthorizationError("Missing session id", 400, "INVALID_INPUT");
  }

  const { user, tokenString, viewerWorkspaceIdOverride } =
    accessInputsFromContext(options.context);

  const effectiveToken = user == null ? tokenString : undefined;

  const rawSession =
    options.session !== undefined
      ? options.session
      : await getSessionByIdRepo(sid);

  if (!rawSession) {
    throw new AuthorizationError("Not found", 404, "NOT_FOUND");
  }

  const session = rawSession;

  const { userWorkspaceId, tokenPayload } = await loadTokenContext(
    sid,
    user,
    viewerWorkspaceIdOverride,
    effectiveToken
  );

  const { role, sessionGranted } = resolveAccess({
    session: {
      id: session.id,
      workspaceId: session.workspaceId.trim(),
      accessLevel: session.accessLevel,
      ownerUserId: session.createdByUserId.trim(),
      generalAccess: session.generalAccess,
    },
    user: user ? { uid: user.uid, workspaceId: userWorkspaceId } : null,
    token: tokenPayloadForResolve(tokenPayload),
  });

  const access = toAccessContext({
    sessionId: sid,
    workspaceId: session.workspaceId.trim(),
    user,
    role,
    sessionGranted,
  });

  return { session, access };
}
