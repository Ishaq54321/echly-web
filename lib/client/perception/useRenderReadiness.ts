import { useWorkspace } from "@/lib/client/workspaceContext";

/**
 * NBIB UI source of truth: ready for signed-in UI chrome when auth finished and uid exists.
 * Do not add claimsReady or workspaceId here — data hooks gate their own fetches.
 */
export function useRenderReadiness() {
  const { authReady, authUid } = useWorkspace();

  const identityReady = authReady && Boolean(authUid);

  return {
    identityReady,
  };
}
