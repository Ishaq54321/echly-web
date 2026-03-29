import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

export type { AccessLevel };

export type ResolvedAccess = {
  level: AccessLevel;
  canView: true;
  canComment: boolean;
  canResolve: boolean;
};

/** Public share UI: same capability flags plus assign/defer placeholders for the action bar. */
export type ShareSurfacePermissions = ResolvedAccess & {
  canAssign: false;
  canDefer: false;
};

type ResolveAccessInput = {
  session: {
    id: string;
    workspaceId: string;
    accessLevel: AccessLevel;
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

/**
 * Single permission engine: workspace membership, invite row, share token, then session default.
 */
export function resolveAccess(input: ResolveAccessInput): ResolvedAccess {
  const { session, user, inviteAccess, token } = input;

  const sw = session.workspaceId.trim();
  const uw = user?.workspaceId?.trim() ?? "";

  if (user && uw !== "" && uw === sw) {
    return build("resolve");
  }

  if (inviteAccess != null) {
    return build(normalizeAccessLevel(inviteAccess));
  }

  if (token && token.isActive) {
    if (token.expiresAt != null && Date.now() > token.expiresAt) {
      return build("view");
    }
    return build(normalizeAccessLevel(token.generalAccess));
  }

  return build(normalizeAccessLevel(session.accessLevel ?? "view"));
}

export function toShareSurfacePermissions(access: ResolvedAccess): ShareSurfacePermissions {
  return {
    ...access,
    canAssign: false,
    canDefer: false,
  };
}

function build(level: AccessLevel): ResolvedAccess {
  return {
    level,
    canView: true,
    canComment: level === "comment" || level === "resolve",
    canResolve: level === "resolve",
  };
}
