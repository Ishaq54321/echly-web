import "server-only";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebaseAdmin";
import {
  processInsightsEventWithIdempotencyRepo,
} from "@/lib/repositories/insightsRepository.server";

export const runtime = "nodejs";

type InsightsEventStatus = "pending" | "processing" | "done" | "failed";
type InsightsEventType = "feedback_created" | "comment_created" | "feedback_resolved";

type InsightsEventDoc = {
  type?: InsightsEventType;
  workspaceId?: string;
  idempotencyKey?: string;
  payload?: {
    feedbackId?: string;
    commentId?: string;
    sessionId?: string;
    type?: string;
    createdAt?: unknown;
    resolved?: boolean;
  };
  status?: InsightsEventStatus;
  attempts?: number;
};

const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 5;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asAttempts(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function processEvent(event: InsightsEventDoc): Promise<void> {
  const eventType = event.type;
  const workspaceId = asString(event.workspaceId);
  const idempotencyKey = asString(event.idempotencyKey);
  const payload = event.payload ?? {};

  if (!eventType) {
    throw new Error("Missing event type");
  }
  if (
    eventType !== "feedback_created" &&
    eventType !== "comment_created" &&
    eventType !== "feedback_resolved"
  ) {
    throw new Error(`Unsupported event type: ${String(eventType)}`);
  }
  if (!workspaceId) {
    throw new Error("Missing workspaceId");
  }

  const fallbackIdempotencyKey =
    eventType === "feedback_created"
      ? `feedback:${asString(payload.feedbackId)}`
      : eventType === "comment_created"
        ? `comment:${asString(payload.commentId)}`
        : `feedback_resolved:${asString(payload.feedbackId)}`;
  const effectiveIdempotencyKey = idempotencyKey || fallbackIdempotencyKey;
  if (!effectiveIdempotencyKey || effectiveIdempotencyKey.endsWith(":")) {
    throw new Error("Missing idempotencyKey");
  }

  await processInsightsEventWithIdempotencyRepo({
    workspaceId,
    idempotencyKey: effectiveIdempotencyKey,
    type: eventType,
    payload: {
      sessionId: asString(payload.sessionId),
      issueType: asString(payload.type) || "general",
      resolved: payload.resolved === true,
    },
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const retryFailed = requestUrl.searchParams.get("retryFailed") === "true";
  console.log("[insights-worker] batch start", {
    retryFailed,
    batchSize: BATCH_SIZE,
  });

  const pendingSnapshot = await adminDb
    .collection("insights_events")
    .where("status", "==", "pending")
    .limit(BATCH_SIZE)
    .get();
  let docs = [...pendingSnapshot.docs];
  if (retryFailed && docs.length < BATCH_SIZE) {
    const failedSnapshot = await adminDb
      .collection("insights_events")
      .where("status", "==", "failed")
      .limit(BATCH_SIZE - docs.length)
      .get();
    docs = docs.concat(failedSnapshot.docs);
  }

  console.log("[insights-worker] events fetched", {
    count: docs.length,
    retryFailed,
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const doc of docs) {
    processed += 1;
    const data = (doc.data() ?? {}) as InsightsEventDoc;
    const nextAttempts = asAttempts(data.attempts) + 1;
    const now = new Date();

    try {
      await doc.ref.update({
        status: "processing",
        attempts: nextAttempts,
        updatedAt: now,
      });

      await processEvent(data);

      await doc.ref.update({
        status: "done",
        updatedAt: new Date(),
      });
      succeeded += 1;
    } catch (error) {
      const nextStatus: InsightsEventStatus =
        nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending";

      await doc.ref.update({
        status: nextStatus,
        updatedAt: new Date(),
      });
      console.error("[insights-worker] event processing failed", {
        eventId: doc.id,
        error: toErrorMessage(error),
      });
      if (nextStatus === "failed") {
        console.error("INSIGHTS EVENT FAILED PERMANENTLY", {
          eventId: doc.id,
          type: data.type ?? null,
          workspaceId: asString(data.workspaceId) || null,
        });
      }
      failed += 1;
    }
  }

  const remainingSnapshot = await adminDb
    .collection("insights_events")
    .where("status", "==", "pending")
    .count()
    .get();
  const remaining = remainingSnapshot.data().count ?? 0;

  console.log("[insights-worker] batch summary", {
    processed,
    succeeded,
    failed,
    remaining,
    retryFailed,
  });

  return NextResponse.json({
    processed,
    succeeded,
    failed,
    remaining,
  });
}
