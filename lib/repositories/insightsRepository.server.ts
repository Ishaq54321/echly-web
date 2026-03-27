import "server-only";
import { adminDb } from "@/lib/server/firebaseAdmin";

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

export async function incrementInsightsOnFeedbackCreateRepo(opts: {
  workspaceId: string;
  sessionId: string;
  type: string;
}): Promise<void> {
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "incrementInsightsOnFeedbackCreateRepo"
  );
  const { sessionId } = opts;
  const type = (opts.type ?? "").trim() || "general";
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.exists ? snap.data() : null) ?? emptyWorkspaceInsightsDoc();
    const issueTypePath = `issueTypes.${type}`;
    const sessionCountPath = `sessionCounts.${sessionId}`;
    const dailyFeedbackPath = `daily.${day}.feedback`;
    tx.set(
      ref,
      {
        totalFeedback: num((existing as any).totalFeedback) + 1,
        workspaceId,
        timeSavedMinutes: num((existing as any).timeSavedMinutes) + 5,
        [issueTypePath]: num(getPath(existing, issueTypePath)) + 1,
        [sessionCountPath]: num(getPath(existing, sessionCountPath)) + 1,
        [dailyFeedbackPath]: num(getPath(existing, dailyFeedbackPath)) + 1,
        updatedAt: new Date(),
      } as Record<string, unknown>,
      { merge: true }
    );
  });
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
  const workspaceId = requireWorkspaceId(
    opts.workspaceId,
    "incrementInsightsOnFeedbackResolvedRepo"
  );
  const { delta } = opts;
  const day = todayKeyUtc();
  const ref = workspaceInsightsRef(workspaceId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing = (snap.exists ? snap.data() : null) ?? emptyWorkspaceInsightsDoc();
    const dailyResolvedPath = `daily.${day}.resolved`;
    tx.set(
      ref,
      {
        totalResolved: num((existing as any).totalResolved) + delta,
        workspaceId,
        [dailyResolvedPath]: num(getPath(existing, dailyResolvedPath)) + delta,
        updatedAt: new Date(),
      } as Record<string, unknown>,
      { merge: true }
    );
  });
}

