"use client";

import { useSyncExternalStore } from "react";
import { collection, limit, onSnapshot, orderBy, query, where, type DocumentSnapshot, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Feedback } from "@/lib/domain/feedback";

const REALTIME_LIMIT = 30;

/** Firestore snapshot deltas; consumers apply single-item updates only (no full-list merge). */
export type RealtimeDocChange =
  | { type: "added"; feedback: Feedback }
  | { type: "modified"; feedback: Feedback }
  | { type: "removed"; id: string };

type FeedbackStoreSnapshot = {
  sessionId: string | null;
  items: Feedback[];
  /** Last onSnapshot docChanges(); cleared when subscribing or on error. */
  docChanges: RealtimeDocChange[];
  loading: boolean;
  error: string | null;
  version: number;
};

let snapshot: FeedbackStoreSnapshot = {
  sessionId: null,
  items: [],
  docChanges: [],
  loading: false,
  error: null,
  version: 0,
};

let unsubscribe: (() => void) | null = null;
let currentSessionId: string | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: Partial<FeedbackStoreSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    version: snapshot.version + 1,
  };
  emitChange();
}

function mapDocToFeedback(docSnap: DocumentSnapshot): Feedback {
  const data = docSnap.data() ?? {};
  const status = (data.status ?? "open") as string;
  const isResolved = data.isResolved === true || status === "resolved" || status === "done";
  const isSkipped = status === "skipped";
  return {
    id: docSnap.id,
    workspaceId: typeof data.workspaceId === "string" ? data.workspaceId : undefined,
    sessionId: data.sessionId as string,
    userId: data.userId as string,
    title: (data.title as string) ?? "",
    instruction: ((data.instruction as string) ?? (data.description as string)) ?? "",
    description: (data.description as string) ?? "",
    suggestion: (data.suggestion as string) ?? "",
    type: (data.type as string) ?? "Feedback",
    isResolved,
    isSkipped: isSkipped || undefined,
    createdAt: (data.createdAt ?? null) as Timestamp | null,
    contextSummary: (data.contextSummary as string | null) ?? null,
    actionSteps: (data.actionSteps ?? data.actionItems ?? null) as string[] | null,
    suggestedTags: (data.suggestedTags as string[] | null) ?? null,
    url: (data.url as string | null) ?? null,
    viewportWidth: (data.viewportWidth as number | null) ?? null,
    viewportHeight: (data.viewportHeight as number | null) ?? null,
    userAgent: (data.userAgent as string | null) ?? null,
    clientTimestamp: (data.clientTimestamp as number | null) ?? null,
    screenshotUrl: (data.screenshotUrl as string | null) ?? null,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview: typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: (data.lastCommentAt ?? null) as Timestamp | null,
  };
}

export function subscribeFeedbackStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFeedbackSnapshot(): FeedbackStoreSnapshot {
  return snapshot;
}

export function useFeedbackRealtimeStore(): FeedbackStoreSnapshot {
  return useSyncExternalStore(subscribeFeedbackStore, getFeedbackSnapshot, getFeedbackSnapshot);
}

export function subscribeFeedbackSession(sessionId: string): void {
  const normalizedSessionId = sessionId.trim();
  if (!normalizedSessionId) return;

  if (unsubscribe && currentSessionId === normalizedSessionId) {
    return;
  }

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  currentSessionId = normalizedSessionId;
  setSnapshot({
    sessionId: normalizedSessionId,
    loading: true,
    error: null,
    items: [],
    docChanges: [],
  });

  const feedbackRef = collection(db, "feedback");
  const feedbackQuery = query(
    feedbackRef,
    where("sessionId", "==", normalizedSessionId),
    orderBy("createdAt", "desc"),
    limit(REALTIME_LIMIT)
  );

  unsubscribe = onSnapshot(
    feedbackQuery,
    (snap) => {
      const docChanges: RealtimeDocChange[] = snap.docChanges().map((change) => {
        if (change.type === "added" || change.type === "modified") {
          return {
            type: change.type,
            feedback: mapDocToFeedback(change.doc),
          } as RealtimeDocChange;
        }
        return { type: "removed", id: change.doc.id };
      });
      setSnapshot({
        items: snap.docs.map((docSnap) => mapDocToFeedback(docSnap)),
        docChanges,
        loading: false,
        error: null,
      });
    },
    (err) => {
      console.error("[ECHLY] feedback realtime snapshot failed", err);
      setSnapshot({
        items: [],
        docChanges: [],
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load feedback realtime",
      });
    }
  );
}
