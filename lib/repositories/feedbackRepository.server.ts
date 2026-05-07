import "server-only";
import { after } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { assertQueryLimit } from "@/lib/querySafety";
import type { Feedback, StructuredFeedback } from "@/lib/domain/feedback";
import {
  decrementInsightsOnFeedbackDeleteRepo,
  incrementInsightsOnFeedbackCreateRepo,
  normalizeIssueTypeForInsights,
  updateInsightsOnResolveRepo,
  updateInsightsOnTypeChangeRepo,
} from "@/lib/repositories/insightsRepository.server";
import { dispatchResolveWithCollapse } from "@/lib/repositories/notificationsRepository.server";
import {
  createActivityEvent,
  normalizeFeedbackTitleForActivity,
  resolveActorForActivityEvent,
  sessionTitleForActivityEvent,
} from "@/lib/repositories/activityEventsRepository.server";
import { listAccessibleSessionsForUser } from "@/lib/server/listAccessibleSessionsForUser";
import { fireAndForget } from "@/lib/server/fireAndForget";
import {
  resolveSessionRecipients,
  dispatchNotifications,
} from "@/lib/server/notificationFanOut.server";

type DocumentReference = FirebaseFirestore.DocumentReference;
type DocumentSnapshot = FirebaseFirestore.DocumentSnapshot;
type QueryDocumentSnapshot = FirebaseFirestore.QueryDocumentSnapshot;

function requireUserId(userId: string, context: string): string {
  const trimmed = userId.trim();
  if (!trimmed) {
    throw new Error(`Missing userId - invalid state (${context})`);
  }
  return trimmed;
}

function num(value: unknown, fallback: number = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const feedbackPayload = (
  userId: string,
  sessionId: string,
  data: StructuredFeedback,
  createdAt: Date
) => ({
  userId,
  sessionId,
  title: data.title,
  instruction: data.instruction ?? data.description ?? null,
  suggestion: data.suggestion ?? "",
  type: data.type,
  status: "open" as const,
  createdAt,
  commentCount: 0,

  contextSummary: data.contextSummary ?? null,
  actionSteps: data.actionSteps ?? null,
  suggestedTags: data.suggestedTags ?? null,
  pageArea: data.pageArea ?? null,

  url: data.url ?? null,
  viewportWidth: data.viewportWidth ?? null,
  viewportHeight: data.viewportHeight ?? null,
  userAgent: data.userAgent ?? null,
  clientTimestamp: data.timestamp ?? null,
  screenWidth: (data as { screenWidth?: number }).screenWidth ?? null,
  screenHeight: (data as { screenHeight?: number }).screenHeight ?? null,
  devicePixelRatio: (data as { devicePixelRatio?: number }).devicePixelRatio ?? null,

  screenshotId: data.screenshotId ?? null,
  screenshotStatus: data.screenshotStatus ?? null,
  isDeleted: false,
  creatorName: (data as { creatorName?: string | null }).creatorName ?? null,
  creatorAvatarUrl: (data as { creatorAvatarUrl?: string | null }).creatorAvatarUrl ?? null,
});

/** Same shape as {@link docToFeedback} for a row just written by {@link addFeedbackWithSessionCountersRepo} (avoids post-write read). */
export function feedbackFromCreateInsert(args: {
  id: string;
  userId: string;
  sessionId: string;
  data: StructuredFeedback;
  createdAt: Date;
}): Feedback {
  const row = args.data;
  const instructionRaw = row.instruction ?? row.description ?? null;
  const instruction =
    typeof instructionRaw === "string" ? instructionRaw : undefined;
  const description =
    typeof row.description === "string"
      ? row.description
      : typeof instructionRaw === "string"
        ? instructionRaw
        : undefined;
  return {
    id: args.id,
    userId: requireUserId(args.userId, "feedbackFromCreateInsert"),
    sessionId: args.sessionId,
    title: row.title,
    instruction,
    description,
    suggestion: row.suggestion ?? "",
    type: row.type,
    isResolved: false,
    createdAt: Timestamp.fromDate(args.createdAt) as Feedback["createdAt"],
    contextSummary: row.contextSummary ?? null,
    actionSteps: row.actionSteps ?? null,
    suggestedTags: row.suggestedTags ?? null,
    pageArea: row.pageArea ?? null,
    url: row.url ?? null,
    viewportWidth: row.viewportWidth ?? null,
    viewportHeight: row.viewportHeight ?? null,
    userAgent: row.userAgent ?? null,
    clientTimestamp: row.timestamp ?? null,
    screenWidth: (row as { screenWidth?: number }).screenWidth ?? null,
    screenHeight: (row as { screenHeight?: number }).screenHeight ?? null,
    devicePixelRatio: (row as { devicePixelRatio?: number }).devicePixelRatio ?? null,
    screenshotId: row.screenshotId ?? null,
    screenshotStatus: row.screenshotStatus ?? null,
    commentCount: 0,
    lastCommentAt: null,
    isDeleted: false,
    status: "open",
    creatorName: (row as { creatorName?: string | null }).creatorName ?? null,
    creatorAvatarUrl: (row as { creatorAvatarUrl?: string | null }).creatorAvatarUrl ?? null,
  };
}

export type AddFeedbackWithSessionCountersResult = {
  ref: DocumentReference;
  inserted: boolean;
  createdAt?: Date;
  /** Present when `inserted` is false and the idempotent doc already existed (from the same transaction read; no extra round trip). */
  existingFeedback?: Feedback;
};

/**
 * Creates feedback and updates session denormalized counters in one transaction.
 * Use for feedback create to avoid race conditions. Migration-safe: uses increment(1).
 */
export async function addFeedbackWithSessionCountersRepo(
  userId: string,
  sessionId: string,
  _ownerUserId: string,
  data: StructuredFeedback,
  feedbackId?: string,
  screenshotId?: string,
  options?: { preloadedWorkspaceId?: string }
): Promise<AddFeedbackWithSessionCountersResult> {
  const resolvedUserId = requireUserId(
    userId,
    "addFeedbackWithSessionCountersRepo"
  );
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);

  // Skip session pre-read if caller already resolved workspaceId (saves ~200ms Firestore round-trip).
  // Transaction reads below are still required for Firestore consistency guarantees.
  let resolvedWorkspaceId = options?.preloadedWorkspaceId?.trim() ?? "";
  if (!resolvedWorkspaceId) {
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      throw new Error("Session not found");
    }
    const sessionData = sessionSnap.data();
    resolvedWorkspaceId =
      typeof sessionData?.workspaceId === "string"
        ? sessionData.workspaceId.trim()
        : "";
    if (!resolvedWorkspaceId) {
      throw new Error("Missing workspaceId on session");
    }
  }

  const issueTypeForInsights = normalizeIssueTypeForInsights(data.type);

  const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
  const txResult = await adminDb.runTransaction(async (tx) => {
    const feedbackRef =
      feedbackId != null && feedbackId !== ""
        ? adminDb.doc(`feedback/${feedbackId}`)
        : adminDb.collection("feedback").doc();
    if (feedbackId) {
      const existing = await tx.get(feedbackRef);
      if (existing.exists) {
        const existingFeedback = docToFeedback(existing as QueryDocumentSnapshot);
        return {
          ref: feedbackRef,
          inserted: false as const,
          existingFeedback,
        };
      }
    }

    const createdAt = new Date();
    const payload = {
      ...feedbackPayload(resolvedUserId, sessionId, data, createdAt),
      workspaceId: resolvedWorkspaceId,
    };

    const sessionSnap = await tx.get(sessionRef);
    const workspaceSnap = await tx.get(workspaceRef);

    const stats = (workspaceSnap.data()?.stats ?? {}) as Record<string, unknown>;
    const totalFeedback = (stats.totalFeedback as number | undefined) ?? 0;
    const last30DaysFeedback = (stats.last30DaysFeedback as number | undefined) ?? 0;

    tx.set(feedbackRef, payload);
    if (typeof screenshotId === "string" && screenshotId.trim() !== "") {
      tx.set(
        adminDb.doc(`screenshots/${screenshotId}`),
        { status: "ATTACHED", feedbackId: feedbackRef.id },
        { merge: true }
      );
    }
    const sessionRow = sessionSnap.data() ?? {};
    let openCount = Math.max(0, num((sessionRow as any).openCount));
    const resolvedCount = Math.max(0, num((sessionRow as any).resolvedCount));
    openCount += 1;
    const totalCount = openCount + resolvedCount;
    tx.set(
      sessionRef,
      {
        openCount,
        resolvedCount,
        totalCount,
        feedbackCount: totalCount,
        skippedCount: FieldValue.delete(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    tx.update(workspaceRef, {
      "stats.totalFeedback": totalFeedback + 1,
      "stats.last30DaysFeedback": last30DaysFeedback + 1,
      "stats.updatedAt": new Date(),
    });

    return { ref: feedbackRef, inserted: true as const, createdAt };
  });

  if (txResult.inserted && txResult.createdAt) {
    const feedbackDay = txResult.createdAt.toISOString().slice(0, 10);
    const feedbackTitle = normalizeFeedbackTitleForActivity(data.title);
    // Use after() so Vercel keeps the Lambda alive until background work completes (prevents data loss).
    after(async () => {
      await Promise.all([
        incrementInsightsOnFeedbackCreateRepo({
          workspaceId: resolvedWorkspaceId,
          sessionId,
          type: issueTypeForInsights,
          feedbackDay,
        })
          .then(() => console.log("\u2705 INSIGHTS SYNC SUCCESS"))
          .catch((err) => console.error("\u274c INSIGHTS SYNC FAILED", err)),
        (async () => {
          try {
            const [actor, sessionTitle] = await Promise.all([
              resolveActorForActivityEvent(resolvedUserId),
              sessionTitleForActivityEvent(sessionId),
            ]);
            await createActivityEvent({
              workspaceId: resolvedWorkspaceId,
              sessionId,
              eventType: "feedback.created",
              actorId: resolvedUserId,
              actorName: actor.actorName,
              actorPhotoURL: actor.actorPhotoURL,
              feedbackId: txResult.ref.id,
              metadata: {
                feedbackTitle,
                sessionTitle,
              },
            });

            try {
              const recipients = await resolveSessionRecipients({
                sessionId,
                workspaceId: resolvedWorkspaceId,
                includeWorkspaceOwners: false,
                excludeUserIds: [resolvedUserId],
              });
              if (recipients.length > 0) {
                await dispatchNotifications({
                  recipientIds: recipients,
                  workspaceId: resolvedWorkspaceId,
                  sessionId,
                  sessionTitle: sessionTitle || null,
                  feedbackId: txResult.ref.id,
                  type: "feedback.created",
                  actor: {
                    id: resolvedUserId,
                    name: actor.actorName,
                    photoURL: actor.actorPhotoURL ?? null,
                  },
                  title: `${actor.actorName} reported "${feedbackTitle || "a ticket"}" in ${sessionTitle || "a session"}`,
                  entityTitle: feedbackTitle || null,
                  body: null,
                });
              }
            } catch (err) {
              console.error("[NOTIFICATION] feedback.created failed:", err);
            }
          } catch (err) {
            console.error("[ACTIVITY_EVENT] failed:", err);
          }
        })(),
      ]);
    });
  }

  return txResult;
}

type FeedbackUpdate = Partial<{
  title: string;
  instruction: string;
  type: string;
  status: "open" | "resolved";
  screenshotId: string | null;
  screenshotStatus: "attached" | "pending" | "none" | "failed" | null;
  actionSteps: string[] | null;
  suggestedTags: string[] | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
  priority: "high" | "medium" | "low" | null;
}>;

type FeedbackStatus = "open" | "resolved";

function assertValidFeedbackWriteStatus(value: unknown): asserts value is FeedbackStatus {
  if (value !== "open" && value !== "resolved") {
    throw new Error(`Invalid feedback status for write: ${String(value)}`);
  }
}

/** True when PATCH carries fields other than resolve/reopen status (title, body, tags, etc.). */
function hasNonStatusResolvePayload(data: {
  title?: string;
  instruction?: string;
  description?: string;
  type?: string;
  screenshotId?: string | null;
  actionSteps?: string[] | null;
  suggestedTags?: string[] | null;
}): boolean {
  return (
    typeof data.title === "string" ||
    typeof data.instruction === "string" ||
    typeof data.description === "string" ||
    typeof data.type === "string" ||
    data.screenshotId !== undefined ||
    data.actionSteps !== undefined ||
    data.suggestedTags !== undefined
  );
}

/**
 * Session ticket counters after a status transition (single feedback row).
 * Floors at zero; totalCount is always open + resolved (no recompute-on-read).
 */
function sessionTicketCountsAfterStatusChange(args: {
  openCount: number;
  resolvedCount: number;
  wasStatus: FeedbackStatus;
  toStatus: FeedbackStatus;
}): { openCount: number; resolvedCount: number; totalCount: number } {
  let open = Math.max(0, num(args.openCount));
  let resolved = Math.max(0, num(args.resolvedCount));
  if (args.wasStatus === args.toStatus) {
    return {
      openCount: open,
      resolvedCount: resolved,
      totalCount: open + resolved,
    };
  }
  if (args.wasStatus === "open" && args.toStatus === "resolved") {
    open = Math.max(0, open - 1);
    resolved = Math.max(0, resolved + 1);
  } else {
    open = Math.max(0, open + 1);
    resolved = Math.max(0, resolved - 1);
  }
  return {
    openCount: open,
    resolvedCount: resolved,
    totalCount: open + resolved,
  };
}

export async function updateFeedbackRepo(
  feedbackId: string,
  data: Partial<{
    title: string;
    instruction: string;
    description: string;
    type: string;
    status: "open" | "resolved";
    screenshotId: string | null;
    screenshotStatus: "attached" | "pending" | "none" | "failed" | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
    assigneeId: string | null;
    assigneeName: string | null;
    assigneeAvatarUrl: string | null;
    priority: "high" | "medium" | "low" | null;
  }>,
  opts?: { skipPreRead?: boolean }
): Promise<void> {
  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.instruction === "string") updates.instruction = data.instruction;
  else if (typeof data.description === "string") updates.instruction = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (typeof data.status === "string") {
    assertValidFeedbackWriteStatus(data.status);
    updates.status = data.status;
  }
  if (data.screenshotId !== undefined) updates.screenshotId = data.screenshotId;
  if (data.screenshotStatus !== undefined) updates.screenshotStatus = data.screenshotStatus;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  if ("assigneeId" in data) updates.assigneeId = data.assigneeId ?? null;
  if ("assigneeName" in data) updates.assigneeName = data.assigneeName ?? null;
  if ("assigneeAvatarUrl" in data) updates.assigneeAvatarUrl = data.assigneeAvatarUrl ?? null;
  if ("priority" in data) updates.priority = data.priority ?? null;
  if (Object.keys(updates).length === 0) return;
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);

  if (opts?.skipPreRead) {
    await feedbackRef.update(updates);
    return;
  }

  const feedbackSnap = await feedbackRef.get();
  if (!feedbackSnap.exists) return;
  const prev = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
  const oldType = normalizeIssueTypeForInsights(prev.type);
  let workspaceId =
    typeof prev.workspaceId === "string" ? prev.workspaceId.trim() : "";

  await feedbackRef.update(updates);

  if (typeof updates.type === "string") {
    if (!workspaceId) {
      const sid = typeof prev.sessionId === "string" ? prev.sessionId.trim() : "";
      if (sid) {
        const s = await adminDb.doc(`sessions/${sid}`).get();
        const w = s.data()?.workspaceId;
        workspaceId = typeof w === "string" ? w.trim() : "";
      }
    }
    const newType = normalizeIssueTypeForInsights(updates.type);
    if (workspaceId && newType !== oldType) {
      try {
        await updateInsightsOnTypeChangeRepo({
          workspaceId,
          oldType,
          newType,
        });
        console.log("\u2705 INSIGHTS SYNC SUCCESS");
      } catch (e) {
        console.error("\u274c INSIGHTS SYNC FAILED", e);
      }
    }
  }
}

/** Outcome of resolve/reopen + session counters (PATCH must map `missing` → 404). */
export type UpdateFeedbackResolveAndSessionCountersResult =
  | { kind: "missing" }
  | { kind: "noop"; wasStatus: FeedbackStatus; toStatus: FeedbackStatus }
  | {
      kind: "applied";
      wasStatus: FeedbackStatus;
      toStatus: FeedbackStatus;
      resolveDelta?: { workspaceId: string; delta: 1 | -1 };
      typeChange?: { workspaceId: string; oldType: string; newType: string };
    };

/**
 * Updates feedback (resolve / reopen) and session denormalized counters in one transaction.
 * Caller must pass canonical `status` ("open" | "resolved"). Migration-safe: floors session counters at 0.
 */
export async function updateFeedbackResolveAndSessionCountersRepo(
  feedbackId: string,
  actorId: string,
  data: Partial<{
    title: string;
    instruction: string;
    description: string;
    type: string;
    screenshotId: string | null;
    actionSteps: string[] | null;
    suggestedTags: string[] | null;
    status: FeedbackStatus;
  }>
): Promise<UpdateFeedbackResolveAndSessionCountersResult> {
  requireUserId(actorId, "updateFeedbackResolveAndSessionCountersRepo.actorId");
  const feedbackRef = adminDb.doc(`feedback/${feedbackId}`);
  if (typeof data.status !== "string") {
    throw new Error("updateFeedbackResolveAndSessionCountersRepo: missing status");
  }
  assertValidFeedbackWriteStatus(data.status);
  const toStatus: FeedbackStatus = data.status;

  const updates: FeedbackUpdate = {};
  if (typeof data.title === "string") updates.title = data.title;
  if (typeof data.instruction === "string") updates.instruction = data.instruction;
  else if (typeof data.description === "string") updates.instruction = data.description;
  if (typeof data.type === "string") updates.type = data.type;
  if (data.screenshotId !== undefined) updates.screenshotId = data.screenshotId;
  if (data.actionSteps !== undefined) updates.actionSteps = data.actionSteps;
  if (data.suggestedTags !== undefined) updates.suggestedTags = data.suggestedTags;
  updates.status = toStatus;

  type TxApplied = {
    kind: "applied";
    wasStatus: FeedbackStatus;
    toStatus: FeedbackStatus;
    resolveDelta?: { workspaceId: string; delta: 1 | -1 };
    typeChange?: { workspaceId: string; oldType: string; newType: string };
    sessionId: string;
    feedbackTitle: string | undefined;
  };
  type TxResult =
    | { kind: "missing" }
    | { kind: "noop"; wasStatus: FeedbackStatus; toStatus: FeedbackStatus }
    | TxApplied;

  const result: TxResult = await adminDb.runTransaction(async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists) return { kind: "missing" as const };
    const fd = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
    const sessionId = (fd.sessionId as string) ?? "";
    const raw = typeof fd.status === "string" ? fd.status : "";
    const wasStatus: FeedbackStatus = raw === "resolved" ? "resolved" : "open";

    const workspaceId = typeof fd.workspaceId === "string" ? fd.workspaceId.trim() : "";
    if (!workspaceId) {
      throw new Error("Missing workspaceId on feedback");
    }

    const sessionRef = adminDb.doc(`sessions/${sessionId}`);

    const oldTypeForInsights = normalizeIssueTypeForInsights(fd.type);
    const newTypeForInsights =
      typeof data.type === "string"
        ? normalizeIssueTypeForInsights(data.type)
        : oldTypeForInsights;
    const typeChangeMeta =
      typeof data.type === "string" && newTypeForInsights !== oldTypeForInsights
        ? {
            workspaceId,
            oldType: oldTypeForInsights,
            newType: newTypeForInsights,
          }
        : undefined;

    if (wasStatus === toStatus && !hasNonStatusResolvePayload(data)) {
      return { kind: "noop" as const, wasStatus, toStatus };
    }

    tx.update(feedbackRef, updates);

    // PERF-006: FieldValue.increment replaces session counter read-modify-write.
    if (wasStatus !== toStatus) {
      const isResolving = toStatus === "resolved";
      tx.set(
        sessionRef,
        {
          openCount: FieldValue.increment(isResolving ? -1 : 1),
          resolvedCount: FieldValue.increment(isResolving ? 1 : -1),
          skippedCount: FieldValue.delete(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      const deltaResolved =
        (toStatus === "resolved" ? 1 : 0) - (wasStatus === "resolved" ? 1 : 0);
      const resolveDelta =
        deltaResolved !== 0
          ? { workspaceId, delta: deltaResolved as 1 | -1 }
          : undefined;
      return {
        kind: "applied" as const,
        wasStatus,
        toStatus,
        resolveDelta,
        typeChange: typeChangeMeta,
        sessionId,
        feedbackTitle: typeof fd.title === "string" ? fd.title : undefined,
      };
    }

    if (hasNonStatusResolvePayload(data)) {
      tx.set(
        sessionRef,
        { updatedAt: new Date(), skippedCount: FieldValue.delete() },
        { merge: true }
      );
    }
    return {
      kind: "applied" as const,
      wasStatus,
      toStatus,
      typeChange: typeChangeMeta,
      sessionId,
      feedbackTitle: typeof fd.title === "string" ? fd.title : undefined,
    };
  });

  if (result.kind === "applied") {
    if (result.typeChange) {
      try {
        await updateInsightsOnTypeChangeRepo({
          workspaceId: result.typeChange.workspaceId,
          oldType: result.typeChange.oldType,
          newType: result.typeChange.newType,
        });
        console.log("\u2705 INSIGHTS SYNC SUCCESS");
      } catch (e) {
        console.error("\u274c INSIGHTS SYNC FAILED", e);
      }
    }
    if (result.resolveDelta) {
      try {
        await updateInsightsOnResolveRepo({
          workspaceId: result.resolveDelta.workspaceId,
          delta: result.resolveDelta.delta,
        });
        console.log("\u2705 INSIGHTS SYNC SUCCESS");
      } catch (e) {
        console.error("\u274c INSIGHTS SYNC FAILED", e);
      }
    }
    if (result.wasStatus !== result.toStatus && result.resolveDelta) {
      const fdSnap = await feedbackRef.get();
      const sid =
        typeof (fdSnap.data() as { sessionId?: string } | undefined)?.sessionId ===
        "string"
          ? String((fdSnap.data() as { sessionId: string }).sessionId).trim()
          : "";
      if (sid) {
        const fdData = (fdSnap.data() ?? {}) as Record<string, unknown>;
        const actor = await resolveActorForActivityEvent(actorId);
        const sessionTitle = await sessionTitleForActivityEvent(sid);
        const feedbackTitle = normalizeFeedbackTitleForActivity(fdData.title);
        await createActivityEvent({
          workspaceId: result.resolveDelta.workspaceId,
          sessionId: sid,
          eventType:
            result.toStatus === "resolved" ? "feedback.resolved" : "feedback.reopened",
          actorId,
          actorName: actor.actorName,
          actorPhotoURL: actor.actorPhotoURL,
          feedbackId,
          metadata: {
            feedbackTitle,
            sessionTitle,
          },
        });

        const notifWorkspaceId = result.resolveDelta.workspaceId;
        const notifSessionId = sid;
        const notifActor = {
          id: actorId,
          name: actor.actorName,
          photoURL: actor.actorPhotoURL ?? null,
        };
        const notifEventType: "feedback.resolved" | "feedback.reopened" =
          result.toStatus === "resolved"
            ? "feedback.resolved"
            : "feedback.reopened";
        const notifVerb =
          notifEventType === "feedback.resolved" ? "resolved" : "reopened";
        const notifTitleLabel = feedbackTitle || "a ticket";
        const feedbackCreatorId =
          typeof fdData.userId === "string" ? fdData.userId : "";
        const feedbackAssigneeId =
          typeof fdData.assigneeId === "string" ? fdData.assigneeId : "";

        fireAndForget("notification:feedback.status", async () => {
          const recipients: string[] = [];
          if (feedbackCreatorId && feedbackCreatorId !== actorId) {
            recipients.push(feedbackCreatorId);
          }
          if (
            feedbackAssigneeId &&
            feedbackAssigneeId !== actorId &&
            feedbackAssigneeId !== feedbackCreatorId
          ) {
            recipients.push(feedbackAssigneeId);
          }
          if (recipients.length === 0) return;

          if (notifEventType === "feedback.resolved") {
            await dispatchResolveWithCollapse({
              recipientIds: recipients,
              actorId,
              workspaceId: notifWorkspaceId,
              sessionId: notifSessionId,
              sessionTitle: sessionTitle || null,
              feedbackId,
              feedbackTitle: notifTitleLabel,
              actor: notifActor,
            });
            return;
          }

          await dispatchNotifications({
            recipientIds: recipients,
            workspaceId: notifWorkspaceId,
            sessionId: notifSessionId,
            sessionTitle: sessionTitle || null,
            feedbackId,
            type: notifEventType,
            actor: notifActor,
            title: `${notifActor.name} ${notifVerb} "${notifTitleLabel}"`,
            entityTitle: notifTitleLabel || null,
            body: null,
          });
        });
      }
    }
  }

  return result;
}

// PERF R-002: batch resolve/unresolve — replaces N individual transactions with one.
// Updates all feedback docs and session counters in a single Firestore transaction.
// Activity events and insights are intentionally skipped for batch operations.
// Cap: 200 items to stay well within Firestore's 500-operation transaction limit.
const BATCH_RESOLVE_MAX = 200;

export interface BatchResolveFeedbackResult {
  applied: number;
  skipped: number;
}

export async function batchResolveFeedbackRepo(
  sessionId: string,
  feedbackIds: string[],
  toStatus: FeedbackStatus,
  _actorId: string
): Promise<BatchResolveFeedbackResult> {
  if (feedbackIds.length === 0) return { applied: 0, skipped: 0 };
  const capped = feedbackIds.slice(0, BATCH_RESOLVE_MAX);
  const sessionRef = adminDb.doc(`sessions/${sessionId}`);
  const feedbackRefs = capped.map((id) => adminDb.doc(`feedback/${id}`));

  return adminDb.runTransaction(async (tx) => {
    // Single round-trip: read session + all feedback docs together
    const snaps = await tx.getAll(sessionRef, ...feedbackRefs);
    const sessionSnap = snaps[0]!;
    const feedbackSnaps = snaps.slice(1);

    const srow = sessionSnap.data() ?? {};
    let openCount = Math.max(0, num((srow as { openCount?: unknown }).openCount));
    let resolvedCount = Math.max(0, num((srow as { resolvedCount?: unknown }).resolvedCount));

    let applied = 0;
    for (const snap of feedbackSnaps) {
      if (!snap.exists) continue;
      const fd = (snap.data() ?? {}) as Record<string, unknown>;
      const wasStatus: FeedbackStatus = fd.status === "resolved" ? "resolved" : "open";
      if (wasStatus === toStatus) continue;
      // PERF R-002: write each feedback doc in the same transaction (no per-item round-trips)
      tx.update(snap.ref, { status: toStatus });
      if (toStatus === "resolved") {
        openCount = Math.max(0, openCount - 1);
        resolvedCount += 1;
      } else {
        openCount += 1;
        resolvedCount = Math.max(0, resolvedCount - 1);
      }
      applied++;
    }

    if (applied > 0) {
      // PERF R-002: update session counters exactly once instead of N times
      tx.set(
        sessionRef,
        {
          openCount,
          resolvedCount,
          totalCount: openCount + resolvedCount,
          feedbackCount: openCount + resolvedCount,
          skippedCount: FieldValue.delete(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    return { applied, skipped: capped.length - applied };
  });
}

/** Cursor for server-side pagination. Opaque to callers; only repo uses it. */
export type FeedbackPageCursor = QueryDocumentSnapshot;

/** Result of a single paginated feedback page. */
export interface FeedbackPageResult {
  feedback: Feedback[];
  lastVisibleDoc: FeedbackPageCursor | null;
  hasMore: boolean;
}

const FEEDBACK_PAGE_SIZE_DEFAULT = 20;

/** Maps a Firestore doc snapshot to domain Feedback. Backward compat: actionItems → actionSteps. */
function docToFeedback(docSnap: QueryDocumentSnapshot): Feedback {
  const data = docSnap.data();
  const status = data.status === "resolved" ? "resolved" : "open";
  const isResolved = status === "resolved" || data.isResolved === true;
  return {
    id: docSnap.id,
    userId: requireUserId(
      typeof data.userId === "string" ? data.userId : "",
      "docToFeedback"
    ),
    sessionId: data.sessionId,
    title: data.title,
    instruction:
      typeof data.instruction === "string"
        ? data.instruction
        : typeof data.description === "string"
          ? data.description
          : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.instruction === "string"
          ? data.instruction
          : undefined,
    suggestion: data.suggestion ?? "",
    type: data.type,
    isResolved,
    // Domain type uses client Firestore Timestamp; server may return Admin Timestamp/Date.
    createdAt: (data.createdAt ?? null) as any,
    contextSummary: data.contextSummary ?? null,
    actionSteps: data.actionSteps ?? data.actionItems ?? null,
    suggestedTags: data.suggestedTags ?? null,
    pageArea: typeof data.pageArea === "string" ? data.pageArea : null,
    url: data.url ?? null,
    viewportWidth: data.viewportWidth ?? null,
    viewportHeight: data.viewportHeight ?? null,
    userAgent: data.userAgent ?? null,
    clientTimestamp: data.clientTimestamp ?? null,
    screenWidth: typeof data.screenWidth === "number" ? data.screenWidth : null,
    screenHeight: typeof data.screenHeight === "number" ? data.screenHeight : null,
    devicePixelRatio:
      typeof data.devicePixelRatio === "number" ? data.devicePixelRatio : null,
    screenshotId: data.screenshotId ?? null,
    screenshotStatus:
      (data.screenshotStatus as Feedback["screenshotStatus"] | undefined) ?? null,
    commentCount: typeof data.commentCount === "number" ? data.commentCount : 0,
    lastCommentPreview: typeof data.lastCommentPreview === "string" ? data.lastCommentPreview : undefined,
    lastCommentAt: (data.lastCommentAt ?? null) as any,
    isDeleted: data.isDeleted ?? false,
    status,
    assigneeId: data.assigneeId ?? null,
    assigneeName: data.assigneeName ?? null,
    assigneeAvatarUrl: data.assigneeAvatarUrl ?? null,
    priority: (data.priority as Feedback["priority"]) ?? null,
    creatorName: typeof data.creatorName === "string" ? data.creatorName : null,
    creatorAvatarUrl: typeof data.creatorAvatarUrl === "string" ? data.creatorAvatarUrl : null,
  };
}

function omitSoftDeletedFeedback(items: Feedback[]): Feedback[] {
  return items.filter((f) => f.isDeleted !== true);
}

function lastCommentAtSortMs(item: Feedback): number {
  const la = item.lastCommentAt as { seconds?: number; toDate?: () => Date } | null;
  if (!la) return 0;
  if (typeof la.seconds === "number") return la.seconds * 1000;
  if (typeof la.toDate === "function") return la.toDate().getTime();
  return 0;
}

const DISCUSSION_INBOX_PER_SESSION = 8;
const DISCUSSION_INBOX_MAX_SESSIONS = 35;

/**
 * Discussion inbox: feedback with comments across sessions where {@link getAccessContext} grants view.
 * Each session contributes up to {@link DISCUSSION_INBOX_PER_SESSION} rows; results merged and sorted by lastCommentAt.
 */
export async function getDiscussionInboxFeedbackForUserRepo(args: {
  userId: string;
  limit: number;
}): Promise<Feedback[]> {
  const pageSize = args.limit;
  assertQueryLimit(pageSize, "getDiscussionInboxFeedbackForUserRepo");
  const accessible = await listAccessibleSessionsForUser({
    userId: args.userId,
    limit: DISCUSSION_INBOX_MAX_SESSIONS,
    ownerSessionsQueryLimit: DISCUSSION_INBOX_MAX_SESSIONS,
  });
  const sidList = accessible.map((s) => s.id).slice(0, DISCUSSION_INBOX_MAX_SESSIONS);
  if (sidList.length === 0) return [];

  const sidToWorkspaceId = new Map(accessible.map((s) => [s.id, s.workspaceId ?? ""]));

  // TODO: Ensure composite index exists for workspaceId + sessionId + commentCount (DESC)
  const batches = await Promise.all(
    sidList.map((sid) =>
      adminDb
        .collection("feedback")
        .where("workspaceId", "==", sidToWorkspaceId.get(sid) ?? "")
        .where("sessionId", "==", sid)
        .where("commentCount", ">", 0)
        .orderBy("commentCount", "desc")
        .limit(DISCUSSION_INBOX_PER_SESSION)
        .get()
    )
  );

  const merged: Feedback[] = [];
  for (const snap of batches) {
    merged.push(...omitSoftDeletedFeedback(snap.docs.map(docToFeedback)));
  }
  merged.sort((a, b) => {
    const tb = lastCommentAtSortMs(b);
    const ta = lastCommentAtSortMs(a);
    if (tb !== ta) return tb - ta;
    return b.id.localeCompare(a.id);
  });
  return merged.slice(0, pageSize);
}

const DISCUSSION_MENTIONS_COMMENT_SCAN_LIMIT = 200;

/**
 * Discussion mentions: feedback whose comments @mention the user.
 * Scans recent comments via `mentionedUserIds array-contains userId`, dedupes feedbackIds,
 * then loads matching feedback docs. Caller should filter by access at the API layer.
 *
 * Required Firestore index:
 *   collection: comments
 *   fields: mentionedUserIds (Array contains) + createdAt (Descending)
 */
export async function getDiscussionMentionsForUserRepo(args: {
  userId: string;
  limit: number;
}): Promise<Feedback[]> {
  const pageSize = args.limit;
  assertQueryLimit(pageSize, "getDiscussionMentionsForUserRepo");
  const userId = requireUserId(args.userId, "getDiscussionMentionsForUserRepo");

  const commentsSnap = await adminDb
    .collection("comments")
    .where("mentionedUserIds", "array-contains", userId)
    .orderBy("createdAt", "desc")
    .limit(DISCUSSION_MENTIONS_COMMENT_SCAN_LIMIT)
    .get();

  const seen = new Set<string>();
  const feedbackIds: string[] = [];
  for (const doc of commentsSnap.docs) {
    const fid = (doc.data() as { feedbackId?: unknown }).feedbackId;
    if (typeof fid !== "string" || !fid) continue;
    if (seen.has(fid)) continue;
    seen.add(fid);
    feedbackIds.push(fid);
    if (feedbackIds.length >= pageSize * 2) break;
  }
  if (feedbackIds.length === 0) return [];

  const snaps = await Promise.all(
    feedbackIds.map((fid) => adminDb.doc(`feedback/${fid}`).get())
  );
  const feedback: Feedback[] = [];
  for (const snap of snaps) {
    if (!snap.exists) continue;
    const row = snap.data() as { isDeleted?: unknown } | undefined;
    if (row?.isDeleted === true) continue;
    feedback.push(docToFeedback(snap as QueryDocumentSnapshot));
  }
  feedback.sort((a, b) => {
    const tb = lastCommentAtSortMs(b);
    const ta = lastCommentAtSortMs(a);
    if (tb !== ta) return tb - ta;
    return b.id.localeCompare(a.id);
  });
  return feedback.slice(0, pageSize);
}

/**
 * Fetches one page of feedback for a session using cursor pagination.
 * Composite index required: feedback (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackPageRepo(
  sessionId: string,
  opts: {
    status?: "open" | "resolved" | "all";
    limit?: number;
    cursor?: FeedbackPageCursor | null;
  } = {}
): Promise<FeedbackPageResult> {
  const status = opts.status ?? "all";
  const pageSize = opts.limit ?? FEEDBACK_PAGE_SIZE_DEFAULT;
  assertQueryLimit(pageSize, "getSessionFeedbackPageRepo");

  const sessionSnap = await adminDb.doc(`sessions/${sessionId}`).get();
  const sessionData = sessionSnap.data() as { workspaceId?: string } | undefined;
  const workspaceId = typeof sessionData?.workspaceId === "string" ? sessionData.workspaceId.trim() : "";

  // TODO: Ensure composite index exists for workspaceId + sessionId + status + createdAt
  let q: FirebaseFirestore.Query = adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sessionId);
  if (status !== "all") q = q.where("status", "==", status);
  q = q.orderBy("status", "asc").orderBy("createdAt", "desc");
  if (opts.cursor) q = q.startAfter(opts.cursor);
  const snapshot = await q.limit(pageSize + 1).get();

  const docs = omitSoftDeletedFeedback(
    (snapshot.docs as QueryDocumentSnapshot[]).map(docToFeedback)
  );
  const hasMore = docs.length > pageSize;
  const feedback = hasMore ? docs.slice(0, pageSize) : docs;
  const lastVisibleDoc =
    hasMore && feedback.length > 0
      ? ((snapshot.docs as QueryDocumentSnapshot[]).find(
          (d) => d.id === feedback[feedback.length - 1].id
        ) as FeedbackPageCursor | undefined) ?? null
      : null;

  return { feedback, lastVisibleDoc, hasMore };
}

/**
 * String-cursor wrapper around getSessionFeedbackPageRepo.
 * Used by API routes so cursors can be serialized as simple strings.
 */
export async function getSessionFeedbackPageWithStringCursorRepo(
  sessionId: string,
  limit: number,
  cursor?: string
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const trimmed = cursor?.trim();
  const cursorSnap =
    trimmed && trimmed.length > 0
      ? await adminDb.doc(`feedback/${trimmed}`).get()
      : null;

  const { feedback, lastVisibleDoc, hasMore } = await getSessionFeedbackPageRepo(sessionId, {
    status: "all",
    limit,
    cursor:
      cursorSnap && cursorSnap.exists
        ? (cursorSnap as unknown as QueryDocumentSnapshot)
        : null,
  });

  return {
    feedback,
    nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null,
    hasMore,
  };
}

/**
 * Session-scoped feedback page (newest first). Permission enforced at API via {@link getAccessContext}.
 * Composite index: feedback (sessionId ASC, createdAt DESC) or (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackPageForUserWithStringCursorRepo(
  args: {
    sessionId: string;
    limit: number;
    cursor?: string;
    /** When set, only returns tickets with this Firestore `status` bucket. */
    statusFilter?: "open" | "resolved";
  }
): Promise<{ feedback: Feedback[]; nextCursor: string | null; hasMore: boolean }> {
  const { sessionId: sidRaw, limit: pageSize, cursor, statusFilter } = args;
  const sessionId = sidRaw.trim();
  assertQueryLimit(pageSize, "getSessionFeedbackPageForUserWithStringCursorRepo");
  const trimmed = cursor?.trim();
  const cursorSnap: DocumentSnapshot | null =
    trimmed && trimmed.length > 0 ? await adminDb.doc(`feedback/${trimmed}`).get() : null;

  if (cursorSnap?.exists) {
    const csid =
      typeof (cursorSnap.data() as { sessionId?: string }).sessionId === "string"
        ? (cursorSnap.data() as { sessionId: string }).sessionId.trim()
        : "";
    if (csid !== sessionId) {
      return { feedback: [], nextCursor: null, hasMore: false };
    }
  }

  let startAfterDoc: DocumentSnapshot | null =
    cursorSnap && cursorSnap.exists ? cursorSnap : null;
  const collected: QueryDocumentSnapshot[] = [];
  let hasMore = false;

  const sessionDocSnap = await adminDb.doc(`sessions/${sessionId}`).get();
  const sessionDocData = sessionDocSnap.data() as { workspaceId?: string } | undefined;
  const workspaceId = typeof sessionDocData?.workspaceId === "string" ? sessionDocData.workspaceId.trim() : "";

  const indexHint =
    statusFilter != null
      ? "feedback(workspaceId ASC, sessionId ASC, status ASC, createdAt DESC)"
      : "feedback(workspaceId ASC, sessionId ASC, createdAt DESC)";

  // TODO: Ensure composite index exists for workspaceId + sessionId (+ status) + createdAt
  const runQuery = () => {
    let q: FirebaseFirestore.Query = adminDb
      .collection("feedback")
      .where("workspaceId", "==", workspaceId)
      .where("sessionId", "==", sessionId);
    if (statusFilter) q = q.where("status", "==", statusFilter);
    q = q.orderBy("createdAt", "desc").limit(pageSize);
    if (startAfterDoc) q = q.startAfter(startAfterDoc);
    return q;
  };

  try {
    while (collected.length < pageSize) {
      let snapshot: FirebaseFirestore.QuerySnapshot;
      try {
        snapshot = await runQuery().get();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("requires an index")) {
          console.warn(`[FIRESTORE] Missing composite index: ${indexHint}`, {
            sessionId,
            statusFilter,
          });
        }
        throw err;
      }

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      let filledPage = false;
      for (let i = 0; i < snapshot.docs.length; i++) {
        const d = snapshot.docs[i] as QueryDocumentSnapshot;
        if (d.data().isDeleted === true) continue;
        collected.push(d);
        if (collected.length >= pageSize) {
          const moreInBatch = i < snapshot.docs.length - 1;
          hasMore = moreInBatch || snapshot.size === pageSize;
          filledPage = true;
          break;
        }
      }

      if (filledPage) break;

      startAfterDoc = snapshot.docs[snapshot.docs.length - 1] as DocumentSnapshot;
      if (snapshot.size < pageSize) {
        hasMore = false;
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("requires an index")) {
      console.warn(`[FIRESTORE] Missing composite index: ${indexHint}`, {
        sessionId,
        statusFilter,
      });
    }
    throw err;
  }

  const pageDocs = collected.slice(0, pageSize);
  const feedback = pageDocs.map((d) => docToFeedback(d));
  const lastVisibleDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;

  return {
    feedback,
    nextCursor: lastVisibleDoc ? lastVisibleDoc.id : null,
    hasMore,
  };
}

/** Max docs loaded into memory for sidebar search (no pagination of results). */
const SESSION_SEARCH_CORPUS_MAX = 50;

/**
 * Loads up to {@link SESSION_SEARCH_CORPUS_MAX} non-deleted feedback docs for a session
 * (mixed status, newest first) for server-side search. Uses the same access path as list pagination.
 */
export async function getSessionFeedbackSearchCorpusForUserRepo(args: {
  sessionId: string;
}): Promise<Feedback[]> {
  const { sessionId } = args;
  const maxDocs = SESSION_SEARCH_CORPUS_MAX;
  const batchLimit = 50;
  const out: Feedback[] = [];
  let cursor: string | undefined;

  while (out.length < maxDocs) {
    const { feedback, nextCursor, hasMore } = await getSessionFeedbackPageForUserWithStringCursorRepo({
      sessionId,
      limit: batchLimit,
      cursor,
    });
    for (const item of feedback) {
      if (out.length >= maxDocs) break;
      out.push(item);
    }
    if (!hasMore || !nextCursor) break;
    cursor = nextCursor;
  }

  return out;
}

export async function deleteFeedbackRepo(
  feedbackId: string,
  opts?: { actorId?: string; sessionTitle?: string | null }
): Promise<void> {
  await deleteFeedbackWithSessionCountersRepo(feedbackId, opts);
}

/** Max comment docs read/deleted per feedback in one transaction (Firestore op budget). */
const DELETE_FEEDBACK_COMMENT_TX_CHUNK = 400;

/**
 * Deletes feedback, all its comments, and session/workspace counters in one transaction.
 * Migration-safe: floors session and workspace comment totals at 0.
 */
export async function deleteFeedbackWithSessionCountersRepo(
  feedbackId: string,
  opts?: { actorId?: string; sessionTitle?: string | null }
): Promise<void> {
  const fid = feedbackId.trim();
  if (!fid) {
    throw new Error("Missing feedbackId");
  }
  const feedbackRef = adminDb.doc(`feedback/${fid}`);

  const insightsAfterDelete = await adminDb.runTransaction(async (tx) => {
    const feedbackSnap = await tx.get(feedbackRef);
    if (!feedbackSnap.exists) return null;

    const data = (feedbackSnap.data() ?? {}) as Record<string, unknown>;
    const isTombstone = data.isDeleted === true;
    const sessionId = (data.sessionId as string) ?? "";
    const sessionRef = adminDb.doc(`sessions/${sessionId}`);
    const sessionSnap = await tx.get(sessionRef);
    const s = sessionSnap.data() || {};

    let resolvedWorkspaceId =
      typeof data.workspaceId === "string" ? data.workspaceId.trim() : "";
    if (!resolvedWorkspaceId) {
      const srow = sessionSnap.data() ?? {};
      resolvedWorkspaceId =
        typeof (srow as { workspaceId?: unknown }).workspaceId === "string"
          ? (srow as { workspaceId: string }).workspaceId.trim()
          : "";
    }
    if (!resolvedWorkspaceId) {
      throw new Error("Missing workspaceId on feedback/session");
    }

    const rawCreated = data.createdAt;
    const createdAtForInsights =
      rawCreated != null && typeof (rawCreated as { toDate?: () => Date }).toDate === "function"
        ? (rawCreated as FirebaseFirestore.Timestamp)
        : rawCreated instanceof Date
          ? rawCreated
          : new Date();

    const workspaceRef = adminDb.doc(`workspaces/${resolvedWorkspaceId}`);
    const workspaceSnap = await tx.get(workspaceRef);

    const commentRefsToDelete: DocumentReference[] = [];
    let commentCursor: QueryDocumentSnapshot | undefined;
    for (;;) {
      let q: FirebaseFirestore.Query = adminDb
        .collection("comments")
        .where("workspaceId", "==", resolvedWorkspaceId)
        .where("feedbackId", "==", fid)
        .orderBy(FieldPath.documentId())
        .limit(DELETE_FEEDBACK_COMMENT_TX_CHUNK);
      if (commentCursor) q = q.startAfter(commentCursor);
      const commentSnap = await tx.get(q);
      if (commentSnap.empty) break;
      for (const d of commentSnap.docs) {
        commentRefsToDelete.push(d.ref);
      }
      if (commentSnap.size < DELETE_FEEDBACK_COMMENT_TX_CHUNK) break;
      commentCursor = commentSnap.docs[commentSnap.docs.length - 1] as QueryDocumentSnapshot;
    }
    const commentDeleteCount = commentRefsToDelete.length;

    const sessionRow = sessionSnap.data() ?? {};
    const nextSessionCommentCount = Math.max(
      0,
      num((sessionRow as { commentCount?: unknown }).commentCount) - commentDeleteCount
    );

    const stats = (workspaceSnap.data()?.stats ?? {}) as Record<string, unknown>;
    const nextWorkspaceTotalComments = Math.max(
      0,
      num(stats.totalComments) - commentDeleteCount
    );
    const nextWorkspaceTotalFeedback = Math.max(0, num(stats.totalFeedback) - 1);

    for (const ref of commentRefsToDelete) {
      tx.delete(ref);
    }

    if (isTombstone) {
      tx.delete(feedbackRef);
      tx.update(sessionRef, {
        commentCount: nextSessionCommentCount,
        updatedAt: new Date(),
      });
      tx.update(workspaceRef, {
        "stats.totalFeedback": nextWorkspaceTotalFeedback,
        "stats.totalComments": nextWorkspaceTotalComments,
        "stats.updatedAt": new Date(),
      });
      return {
        workspaceId: resolvedWorkspaceId,
        sessionId,
        type: normalizeIssueTypeForInsights(data.type),
        createdAt: createdAtForInsights,
        feedbackTitle: typeof data.title === "string" ? data.title : undefined,
      };
    }

    const rawStatus = typeof data.status === "string" ? data.status : "";
    const wasResolved = rawStatus === "resolved";
    let openCount = Math.max(0, num(s.openCount));
    let resolvedCount = Math.max(0, num(s.resolvedCount));
    if (wasResolved) resolvedCount = Math.max(0, resolvedCount - 1);
    else openCount = Math.max(0, openCount - 1);
    const totalCount = openCount + resolvedCount;

    tx.delete(feedbackRef);
    tx.update(sessionRef, {
      openCount,
      resolvedCount,
      totalCount,
      feedbackCount: totalCount,
      commentCount: nextSessionCommentCount,
      skippedCount: FieldValue.delete(),
      updatedAt: new Date(),
    });
    tx.update(workspaceRef, {
      "stats.totalFeedback": nextWorkspaceTotalFeedback,
      "stats.totalComments": nextWorkspaceTotalComments,
      "stats.updatedAt": new Date(),
    });
    return {
      workspaceId: resolvedWorkspaceId,
      sessionId,
      type: normalizeIssueTypeForInsights(data.type),
      createdAt: createdAtForInsights,
      feedbackTitle: typeof data.title === "string" ? data.title : undefined,
    };
  });

  if (insightsAfterDelete) {
    try {
      await decrementInsightsOnFeedbackDeleteRepo(insightsAfterDelete);
      console.log("\u2705 INSIGHTS SYNC SUCCESS");
    } catch (e) {
      console.error("\u274c INSIGHTS SYNC FAILED", e);
    }
    if (opts?.actorId) {
      const actor = await resolveActorForActivityEvent(opts.actorId);
      await createActivityEvent({
        workspaceId: insightsAfterDelete.workspaceId,
        sessionId: insightsAfterDelete.sessionId,
        eventType: "feedback.deleted",
        actorId: opts.actorId,
        actorName: actor.actorName,
        actorPhotoURL: actor.actorPhotoURL,
        metadata: {
          sessionTitle: opts.sessionTitle ?? undefined,
          feedbackTitle: insightsAfterDelete.feedbackTitle ?? "Untitled feedback",
        },
      });
    }
  }
}

const DELETE_SESSION_FEEDBACK_LIMIT = 500;

/**
 * Deletes all feedback (tickets) for a session. Used when deleting a session.
 * Returns the number of docs deleted so callers can update workspace.stats.
 * Screenshot files in Storage are not removed here (TODO: optional cleanup).
 */
export async function deleteAllFeedbackForSessionRepo(sessionId: string): Promise<number> {
  const sid = sessionId.trim();
  const sessionSnap = await adminDb.doc(`sessions/${sid}`).get();
  const fallbackWorkspaceId =
    typeof sessionSnap.data()?.workspaceId === "string"
      ? String(sessionSnap.data()!.workspaceId).trim()
      : "";

  const snapshot = await adminDb
    .collection("feedback")
    .where("sessionId", "==", sid)
    .limit(DELETE_SESSION_FEEDBACK_LIMIT)
    .get();
  const docs = snapshot.docs as QueryDocumentSnapshot[];

  const payloads: Parameters<typeof decrementInsightsOnFeedbackDeleteRepo>[0][] = [];
  for (const d of docs) {
    const data = (d.data() ?? {}) as Record<string, unknown>;
    const workspaceId =
      (typeof data.workspaceId === "string" ? data.workspaceId.trim() : "") ||
      fallbackWorkspaceId;
    if (!workspaceId) {
      throw new Error("Missing workspaceId on feedback/session (bulk delete)");
    }
    const rawCreated = data.createdAt;
    const createdAt =
      rawCreated != null && typeof (rawCreated as { toDate?: () => Date }).toDate === "function"
        ? (rawCreated as FirebaseFirestore.Timestamp)
        : rawCreated instanceof Date
          ? rawCreated
          : new Date();
    payloads.push({
      workspaceId,
      sessionId: sid,
      type: normalizeIssueTypeForInsights(data.type),
      createdAt,
    });
  }

  await Promise.all(docs.map((d) => d.ref.delete()));

  for (const p of payloads) {
    try {
      await decrementInsightsOnFeedbackDeleteRepo(p);
      console.log("\u2705 INSIGHTS SYNC SUCCESS");
    } catch (e) {
      console.error("\u274c INSIGHTS SYNC FAILED", e);
    }
  }

  return docs.length;
}

const OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT = 3;

/**
 * Fetches up to N feedback items for a session filtered by resolution, newest first.
 * Composite index: feedback (sessionId ASC, status ASC, createdAt DESC).
 */
export async function getSessionFeedbackByResolvedRepo(
  sessionId: string,
  isResolved: boolean,
  max: number = OVERVIEW_PREVIEW_PER_RESOLVED_LIMIT
): Promise<Feedback[]> {
  assertQueryLimit(max, "getSessionFeedbackByResolvedRepo");
  const status = isResolved ? "resolved" : "open";
  const sid = sessionId.trim();

  const sessionDocSnap = await adminDb.doc(`sessions/${sid}`).get();
  const sessionDocData = sessionDocSnap.data() as { workspaceId?: string } | undefined;
  const workspaceId = typeof sessionDocData?.workspaceId === "string" ? sessionDocData.workspaceId.trim() : "";

  // TODO: Ensure composite index exists for workspaceId + sessionId + status + createdAt
  const snapshot = await adminDb
    .collection("feedback")
    .where("workspaceId", "==", workspaceId)
    .where("sessionId", "==", sid)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return omitSoftDeletedFeedback(snapshot.docs.map(docToFeedback));
}

const OVERVIEW_FEEDBACK_BY_IDS_LIMIT = 10;

/** Fetches a single feedback doc by ID. Returns null if not found. */
export async function getFeedbackByIdRepo(
  feedbackId: string
): Promise<Feedback | null> {
  const snap = await adminDb.doc(`feedback/${feedbackId}`).get();
  if (!snap.exists) return null;
  const row = snap.data() as { isDeleted?: unknown } | undefined;
  if (row?.isDeleted === true) return null;
  return docToFeedback(snap as QueryDocumentSnapshot);
}

/** Fetches feedback docs by IDs (e.g. for activity titles). Limited for cost safety. */
export async function getFeedbackByIdsRepo(
  feedbackIds: string[],
  max: number = OVERVIEW_FEEDBACK_BY_IDS_LIMIT
): Promise<Feedback[]> {
  if (feedbackIds.length === 0) return [];
  const limited = feedbackIds.slice(0, max);
  assertQueryLimit(limited.length, "getFeedbackByIdsRepo");
  const snaps = await Promise.all(limited.map((id) => adminDb.doc(`feedback/${id}`).get()));
  return omitSoftDeletedFeedback(
    snaps
      .filter((s) => s.exists)
      .map((s) => docToFeedback(s as QueryDocumentSnapshot))
  );
}