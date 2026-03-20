import { authFetch } from "@/lib/authFetch";
import type { SessionFeedbackCounts } from "@/lib/repositories/feedbackRepository";
import {
  clearPendingRequest,
  getPendingRequest,
  setPendingRequest,
} from "@/lib/state/countsRequestStore";

function parseSessionFeedbackCountsBody(v: unknown): SessionFeedbackCounts {
  if (typeof v !== "object" || v === null) {
    return { total: 0, open: 0, resolved: 0, skipped: 0 };
  }
  const readNum = (key: "total" | "open" | "resolved" | "skipped"): number => {
    if (!Object.prototype.hasOwnProperty.call(v, key)) return 0;
    const n = Reflect.get(v, key);
    return typeof n === "number" && !Number.isNaN(n) ? n : 0;
  };
  return {
    total: readNum("total"),
    open: readNum("open"),
    resolved: readNum("resolved"),
    skipped: readNum("skipped"),
  };
}

export async function fetchCountsDedup(
  sessionId: string
): Promise<SessionFeedbackCounts> {
  const existing = getPendingRequest(sessionId);
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    try {
      const res = await authFetch(
        `/api/feedback/counts?sessionId=${encodeURIComponent(sessionId)}`
      );
      const json = await res.json();
      return parseSessionFeedbackCountsBody(json);
    } finally {
      clearPendingRequest(sessionId);
    }
  })();
  setPendingRequest(sessionId, promise);
  return promise;
}
