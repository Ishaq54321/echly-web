import "server-only";

import {
  resolveAccess,
  buildCapabilities,
  type AccessContext,
} from "@/lib/access/resolveAccess";
import type { AccessRequest } from "@/lib/domain/accessRequest";
import type { SessionInvite } from "@/lib/domain/sessionInvite";
import type { SessionMember } from "@/lib/domain/sessionMember";
import type { Session } from "@/lib/domain/session";
import { MISSING_USER_WORKSPACE_ERROR } from "@/lib/constants/userWorkspace";
import { getInviteByEmail, getSessionMember } from "@/lib/repositories/sessionMembersRepository.server";
import { writeSessionAccessDoc } from "@/lib/repositories/sessionAccessRepository.server";
import { getRequestByUser } from "@/lib/repositories/accessRequestsRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";
import { sessionAccessDocPath } from "@/lib/repositories/sessionPaths";
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
  /** Current access request status for the authenticated user, or null if no request exists. */
  requestStatus: "pending" | "approved" | "rejected" | null;
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

// Short TTL: this cache exists only to dedup parallel fan-out within a single
// request. 250ms covers that window without serving stale "no access" decisions
// across distinct requests, which compounded the view-only invite propagation race.
const ACCESS_CTX_CACHE_TTL_MS = 250;
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
  context: SystemContext
): string {
  return [
    context.identityType,
    context.userId?.trim() ?? "",
    context.workspaceId ?? "",
    sessionId,
  ].join("\x1f");
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
  isWorkspaceMember: boolean;
  hasDirectSessionGrant: boolean;
}): AccessContext {
  const { sessionId, workspaceId, user, role, sessionGranted, isWorkspaceMember, hasDirectSessionGrant } = params;
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
    isWorkspaceMember,
    hasDirectSessionGrant,
  };
}

function accessInputsFromContext(context: SystemContext): {
  user: AccessContextUser | null;
  viewerWorkspaceIdOverride: string | null | undefined;
} {
  if (context.identityType === "USER" && context.userId) {
    const uid = context.userId.trim();
    if (!uid) {
      return {
        user: null,
        viewerWorkspaceIdOverride: undefined,
      };
    }
    const ws = context.workspaceId == null ? "" : context.workspaceId.trim();
    return {
      user: { uid },
      viewerWorkspaceIdOverride: ws !== "" ? ws : undefined,
    };
  }

  return {
    user: null,
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
  workspaceRole?: "OWNER" | "MEMBER" | null;
  effectiveMemberAccess: "view" | "resolve" | null;
  hasDirectSessionGrant: boolean;
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
    workspaceRole,
    effectiveMemberAccess,
    hasDirectSessionGrant,
  } = params;

  const { role, sessionGranted, isWorkspaceMember } = resolveAccess({
    session: {
      id: session.id,
      workspaceId: session.workspaceId.trim(),
      accessLevel: session.accessLevel,
      ownerUserId: session.createdByUserId.trim(),
      generalAccess: session.generalAccess,
    },
    user: user ? { uid: user.uid, workspaceId: userWorkspaceId } : null,
    memberAccess: effectiveMemberAccess,
    workspaceRole: workspaceRole ?? null,
  });

  const access = toAccessContext({
    sessionId: sid,
    workspaceId: session.workspaceId.trim(),
    user,
    role,
    sessionGranted,
    isWorkspaceMember,
    hasDirectSessionGrant,
  });

  return {
    session,
    access,
    request: {
      pendingResolve: resolveAccessRequest?.status === "pending",
      requestStatus:
        resolveAccessRequest?.status === "pending" ||
        resolveAccessRequest?.status === "approved" ||
        resolveAccessRequest?.status === "rejected"
          ? resolveAccessRequest.status
          : null,
    },
    debug: { member, invite, inviteIgnoredReason },
  };
}

/**
 * Cheap access context for a session already proven to be in the viewer's own
 * workspace (caller has verified `session.workspaceId === viewerWorkspaceId`,
 * and `viewerWorkspaceId` is the viewer's canonical workspace from
 * `getUserWorkspaceIdRepo`). Mirrors what {@link resolveAccess} returns for the
 * workspace-member branch WITHOUT the access read fan-out
 * (`getSessionMember` + `getRequestByUser` + `getWorkspaceMemberRepo` +
 * sessionAccess doc).
 *
 * SCOPE: built for the dashboard session-list filter, which consumes only
 * `capabilities.canView` and the `session`. A workspace member always resolves
 * to at least RESOLVER (`canView: true`); this helper returns RESOLVER as a
 * correct lower bound. It deliberately does NOT distinguish workspace OWNER
 * (that needs the workspace-member doc read) and so MUST NOT be used where
 * owner-only capabilities (`canDeleteTicket`) are load-bearing. Per-session
 * surfaces still call the full {@link getAccessContext}.
 */
export function buildWorkspaceMemberAccessContextForList(params: {
  uid: string;
  session: Session;
  viewerWorkspaceId: string;
}): GetAccessContextResult {
  const { uid, session, viewerWorkspaceId } = params;
  const sid = session.id;
  const { role, sessionGranted, isWorkspaceMember } = resolveAccess({
    session: {
      id: session.id,
      workspaceId: session.workspaceId.trim(),
      accessLevel: session.accessLevel,
      ownerUserId: session.createdByUserId.trim(),
      generalAccess: session.generalAccess,
    },
    user: { uid, workspaceId: viewerWorkspaceId },
    memberAccess: null,
    workspaceRole: null,
  });

  const access = toAccessContext({
    sessionId: sid,
    workspaceId: session.workspaceId.trim(),
    user: { uid },
    role,
    sessionGranted,
    isWorkspaceMember,
    hasDirectSessionGrant: true,
  });

  return {
    session,
    access,
    request: { pendingResolve: false, requestStatus: null },
    debug: { member: null, invite: null, inviteIgnoredReason: null },
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

  const { user, viewerWorkspaceIdOverride } =
    accessInputsFromContext(options.context);

  const cacheKey = buildAccessCtxCacheKey(sid, options.context);
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

  if (user == null) {
    // Anonymous viewer: link_view sessions grant public access (the session id is the
    // credential). Restricted sessions fall through with sessionGranted=false → access
    // denied → client renders the "Sign in to request access" UX.
    const result = finalizeAccessContextResult({
      session,
      sid,
      user: null,
      userWorkspaceId: "",
      ...noInviteDebug,
      resolveAccessRequest: null,
      effectiveMemberAccess: null,
      hasDirectSessionGrant: false,
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
  const [member, resolveAccessRequest, workspaceMemberDoc, sessionAccessSnap] =
    await Promise.all([
      getSessionMember(sid, user.uid),
      getRequestByUser(sid, user.uid),
      user.uid
        ? getWorkspaceMemberRepo(session.workspaceId.trim(), user.uid)
        : Promise.resolve(null),
      adminDb.doc(sessionAccessDocPath(user.uid, sid)).get(),
    ]);

  const sessionAccessMirrorLevel: "view" | "resolve" | null = (() => {
    if (!sessionAccessSnap.exists) return null;
    const lvl = sessionAccessSnap.data()?.accessLevel;
    return lvl === "view" || lvl === "resolve" ? lvl : null;
  })();

  // Self-heal: member doc exists with a valid level but the sessionAccess mirror
  // is missing. Recover from pre-Phase-6b legacy data or a one-time dual-write
  // failure by writing the mirror inline. writeSessionAccessDoc upserts so this
  // is idempotent.
  let resolvedSessionAccessMirrorLevel = sessionAccessMirrorLevel;
  if (
    !sessionAccessMirrorLevel
    && member
    && (member.access === "view" || member.access === "resolve")
    && user.uid
    && session.workspaceId
  ) {
    try {
      await writeSessionAccessDoc({
        userId: user.uid,
        sessionId: sid,
        workspaceId: session.workspaceId.trim(),
        accessLevel: member.access,
        addedBy: member.addedBy ?? user.uid,
      });
      resolvedSessionAccessMirrorLevel = member.access;
    } catch (err) {
      console.warn("[getAccessContext] sessionAccess self-heal failed", { uid: user.uid, sid, err });
    }
  }

  const effectiveMemberAccess: "view" | "resolve" | null =
    member?.access ?? resolvedSessionAccessMirrorLevel;

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
      effectiveMemberAccess === "view" || effectiveMemberAccess === "resolve";
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

  // Direct grant = workspace member OR explicit session-level access (member
  // doc OR sessionAccess mirror, after self-heal). link_view alone does NOT
  // qualify because Firestore rules still deny listener attach for users who
  // hold no member/mirror record.
  const hasDirectSessionGrant =
    isWorkspaceMember || effectiveMemberAccess !== null;

  const result = finalizeAccessContextResult({
    session,
    sid,
    user,
    userWorkspaceId: effectiveUserWorkspaceId,
    member,
    invite,
    inviteIgnoredReason,
    resolveAccessRequest,
    workspaceRole: (workspaceMemberDoc?.role as "OWNER" | "MEMBER" | null | undefined) ?? null,
    effectiveMemberAccess,
    hasDirectSessionGrant,
  });
  accessCtxCacheSet(cacheKey, result);
  return result;
}
