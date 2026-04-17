import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface WorkspaceInsightsDoc {
  /** Workspace identity for this insights document (never userId). */
  workspaceId?: string;
  totalFeedback: number;
  totalComments: number;
  totalResolved: number;
  timeSavedMinutes: number;

  issueTypes: Record<string, number>;
  sessionCounts: Record<string, number>;

  daily: Record<
    string,
    {
      feedback: number;
      comments: number;
      resolved: number;
    }
  >;

  response: {
    totalFirstReplyMs: number;
    count: number;
  };

  updatedAt: FirebaseFirestore.Timestamp | Date | null;
}

type DocumentReference<T = FirebaseFirestore.DocumentData> = FirebaseFirestore.DocumentReference<T>;

function requireWorkspaceId(workspaceId: string, context: string): string {
  const trimmed = workspaceId.trim();
  if (!trimmed) {
    throw new Error(`Missing workspaceId - invalid state (${context})`);
  }
  return trimmed;
}

function num(value: unknown, fallback: number = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getPath(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object") return undefined;
  let cur: any = obj;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

// IMPORTANT: workspaceId is used as document key (previously named userId)
export function workspaceInsightsRef(
  workspaceId: string
): DocumentReference<WorkspaceInsightsDoc> {
  return adminDb.doc(
    `workspaces/${workspaceId}/insights/main`
  ) as DocumentReference<WorkspaceInsightsDoc>;
}

export function emptyWorkspaceInsightsDoc(): WorkspaceInsightsDoc {
  return {
    totalFeedback: 0,
    totalComments: 0,
    totalResolved: 0,
    timeSavedMinutes: 0,
    issueTypes: {},
    sessionCounts: {},
    daily: {},
    response: { totalFirstReplyMs: 0, count: 0 },
    updatedAt: null,
  };
}

function todayKeyUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeIssueTypeForInsights(type: unknown): string {
  return (typeof type === "string" ? type : "").trim() || "general";
}

function feedbackDayKeyUtc(createdAt: Date | FirebaseFirestore.Timestamp | null | undefined): string {
  if (createdAt == null) return todayKeyUtc();
  if (createdAt instanceof Date) {
    return Number.isFinite(createdAt.getTime()) ? createdAt.toISOString().slice(0, 10) : todayKeyUtc();
  }
  if (typeof (createdAt as { toDate?: () => Date }).toDate === "function") {
    const d = (createdAt as { toDate: () => Date }).toDate();
    return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : todayKeyUtc();
  }
  return todayKeyUtc();
}

export async function incrementInsightsOnFeedbackCreateRepo(opts: {
  workspaceId: string;
  sessionId: string;
  type: string;
  /** UTC YYYY-MM-DD for `daily.{day}.feedback`; defaults to today when omitted. */
  feedbackDay?: string;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "incrementInsightsOnFeedbackCreateRepo"
  );
  const { sessionId } = opts;
  const type = normalizeIssueTypeForInsights(opts.type);
  const day = (opts.feedbackDay ?? "").trim() || todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await ref.set(
    {
      workspaceId,
      totalFeedback: FieldValue.increment(1),
      timeSavedMinutes: FieldValue.increment(5),
      [`issueTypes.${type}`]: FieldValue.increment(1),
      [`sessionCounts.${sessionId}`]: FieldValue.increment(1),
      [`daily.${day}.feedback`]: FieldValue.increment(1),
      updatedAt: new Date(),
    } as Record<string, unknown>,
    { merge: true }
  );
}

export async function decrementInsightsOnFeedbackDeleteRepo(opts: {
  workspaceId: string;
  sessionId: string;
  type: string;
  createdAt: Date | FirebaseFirestore.Timestamp;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "decrementInsightsOnFeedbackDeleteRepo"
  );
  const { sessionId } = opts;
  const type = normalizeIssueTypeForInsights(opts.type);
  const day = feedbackDayKeyUtc(opts.createdAt);
  const ref = workspaceInsightsRef(workspaceId);

  await ref.set(
    {
      workspaceId,
      totalFeedback: FieldValue.increment(-1),
      [`issueTypes.${type}`]: FieldValue.increment(-1),
      [`sessionCounts.${sessionId}`]: FieldValue.increment(-1),
      [`daily.${day}.feedback`]: FieldValue.increment(-1),
      updatedAt: new Date(),
    } as Record<string, unknown>,
    { merge: true }
  );
}

export async function updateInsightsOnTypeChangeRepo(opts: {
  workspaceId: string;
  oldType: string;
  newType: string;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(opts.workspaceId, "updateInsightsOnTypeChangeRepo");
  const oldT = normalizeIssueTypeForInsights(opts.oldType);
  const newT = normalizeIssueTypeForInsights(opts.newType);
  if (oldT === newT) return;

  const ref = workspaceInsightsRef(workspaceId);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.exists ? snap.data() : null) ?? emptyWorkspaceInsightsDoc();
    const oldPath = `issueTypes.${oldT}`;
    const newPath = `issueTypes.${newT}`;
    const nextOld = Math.max(0, num(getPath(existing, oldPath)) - 1);
    const nextNew = num(getPath(existing, newPath)) + 1;
    tx.set(
      ref,
      {
        workspaceId,
        [oldPath]: nextOld,
        [newPath]: nextNew,
        updatedAt: new Date(),
      } as Record<string, unknown>,
      { merge: true }
    );
  });
}

export async function updateInsightsOnResolveRepo(opts: {
  workspaceId: string;
  delta: 1 | -1;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(opts.workspaceId, "updateInsightsOnResolveRepo");
  const delta = opts.delta === -1 ? -1 : 1;
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await ref.set(
    {
      workspaceId,
      totalResolved: FieldValue.increment(delta),
      [`daily.${day}.resolved`]: FieldValue.increment(delta),
      updatedAt: new Date(),
    } as Record<string, unknown>,
    { merge: true }
  );
}

export async function incrementInsightsOnCommentCreateRepo(opts: {
  workspaceId: string;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "incrementInsightsOnCommentCreateRepo"
  );
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.exists ? snap.data() : null) ?? emptyWorkspaceInsightsDoc();
    const dailyCommentsPath = `daily.${day}.comments`;
    tx.set(
      ref,
      {
        totalComments: num((existing as any).totalComments) + 1,
        workspaceId,
        [dailyCommentsPath]: num(getPath(existing, dailyCommentsPath)) + 1,
        updatedAt: new Date(),
      } as Record<string, unknown>,
      { merge: true }
    );
  });
}

export async function incrementInsightsOnFeedbackResolvedRepo(opts: {
  workspaceId: string;
  delta: 1 | -1;
}): Promise<void> {
  await updateInsightsOnResolveRepo(opts);
}

type ProcessInsightsEventType =
  | "feedback_created"
  | "comment_created"
  | "feedback_resolved";

export async function processInsightsEventWithIdempotencyRepo(opts: {
  workspaceId: string;
  idempotencyKey: string;
  type: ProcessInsightsEventType;
  payload: {
    sessionId?: string;
    issueType?: string;
    resolved?: boolean;
  };
}): Promise<void> {
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "processInsightsEventWithIdempotencyRepo"
  );
  const idempotencyKey = (opts.idempotencyKey ?? "").trim();
  if (!idempotencyKey) {
    throw new Error("Missing idempotencyKey - invalid state (insights event)");
  }

  const eventRef = adminDb.doc(
    `workspaces/${workspaceId}/insights_events/${idempotencyKey}`
  );
  const { type, payload } = opts;

  try {
    await eventRef.create({
      workspaceId,
      type,
      createdAt: new Date(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Firestore throws ALREADY_EXISTS when the marker doc was already created.
    if (!/already exists/i.test(message)) {
      throw error;
    }
    return;
  }

  if (type === "feedback_created") {
    const sessionId = (payload.sessionId ?? "").trim();
    if (!sessionId) {
      throw new Error("Missing sessionId - invalid state (feedback_created)");
    }
    await incrementInsightsOnFeedbackCreateRepo({
      workspaceId,
      sessionId,
      type: (payload.issueType ?? "").trim() || "general",
    });
    return;
  }

  if (type === "comment_created") {
    await incrementInsightsOnCommentCreateRepo({ workspaceId });
    return;
  }

  if (type === "feedback_resolved") {
    await incrementInsightsOnFeedbackResolvedRepo({
      workspaceId,
      delta: payload.resolved === true ? 1 : -1,
    });
    return;
  }

  throw new Error(`Unsupported insights event type: ${String(type)}`);
}

