import type { AccessLevel } from "@/lib/domain/accessLevel";

/**
 * Input for public share permission resolution.
 * Extend with optional `userRole`, `sessionOverrides`, etc. when product needs them.
 */
export type ResolvePublicPermissionsInput = {
  generalAccess: AccessLevel;
};

export type ResolvedPublicSharePermissions = {
  canView: true;
  canComment: boolean;
  canResolve: boolean;
  /** Non-destructive action affordances shown in UI but gated for public share. */
  canAssign: boolean;
  canDefer: boolean;
};

/**
 * Maps share link `generalAccess` to UI / client capability flags for public pages.
 */
export function resolvePublicPermissions(
  input: ResolvePublicPermissionsInput
): ResolvedPublicSharePermissions {
  const { generalAccess } = input;
  const isResolve = generalAccess === "resolve";
  return {
    canView: true,
    canComment: generalAccess !== "view",
    canResolve: isResolve,
    // Not yet supported for public share mutations; keep gated.
    canAssign: false,
    canDefer: false,
  };
}
