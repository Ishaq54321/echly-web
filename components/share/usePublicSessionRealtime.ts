"use client";

import { useEffect, useState } from "react";
import type { SanitizedPublicFeedback } from "@/lib/server/publicShareSanitize";

type PublicRealtimeChange =
  | { type: "added" | "modified"; item: SanitizedPublicFeedback }
  | { type: "removed"; id: string };

type PublicSessionRealtimeState = {
  items: SanitizedPublicFeedback[];
  changes: PublicRealtimeChange[];
  loading: boolean;
  error: string | null;
};

export function usePublicSessionRealtime(
  sessionId: string | undefined
): PublicSessionRealtimeState {
  const [state, setState] = useState<PublicSessionRealtimeState>({
    items: [],
    changes: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    const normalizedSessionId = typeof sessionId === "string" ? sessionId.trim() : "";
    if (!normalizedSessionId) {
      setState({ items: [], changes: [], loading: false, error: null });
      return;
    }
    // Public share is API-only. Keep hook shape stable but disable client Firestore reads.
    setState({ items: [], changes: [], loading: false, error: null });
    return;
  }, [sessionId]);

  return state;
}
