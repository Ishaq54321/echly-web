import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

export type { AccessLevel };

export type Role = "COMMENTER" | "RESOLVER" | "OWNER" | "VIEWER";

export type AccessCapabilities = {
  canView: boolean;
  canComment: boolean;
  canResolve: boolean;
  canAssign: boolean;
  canDeleteOwnComment: boolean;
  canDeleteTicket: boolean;
};

export type AccessContext = {
  sessionId: string;
  workspaceId: string;
  role: Role;
  isPublicViewer: boolean;
  userId: string | null;
  capabilities: AccessCapabilities;
};

export function buildCapabilities(
  role: Role,
  userId: string | null
): AccessCapabilities {
  if (role === "VIEWER") {
    return {
      canView: false,
      canComment: false,
      canResolve: false,
      canAssign: false,
      canDeleteOwnComment: false,
      canDeleteTicket: false,
    };
  }

  const isAuthenticated = !!userId;

  return {
    canView: true,

    canComment: isAuthenticated, // login required

    canResolve: isAuthenticated && (role === "RESOLVER" || role === "OWNER"),

    canAssign: isAuthenticated && (role === "RESOLVER" || role === "OWNER"), // future safe

    canDeleteOwnComment: isAuthenticated,

    canDeleteTicket: isAuthenticated && role === "OWNER",
  };
}

/** Client/API JSON fragment for `access` on session and ticket responses. */
export function accessContextToResponseBody(access: AccessContext): Record<string, unknown> {
  return {
    sessionId: access.sessionId,
    workspaceId: access.workspaceId,
    role: access.role,
    userId: access.userId,
    isPublicViewer: access.isPublicViewer,
    capabilities: access.capabilities,
  };
}

/** UI: discussion header action bar; `canDefer` reserved for product parity. */
export type ShareSurfacePermissions = AccessCapabilities & { canDefer: false };

export function toShareSurfacePermissions(access: AccessContext): ShareSurfacePermissions {
  return { ...access.capabilities, canDefer: false };
}

type ResolveAccessInput = {
  session: {
    id: string;
    workspaceId: string;
    accessLevel: AccessLevel;
    /** Session owner uid: canonical `createdByUserId`, else `createdBy.id` / legacy `userId`. */
    ownerUserId?: string | null;
  };
  user: {
    uid: string;
    workspaceId?: string | null;
  } | null;
  /** Email-invite tier when the viewer is not a workspace member. */
  inviteAccess?: AccessLevel | null;
  token?: {
    generalAccess: AccessLevel;
    isActive: boolean;
    expiresAt?: number | null;
  } | null;
};

export type ResolveAccessResult = { role: Role };

/**
 * Single permission engine for role. Precedence for effective tier (before role mapping):
 * 1. Workspace membership (same workspace as session → resolve tier)
 * 2. Email invite row (`inviteAccess`)
 * 3. Active share link token (`token`) — optional; never required for access
 * 4. Session default (`session.accessLevel`, fallback `"view"`)
 *
 * Role mapping: session owner → OWNER; effective tier resolve → RESOLVER; else COMMENTER.
 * When `token` is null, omitted, inactive, or expired (handled here via expiresAt), the session baseline applies.
 */
export function resolveAccess(input: ResolveAccessInput): ResolveAccessResult {
  const { session, user, inviteAccess, token } = input;

  const ownerUid = session.ownerUserId?.trim() ?? "";
  if (user && ownerUid && user.uid === ownerUid) {
    return { role: "OWNER" };
  }

  const sw = session.workspaceId.trim();
  const uw = user?.workspaceId?.trim() ?? "";

  let level: AccessLevel;
  if (user && uw !== "" && uw === sw) {
    level = "resolve";
  } else if (inviteAccess != null) {
    level = normalizeAccessLevel(inviteAccess);
  } else if (token?.isActive) {
    if (token.expiresAt != null && Date.now() > token.expiresAt) {
      level = "view";
    } else {
      level = normalizeAccessLevel(token.generalAccess);
    }
  } else {
    level = normalizeAccessLevel(session.accessLevel ?? "view");
  }

  if (level === "resolve") {
    return { role: "RESOLVER" };
  }
  return { role: "COMMENTER" };
}
