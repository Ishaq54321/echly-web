import {
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  type DocumentReference,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface WorkspaceInsightsDoc {
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

  updatedAt: Timestamp | null;
}

export function workspaceInsightsRef(
  workspaceId: string
): DocumentReference<WorkspaceInsightsDoc> {
  return doc(
    db,
    "workspaces",
    workspaceId,
    "insights",
    "main"
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

export async function incrementInsightsOnFeedbackCreateRepo(opts: {
  workspaceId: string;
  sessionId: string;
  type: string;
}): Promise<void> {
  const { workspaceId, sessionId } = opts;
  const type = (opts.type ?? "").trim() || "general";
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, emptyWorkspaceInsightsDoc());
    }
    tx.update(ref, {
      totalFeedback: increment(1),
      timeSavedMinutes: increment(5),
      [`issueTypes.${type}`]: increment(1),
      [`sessionCounts.${sessionId}`]: increment(1),
      [`daily.${day}.feedback`]: increment(1),
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
  });
}

export async function incrementInsightsOnCommentCreateRepo(opts: {
  workspaceId: string;
}): Promise<void> {
  const { workspaceId } = opts;
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, emptyWorkspaceInsightsDoc());
    }
    tx.update(ref, {
      totalComments: increment(1),
      [`daily.${day}.comments`]: increment(1),
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
  });
}

export async function incrementInsightsOnFeedbackResolvedRepo(opts: {
  workspaceId: string;
  delta: 1 | -1;
}): Promise<void> {
  const { workspaceId, delta } = opts;
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, emptyWorkspaceInsightsDoc());
    }
    tx.update(ref, {
      totalResolved: increment(delta),
      [`daily.${day}.resolved`]: increment(delta),
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
  });
}

