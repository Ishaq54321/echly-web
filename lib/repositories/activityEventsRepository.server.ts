import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function createActivityEvent(params: {
  workspaceId: string;
  sessionId: string;
  eventType: string;

  actorId: string;
  actorName?: string;

  feedbackId?: string;
  commentId?: string;

  metadata?: Record<string, unknown>;
}) {
  const eventRef = adminDb
    .collection("workspaces")
    .doc(params.workspaceId)
    .collection("activityEvents")
    .doc();

  await eventRef.set({
    eventType: params.eventType,
    workspaceId: params.workspaceId,
    sessionId: params.sessionId,

    feedbackId: params.feedbackId ?? null,
    commentId: params.commentId ?? null,

    actor: {
      id: params.actorId,
      name: params.actorName ?? null,
    },

    metadata: params.metadata ?? {},

    createdAt: FieldValue.serverTimestamp(),

    groupKey: `${params.eventType}:${params.actorId}:${params.sessionId}`,
  });
}
