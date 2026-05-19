import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

/**
 * Sets the user's workspace-related Firebase custom claims.
 * - workspaceId: currently active workspace (single string)
 * - workspaceIds: every workspace the user is a member of (array)
 *
 * Both must stay in sync with users/{uid}.workspaceMemberships[].
 * Rules check `wid in token.workspaceIds` for membership.
 * Routes read token.workspaceId for "active workspace" context.
 */
/**
 * @returns `changed` — true if the custom claims were actually written (i.e.
 * differ from what the user already had). When false, `getIdToken(true)` on the
 * client is unnecessary and can be skipped: the existing token already carries
 * correct claims. Order-insensitive comparison on `workspaceIds`.
 */
export async function setWorkspaceClaims(
  uid: string,
  activeWorkspaceId: string | null,
  workspaceMemberships: string[],
): Promise<{ changed: boolean }> {
  const nextWorkspaceId = activeWorkspaceId;
  const nextIds = [...new Set(workspaceMemberships)].sort();

  let priorClaims: Record<string, unknown> = {};
  try {
    const userRecord = await adminAuth.getUser(uid);
    priorClaims = userRecord.customClaims ?? {};
  } catch (err) {
    // If we can't read prior claims, fall back to writing (preserves old
    // behavior) and report changed=true so the client still force-refreshes.
    console.warn("[setWorkspaceClaims] getUser failed; writing claims", err);
    await adminAuth.setCustomUserClaims(uid, {
      workspaceId: nextWorkspaceId,
      workspaceIds: nextIds,
    });
    return { changed: true };
  }

  const priorWorkspaceId =
    typeof priorClaims.workspaceId === "string"
      ? priorClaims.workspaceId
      : priorClaims.workspaceId == null
        ? null
        : priorClaims.workspaceId;
  const priorIds = Array.isArray(priorClaims.workspaceIds)
    ? [...new Set(priorClaims.workspaceIds as unknown[])]
        .filter((v): v is string => typeof v === "string")
        .sort()
    : [];

  const unchanged =
    priorWorkspaceId === nextWorkspaceId &&
    priorIds.length === nextIds.length &&
    priorIds.every((v, i) => v === nextIds[i]);

  if (unchanged) {
    return { changed: false };
  }

  await adminAuth.setCustomUserClaims(uid, {
    workspaceId: nextWorkspaceId,
    workspaceIds: nextIds,
  });
  return { changed: true };
}
