import type { AccessLevel } from "@/lib/domain/accessLevel";
import { requireAccessLevel } from "@/lib/domain/accessLevel";
import type { Role } from "@/lib/domain/role";
import type { SessionGeneralAccess } from "@/lib/domain/session";
import { assert } from "@/lib/utils/assert";

export type { AccessLevel };
export type { Role };

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
  userId: string | null,
  sessionGranted: boolean
): AccessCapabilities {
  if (!sessionGranted) {
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

  if (role === "VIEWER") {
    return {
      canView: true,
      canComment: isAuthenticated,
      canResolve: false,
      canAssign: false,
      canDeleteOwnComment: isAuthenticated,
      canDeleteTicket: false,
    };
  }

  if (role === "RESOLVER") {
    return {
      canView: true,
      canComment: isAuthenticated,
      canResolve: isAuthenticated,
      canAssign: isAuthenticated,
      canDeleteOwnComment: isAuthenticated,
      canDeleteTicket: false,
    };
  }

  return {
    canView: true,
    canComment: isAuthenticated,
    canResolve: isAuthenticated,
    canAssign: isAuthenticated,
    canDeleteOwnComment: isAuthenticated,
    canDeleteTicket: isAuthenticated,
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
    /** Session owner uid from canonical `createdByUserId`. */
    ownerUserId: string;
    generalAccess: SessionGeneralAccess;
  };
  user: {
    uid: string;
    workspaceId: string;
  } | null;
  /** Present only when the share_links row is active; expiry downgrades tier, not grant. */
  token?: {
    generalAccess: AccessLevel;
    isActive: boolean;
    expiresAt?: number | null;
  } | null;
  /** Direct session membership (`sessions/{id}/members/{userId}`); runs after workspace, before link. */
  memberAccess?: "view" | "resolve" | null;
};

export type ResolveAccessResult = { role: Role; sessionGranted: boolean };

/**
 * Single access engine. Grant rule:
 * - `link_view` → public session surface (anyone may enter; tier from session / token).
 * - `restricted` → owner, same-workspace member, session member (`memberAccess`), or active share link (`token`).
 *
 * Role precedence: OWNER → workspace RESOLVER → session member (view/resolve) → link / session `accessLevel` tier.
 */
export function resolveAccess(input: ResolveAccessInput): ResolveAccessResult {
  const { session, user, token } = input;

  assert(session.accessLevel, "Missing accessLevel");

  const ownerUid = session.ownerUserId.trim();
  const sw = session.workspaceId.trim();
  const uid = user == null ? "" : user.uid.trim();
  const uw = user == null ? "" : user.workspaceId.trim();
  if (user != null) {
    assert(uid, "Missing user uid");
  }

  const isOwner = !!user && !!ownerUid && uid === ownerUid;
  const isWorkspaceMember =
    !!user && uid !== "" && uw !== "" && uw === sw;

  const hasMemberAccess =
    input.memberAccess === "view" || input.memberAccess === "resolve";

  const hasShareLinkContext = token != null && token.isActive;
  const tokenExpired =
    hasShareLinkContext &&
    token.expiresAt != null &&
    Date.now() > token.expiresAt;

  const isLinkView = session.generalAccess === "link_view";

  const accessGranted =
    isLinkView ||
    isOwner ||
    isWorkspaceMember ||
    hasMemberAccess ||
    hasShareLinkContext;

  if (!accessGranted) {
    return { role: "VIEWER", sessionGranted: false };
  }

  const shareTokenIsOnlyGrant =
    !isLinkView &&
    !isOwner &&
    !isWorkspaceMember &&
    !hasMemberAccess &&
    hasShareLinkContext;
  if (shareTokenIsOnlyGrant && tokenExpired) {
    return { role: "VIEWER", sessionGranted: false };
  }

  if (isOwner) {
    return { role: "OWNER", sessionGranted: true };
  }

  if (isWorkspaceMember) {
    return { role: "RESOLVER", sessionGranted: true };
  }

  if (input.memberAccess) {
    if (input.memberAccess === "resolve") {
      return { role: "RESOLVER", sessionGranted: true };
    }

    return { role: "VIEWER", sessionGranted: true };
  }

  let level: AccessLevel;
  if (hasShareLinkContext) {
    level = tokenExpired ? "view" : requireAccessLevel(token.generalAccess);
  } else {
    level = requireAccessLevel(session.accessLevel);
  }

  if (level === "resolve") {
    return { role: "RESOLVER", sessionGranted: true };
  }
  return { role: "VIEWER", sessionGranted: true };
}
