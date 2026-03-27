import { authFetch } from "@/lib/authFetch";
import { dedupedRequest } from "@/lib/utils/inflightDedup";

/**
 * Concurrent GET /api/sessions calls share one in-flight request.
 * Resolves to parsed JSON once (no TTL / no stored results after completion).
 */
export async function fetchSessionsListJson(): Promise<unknown> {
  return dedupedRequest("sessions", async () => {
    const res = await authFetch("/api/sessions", { cache: "no-store" });
    if (!res) {
      throw new Error("Failed to fetch sessions: no response");
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch sessions: ${res.status}`);
    }
    return res.json();
  });
}
