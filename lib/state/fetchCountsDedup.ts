import { authFetch } from "@/lib/authFetch";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import { dedupedRequest } from "@/lib/utils/inflightDedup";

function parseSessionFeedbackCountsBody(v: unknown): SessionFeedbackCounts {
  if (typeof v !== "object" || v === null) {
    return { total: 0, open: 0, resolved: 0 };
  }
  const readNum = (key: "total" | "open" | "resolved"): number => {
    if (!Object.prototype.hasOwnProperty.call(v, key)) return 0;
    const n = Reflect.get(v, key);
    return typeof n === "number" && !Number.isNaN(n) ? n : 0;
  };
  return {
    total: readNum("total"),
    open: readNum("open"),
    resolved: readNum("resolved"),
  };
}

export async function fetchCounts(sessionId: string): Promise<SessionFeedbackCounts> {
  return dedupedRequest(`counts-${sessionId}`, async () => {
    try {
      const res = await authFetch(
        `/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" }
      );
      if (!res) {
        throw new Error("Failed to fetch feedback counts: no response");
      }
      const json = await res.json();
      return parseSessionFeedbackCountsBody(json);
    } catch (err) {
      console.error("[ECHLY] fetchCounts request failed", err);
      throw err;
    }
  });
}

/** Alias for `fetchCounts` — kept for existing imports. */
export const fetchCountsDedup = fetchCounts;
