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
  isWorkspaceMember: boolean;
  /**
   * True when the user has a realtime-eligible grant: workspace member OR an
   * explicit session member doc / sessionAccess mirror exists. `link_view`
   * alone does NOT qualify because Firestore rules still deny listener attaches
   * for cross-workspace authed viewers under link_view.
   */
  hasDirectSessionGrant: boolean;
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
    isWorkspaceMember: access.isWorkspaceMember ?? false,
    hasDirectSessionGrant: access.hasDirectSessionGrant ?? false,
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
  /** Direct session membership (`sessions/{id}/members/{userId}`); runs after workspace. */
  memberAccess?: "view" | "resolve" | null;
  /** Workspace-level role; used to grant OWNER capability to workspace owners. */
  workspaceRole?: "OWNER" | "MEMBER" | null;
};

export type ResolveAccessResult = { role: Role; sessionGranted: boolean; isWorkspaceMember: boolean };

/**
 * Single access engine. Grant rule:
 * - `link_view` → public session surface (anyone may enter; session id is the credential).
 * - `restricted` → owner, same-workspace member, or session member (`memberAccess`).
 *
 * Role precedence: OWNER → workspace RESOLVER → session member (view/resolve) → session `accessLevel` tier.
 */
export function resolveAccess(input: ResolveAccessInput): ResolveAccessResult {
  const { session, user } = input;

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

  const isLinkView = session.generalAccess === "link_view";

  const accessGranted =
    isLinkView ||
    isOwner ||
    isWorkspaceMember ||
    hasMemberAccess;

  if (!accessGranted) {
    return { role: "VIEWER", sessionGranted: false, isWorkspaceMember: false };
  }

  if (isOwner) {
    return { role: "OWNER", sessionGranted: true, isWorkspaceMember: true };
  }

  const isWorkspaceOwner = isWorkspaceMember && input.workspaceRole === "OWNER";
  if (isWorkspaceOwner) {
    return { role: "OWNER", sessionGranted: true, isWorkspaceMember: true };
  }

  if (isWorkspaceMember) {
    return { role: "RESOLVER", sessionGranted: true, isWorkspaceMember: true };
  }

  if (input.memberAccess) {
    if (input.memberAccess === "resolve") {
      return { role: "RESOLVER", sessionGranted: true, isWorkspaceMember: false };
    }

    return { role: "VIEWER", sessionGranted: true, isWorkspaceMember: false };
  }

  const level: AccessLevel = requireAccessLevel(session.accessLevel);

  if (level === "resolve") {
    // Unauthenticated link_view viewers with a "resolve" session can view but must sign in to resolve.
    if (user !== null) {
      return { role: "RESOLVER", sessionGranted: true, isWorkspaceMember: false };
    }
    return { role: "VIEWER", sessionGranted: true, isWorkspaceMember: false };
  }
  return { role: "VIEWER", sessionGranted: true, isWorkspaceMember: false };
}
