import "server-only";

import { adminAuth } from "@/lib/firebase/admin";

const claimCache = new Map<string, { workspaceId: string; cachedAt: number }>();
const CLAIM_TTL_MS = 5 * 60 * 1000;

export async function setWorkspaceClaim(uid: string, workspaceId: string): Promise<void> {
  // Invalidate existing cache entry to force refresh on workspace switch
  claimCache.delete(uid);

  const cached = claimCache.get(uid);
  const now = Date.now();
  if (cached && cached.workspaceId === workspaceId && now - cached.cachedAt < CLAIM_TTL_MS) {
    return;
  }

  const existingUser = await adminAuth.getUser(uid);
  const existingClaim = existingUser.customClaims?.workspaceId;

  if (existingClaim !== workspaceId) {
    console.log("Setting claim for", uid, workspaceId);
    await adminAuth.setCustomUserClaims(uid, {
      ...existingUser.customClaims,
      workspaceId,
    });
  }

  claimCache.set(uid, { workspaceId, cachedAt: now });
}
