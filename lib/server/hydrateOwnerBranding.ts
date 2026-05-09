import type { Session } from "@/lib/domain/session";
import { getWorkspace } from "@/lib/repositories/workspacesRepository.server";
import { PLANS, type PlanId } from "@/lib/billing/plans";

const BRANDING_CACHE_TTL_MS = 60_000;
type CachedBranding = { brandLogoUrl: string | null; enabled: boolean };
const brandingCache = new Map<string, { data: CachedBranding; expiresAt: number }>();

function getCachedBranding(workspaceId: string): CachedBranding | null {
  const entry = brandingCache.get(workspaceId);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  if (entry) brandingCache.delete(workspaceId);
  return null;
}

function setCachedBranding(workspaceId: string, data: CachedBranding): void {
  brandingCache.set(workspaceId, { data, expiresAt: Date.now() + BRANDING_CACHE_TTL_MS });
}

export function invalidateBrandingCache(workspaceId: string): void {
  brandingCache.delete(workspaceId);
}

/**
 * Reads the session owner's workspace and stamps `ownerBrandLogoUrl` +
 * `ownerBrandingEnabled` so guests see the owner's brand on the session page,
 * not their own. Best-effort: failures fall back to no branding (Annote default).
 */
export async function hydrateOwnerBranding(session: Session): Promise<Session> {
  if (!session.workspaceId) return session;

  const cached = getCachedBranding(session.workspaceId);
  if (cached) {
    return {
      ...session,
      ownerBrandLogoUrl: cached.enabled ? cached.brandLogoUrl : null,
      ownerBrandingEnabled: cached.enabled,
    } as Session;
  }

  try {
    const ws = await getWorkspace(session.workspaceId);
    if (!ws) return session;
    const planId = (ws.billing?.plan ?? "starter") as PlanId;
    const enabled =
      ws.entitlements?.customBranding ?? PLANS[planId]?.customBranding ?? false;
    const brandLogoUrl = ws.brandLogoUrl ?? null;
    setCachedBranding(session.workspaceId, { brandLogoUrl, enabled });
    return {
      ...session,
      ownerBrandLogoUrl: enabled ? brandLogoUrl : null,
      ownerBrandingEnabled: enabled,
    } as Session;
  } catch {
    return session;
  }
}
