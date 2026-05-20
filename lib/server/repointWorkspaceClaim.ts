import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { setWorkspaceClaims } from "@/lib/server/setWorkspaceClaim";

/**
 * After a user is removed from (or leaves) a workspace, repoint their
 * users/{uid}.workspaceId field and Firebase custom claims to a remaining
 * workspace they're a member of — or clear both if they have no other
 * memberships.
 *
 * Extracted from app/api/workspace/members/[uid]/route.ts so the self-leave
 * route (POST /api/workspace/leave) can reuse the exact same selection
 * behavior. Selection rule preserved verbatim: first remaining entry in
 * users/{uid}.workspaceMemberships (string[]). Caller is responsible for
 * having already removed the leaving workspaceId from that array (e.g. via
 * removeWorkspaceMemberRepo, which arrayRemove's it).
 *
 * @param userId UID whose claims should be repointed
 * @param justLeftWorkspaceId The workspace they were just removed from — filtered
 *        out defensively in case the arrayRemove hasn't been reflected in this read.
 * @returns the new active workspaceId, or null when no memberships remain
 */
export async function repointWorkspaceClaim(
  userId: string,
  justLeftWorkspaceId: string
): Promise<string | null> {
  const userSnap = await adminDb.doc(`users/${userId}`).get();
  const userData = userSnap.data() ?? {};
  const remainingMemberships: string[] = Array.isArray(
    userData.workspaceMemberships
  )
    ? (userData.workspaceMemberships as unknown[]).filter(
        (v): v is string =>
          typeof v === "string" &&
          v.trim() !== "" &&
          v !== justLeftWorkspaceId
      )
    : [];

  // Deterministic pick: first remaining workspace, or null if none.
  // Matches the prior inline behavior in members/[uid]/route.ts so admin
  // removal and self-leave land on the same next-workspace.
  const newActiveWorkspaceId: string | null = remainingMemberships[0] ?? null;

  await adminDb.doc(`users/${userId}`).update({
    workspaceId: newActiveWorkspaceId,
  });

  await setWorkspaceClaims(userId, newActiveWorkspaceId, remainingMemberships);

  return newActiveWorkspaceId;
}
