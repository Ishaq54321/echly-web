"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Feedback } from "@/lib/domain/feedback";
import {
  sanitizePublicFeedback,
  type SanitizedPublicFeedback,
} from "@/lib/server/publicShareSanitize";

type PublicRealtimeChange =
  | { type: "added" | "modified"; item: SanitizedPublicFeedback }
  | { type: "removed"; id: string };

type PublicSessionRealtimeState = {
  items: SanitizedPublicFeedback[];
  changes: PublicRealtimeChange[];
  loading: boolean;
  error: string | null;
};

function mapSnapshotToFeedback(docSnap: QueryDocumentSnapshot<DocumentData>): Feedback {
  const data = docSnap.data();
  const status = data.status === "resolved" ? "resolved" : "open";
  const isResolved = data.isResolved === true || status === "resolved";
  return {
    id: docSnap.id,
    sessionId: typeof data.sessionId === "string" ? data.sessionId : "",
    title: typeof data.title === "string" ? data.title : "",
    instruction:
      typeof data.instruction === "string"
        ? data.instruction
        : typeof data.description === "string"
          ? data.description
          : "",
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.instruction === "string"
          ? data.instruction
          : "",
    type: typeof data.type === "string" ? data.type : "Feedback",
    isResolved,
    status,
    createdAt: (data.createdAt ?? null) as Timestamp | null,
    screenshotUrl: typeof data.screenshotUrl === "string" ? data.screenshotUrl : null,
    actionSteps: Array.isArray(data.actionSteps) ? data.actionSteps : null,
    suggestedTags: Array.isArray(data.suggestedTags) ? data.suggestedTags : null,
    isDeleted: data.isDeleted === true,
  };
}

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
      return;
    }

    const openQuery = query(
      collection(db, "feedback"),
      where("sessionId", "==", normalizedSessionId),
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );
    const resolvedQuery = query(
      collection(db, "feedback"),
      where("sessionId", "==", normalizedSessionId),
      where("status", "==", "resolved"),
      orderBy("createdAt", "desc")
    );
    let openItems: Feedback[] = [];
    let resolvedItems: Feedback[] = [];
    const emitCombined = () => {
      const merged = [...openItems, ...resolvedItems]
        .filter((item) => item.isDeleted !== true)
        .sort((a, b) => {
          const aMs = (a.createdAt as { toMillis?: () => number } | null)?.toMillis?.() ?? 0;
          const bMs = (b.createdAt as { toMillis?: () => number } | null)?.toMillis?.() ?? 0;
          if (bMs !== aMs) return bMs - aMs;
          return b.id.localeCompare(a.id);
        });
      setState({ items: sanitizePublicFeedback(merged), changes: [], loading: false, error: null });
    };
    const unsubOpen = onSnapshot(
      openQuery,
      (snap) => {
        openItems = snap.docs.map((docSnap) => mapSnapshotToFeedback(docSnap));
        emitCombined();
      },
      (err) => {
        setState({ items: [], changes: [], loading: false, error: err.message });
      }
    );
    const unsubResolved = onSnapshot(
      resolvedQuery,
      (snap) => {
        resolvedItems = snap.docs.map((docSnap) => mapSnapshotToFeedback(docSnap));
        emitCombined();
      },
      (err) => {
        setState({ items: [], changes: [], loading: false, error: err.message });
      }
    );

    return () => {
      unsubOpen();
      unsubResolved();
    };
  }, [sessionId]);

  return state;
}
