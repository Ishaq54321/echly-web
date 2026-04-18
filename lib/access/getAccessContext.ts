import "server-only";

import {
  resolveAccess,
  buildCapabilities,
  type AccessContext,
} from "@/lib/access/resolveAccess";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import type { AccessRequest } from "@/lib/domain/accessRequest";
import type { SessionInvite } from "@/lib/domain/sessionInvite";
import type { SessionMember } from "@/lib/domain/sessionMember";
import type { Session } from "@/lib/domain/session";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { getShareLinkByToken } from "@/lib/repositories/shareLinksRepository";
import { getInviteByEmail, getSessionMember } from "@/lib/repositories/sessionMembersRepository.server";
import { getRequestByUser } from "@/lib/repositories/accessRequestsRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { getWorkspaceMemberRepo } from "@/lib/repositories/workspaceMembersRepository.server";
import { AuthorizationError } from "@/lib/server/auth/authorize";
import { adminDb } from "@/lib/server/firebaseAdmin";
import type { SessionUser } from "@/lib/server/session";
import type { SystemContext } from "@/lib/server/systemContext";
import { assert } from "@/lib/utils/assert";

export type AccessContextUser = SessionUser | { uid: string; email?: string | null };

/** Resolve access-request state for UI; does not affect {@link resolveAccess} or roles. */
export type AccessContextRequestAwareness = {
  pendingResolve: boolean;
};

export type GetAccessContextResult = {
  session: Session;
  access: AccessContext;
  request: AccessContextRequestAwareness;
  debug: {
    member: SessionMember | null;
    invite: SessionInvite | null;
    inviteIgnoredReason: "WORKSPACE_MEMBER" | null;
  };
};

type TokenPayload = {
  generalAccess: AccessLevel;
  isActive: boolean;
  expiresAt: number | null;
};

const ACCESS_CTX_CACHE_TTL_MS = 2_000;
const ACCESS_CTX_CACHE_MAX = 200;

type AccessCtxCacheEntry = { exp: number; val: GetAccessContextResult };
const accessCtxCache = new Map<string, AccessCtxCacheEntry>();

function accessCtxCacheGet(key: string): GetAccessContextResult | null {
  const e = accessCtxCache.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    accessCtxCache.delete(key);
    return null;
  }
  return e.val;
}

function accessCtxCacheSet(key: string, val: GetAccessContextResult) {
  if (accessCtxCache.size >= ACCESS_CTX_CACHE_MAX) {
    const first = accessCtxCache.keys().next().value;
    if (first !== undefined) accessCtxCache.delete(first);
  }
  accessCtxCache.set(key, { exp: Date.now() + ACCESS_CTX_CACHE_TTL_MS, val });
}

function buildAccessCtxCacheKey(
  sessionId: string,
  context: SystemContext,
  effectiveToken: string
): string {
  return [
    context.identityType,
    context.userId?.trim() ?? "",
    context.workspaceId ?? "",
    context.shareToken ?? "",
    sessionId,
    effectiveToken,
  ].join("\x1f");
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

async function loadUserEmailAndWorkspaceForAccess(
  uid: string,
  viewerWorkspaceIdOverride: string | null | undefined
): Promise<{ email: string | null; workspaceId: string }> {
  const snap = await adminDb.doc(`users/${uid}`).get();
  const data = (snap.exists ? snap.data() ?? {} : {}) as Record<string, unknown>;
  const emailRaw = data.email;
  const userEmail =
    typeof emailRaw === "string"
      ? emailRaw.trim() || null
      : emailRaw == null
        ? null
        : String(emailRaw).trim() || null;

  if (viewerWorkspaceIdOverride === null) {
    return { email: userEmail, workspaceId: "" };
  }
  if (viewerWorkspaceIdOverride !== undefined) {
    return { email: userEmail, workspaceId: viewerWorkspaceIdOverride.trim() };
  }
  if (!snap.exists) {
    console.error("CRITICAL: User without workspaceId", { uid, reason: "missing_user_doc" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  const rawWs = typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
  if (!rawWs) {
    console.error("CRITICAL: User without workspaceId", { uid, reason: "missing_workspaceId_field" });
    throw new Error(MISSING_USER_WORKSPACE_ERROR);
  }
  return { email: userEmail, workspaceId: rawWs };
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
    const shareTok =
      context.shareToken == null || context.shareToken === ""
        ? ""
        : context.shareToken.trim();
    return {
      user: { uid },
      tokenString: shareTok !== "" ? shareTok : undefined,
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

function finalizeAccessContextResult(params: {
  session: Session;
  sid: string;
  user: AccessContextUser | null;
  userWorkspaceId: string;
  member: SessionMember | null;
  invite: SessionInvite | null;
  inviteIgnoredReason: "WORKSPACE_MEMBER" | null;
  resolveAccessRequest: AccessRequest | null;
  tokenPayload: TokenPayload | null;
}): GetAccessContextResult {
  const {
    session,
    sid,
    user,
    userWorkspaceId,
    member,
    invite,
    inviteIgnoredReason,
    resolveAccessRequest,
    tokenPayload,
  } = params;

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
    memberAccess: member?.access ?? null,
  });

  const access = toAccessContext({
    sessionId: sid,
    workspaceId: session.workspaceId.trim(),
    user,
    role,
    sessionGranted,
  });

  return {
    session,
    access,
    request: { pendingResolve: resolveAccessRequest?.status === "pending" },
    debug: { member, invite, inviteIgnoredReason },
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
  /**
   * When set for an authenticated viewer, skips an extra `users/{uid}` read (e.g. from {@link buildRequestContext}).
   */
  preloadedUserFields?: { email: string | null; workspaceId: string } | null;
}): Promise<GetAccessContextResult> {
  const sid = options.sessionId.trim();
  if (!sid) {
    throw new AuthorizationError("Missing session id", 400, "INVALID_INPUT");
  }

  const { user, tokenString, viewerWorkspaceIdOverride } =
    accessInputsFromContext(options.context);

  const effectiveToken = tokenString?.trim() ?? "";
  const cacheKey = buildAccessCtxCacheKey(sid, options.context, effectiveToken);
  const hit = accessCtxCacheGet(cacheKey);
  if (hit) return hit;

  const sessionPromise =
    options.session !== undefined
      ? Promise.resolve(options.session)
      : getSessionByIdRepo(sid);

  const userFieldsPromise =
    user?.uid == null
      ? Promise.resolve({ email: null as string | null, workspaceId: "" as string })
      : options.preloadedUserFields != null
        ? Promise.resolve(options.preloadedUserFields)
        : loadUserEmailAndWorkspaceForAccess(user.uid, viewerWorkspaceIdOverride);

  const [rawSession, userFields] = await Promise.all([sessionPromise, userFieldsPromise]);

  if (!rawSession) {
    throw new AuthorizationError("Not found", 404, "NOT_FOUND");
  }

  const session = rawSession;
  const userEmail = userFields.email;
  const userWorkspaceId = userFields.workspaceId;

  const noInviteDebug = {
    member: null as SessionMember | null,
    invite: null as SessionInvite | null,
    inviteIgnoredReason: null as "WORKSPACE_MEMBER" | null,
  };

  if (
    user == null &&
    effectiveToken === "" &&
    session.generalAccess === "link_view"
  ) {
    const result = finalizeAccessContextResult({
      session,
      sid,
      user: null,
      userWorkspaceId: "",
      ...noInviteDebug,
      resolveAccessRequest: null,
      tokenPayload: null,
    });
    accessCtxCacheSet(cacheKey, result);
    return result;
  }

  if (user == null) {
    const tokenPayload = effectiveToken
      ? await loadShareLinkPayloadForSession(effectiveToken, sid)
      : null;
    const result = finalizeAccessContextResult({
      session,
      sid,
      user: null,
      userWorkspaceId: "",
      ...noInviteDebug,
      resolveAccessRequest: null,
      tokenPayload,
    });
    accessCtxCacheSet(cacheKey, result);
    return result;
  }

  const isWorkspaceMemberByWorkspaceId =
    Boolean(user.uid) &&
    Boolean(userWorkspaceId) &&
    Boolean(session.workspaceId?.trim()) &&
    userWorkspaceId === session.workspaceId.trim();

  // WORKSPACE-MEMBER: checking subcollection instead of members[] array
  const [member, resolveAccessRequest, tokenPayload, workspaceMemberDoc] =
    await Promise.all([
      getSessionMember(sid, user.uid),
      getRequestByUser(sid, user.uid),
      effectiveToken ? loadShareLinkPayloadForSession(effectiveToken, sid) : Promise.resolve(null),
      !isWorkspaceMemberByWorkspaceId && user.uid
        ? getWorkspaceMemberRepo(session.workspaceId.trim(), user.uid)
        : Promise.resolve(null),
    ]);

  const isWorkspaceMemberBySubcollection = workspaceMemberDoc !== null;
  const isWorkspaceMember =
    isWorkspaceMemberByWorkspaceId || isWorkspaceMemberBySubcollection;

  const effectiveUserWorkspaceId =
    isWorkspaceMemberBySubcollection && !isWorkspaceMemberByWorkspaceId
      ? session.workspaceId.trim()
      : userWorkspaceId;

  let invite: SessionInvite | null = null;
  if (userEmail && !isWorkspaceMember) {
    const hasMemberAccess =
      member?.access === "view" || member?.access === "resolve";
    if (!hasMemberAccess) {
      invite = await getInviteByEmail(sid, userEmail);
    }
  }

  const inviteIgnoredReason =
    isWorkspaceMember && invite ? "WORKSPACE_MEMBER" : null;

  if (isWorkspaceMember && invite) {
    console.warn("Invite ignored: user already in workspace", {
      userId: user.uid,
      email: userEmail,
    });
    invite = null;
  }

  const result = finalizeAccessContextResult({
    session,
    sid,
    user,
    userWorkspaceId: effectiveUserWorkspaceId,
    member,
    invite,
    inviteIgnoredReason,
    resolveAccessRequest,
    tokenPayload,
  });
  accessCtxCacheSet(cacheKey, result);
  return result;
}
