import "server-only";

import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserByIdRepo } from "@/lib/repositories/usersRepository.server";
import { getSessionByIdRepo } from "@/lib/repositories/sessionsRepository.server";

/** Denormalized fields the activity UI reads; extra keys (e.g. changedFields) are merged in Firestore. */
export type ActivityEventMetadata = {
  feedbackTitle?: string;
  sessionTitle?: string;
  commentPreview?: string;
} & Record<string, unknown>;

export type CreateActivityEventParams = {
  workspaceId: string;
  sessionId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorPhotoURL?: string;
  feedbackId?: string;
  commentId?: string;
  metadata?: ActivityEventMetadata;
};

function compactMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export async function createActivityEvent(params: CreateActivityEventParams): Promise<void> {
  const workspaceId = params.workspaceId.trim();
  const sessionId = params.sessionId.trim();
  const actorId = params.actorId.trim();
  const actorName = params.actorName.trim();

  if (!workspaceId) throw new Error("createActivityEvent: workspaceId required");
  if (!sessionId) throw new Error("createActivityEvent: sessionId required");
  if (!actorId) throw new Error("createActivityEvent: actorId required");
  if (!actorName) throw new Error("createActivityEvent: actorName required");

  const metadata = compactMetadata({ ...(params.metadata ?? {}) });
  const photo = params.actorPhotoURL?.trim();

  const eventRef = adminDb
    .collection("workspaces")
    .doc(workspaceId)
    .collection("activityEvents")
    .doc();

  await eventRef.set({
    eventType: params.eventType,
    workspaceId,
    sessionId,
    feedbackId: params.feedbackId?.trim() ? params.feedbackId.trim() : null,
    commentId: params.commentId?.trim() ? params.commentId.trim() : null,
    actor: {
      id: actorId,
      name: actorName,
      ...(photo ? { photoURL: photo } : {}),
    },
    metadata,
    createdAt: FieldValue.serverTimestamp(),
    groupKey: `${params.eventType}:${actorId}:${sessionId}`,
  });
}

/** Resolve display name + avatar from `users/{uid}` for activity denormalization. */
export async function resolveActorForActivityEvent(actorId: string): Promise<{
  actorName: string;
  actorPhotoURL?: string;
}> {
  const id = actorId.trim();
  if (!id) throw new Error("resolveActorForActivityEvent: actorId required");

  const u = await getUserByIdRepo(id);
  const row = (u ?? {}) as Record<string, unknown>;
  const name =
    (typeof row.name === "string" && row.name.trim()) ||
    (typeof row.displayName === "string" && row.displayName.trim()) ||
    (typeof row.email === "string" && row.email.split("@")[0]?.trim()) ||
    "";
  if (!name) {
    throw new Error(`resolveActorForActivityEvent: missing display name for user ${id}`);
  }

  const photoRaw = row.photoURL ?? row.avatarUrl;
  const photo =
    typeof photoRaw === "string" && photoRaw.trim() ? photoRaw.trim() : undefined;

  return { actorName: name, actorPhotoURL: photo };
}

export async function sessionTitleForActivityEvent(sessionId: string): Promise<string> {
  const sid = sessionId.trim();
  if (!sid) return "Untitled Session";
  const s = await getSessionByIdRepo(sid);
  return sessionTitleFromSessionRow(s);
}

export function sessionTitleFromSessionRow(
  session: { title?: string } | null | undefined
): string {
  const t = typeof session?.title === "string" ? session.title.trim() : "";
  return t || "Untitled Session";
}

export function normalizeFeedbackTitleForActivity(raw: unknown): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || "Untitled feedback";
}

export function truncateActivityCommentPreview(message: string, maxLen = 80): string {
  const t = message.trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}
