/**
 * One-time migration: backfill `workspaces/{workspaceId}/insights/main`
 * from existing Firestore `feedback` + `comments` collections.
 *
 * Usage:
 *   npx tsx scripts/backfillInsights.ts --workspaceId <id>
 *
 * Safety:
 * - Overwrites the insights doc (no merge)
 * - Logs before/after doc snapshots
 * - Does NOT delete anything
 */
import {
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
  type WorkspaceInsightsDoc,
} from "@/lib/repositories/insightsRepository";

type DailyBucket = { feedback: number; comments: number; resolved: number };

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function toMs(
  ts: Timestamp | { toDate?: () => Date; seconds?: number } | null | undefined
): number | null {
  if (!ts) return null;
  const d =
    typeof (ts as { toDate?: () => Date }).toDate === "function"
      ? (ts as { toDate: () => Date }).toDate()
      : null;
  if (d) return d.getTime();
  const seconds = (ts as { seconds?: number }).seconds;
  if (typeof seconds === "number") return seconds * 1000;
  return null;
}

function dayKeyUtcFromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function inc(map: Record<string, number>, key: string, by = 1) {
  if (!key) return;
  map[key] = (map[key] ?? 0) + by;
}

function incDaily(
  daily: Record<string, DailyBucket>,
  day: string,
  field: "feedback" | "comments" | "resolved",
  by = 1
) {
  if (!day) return;
  const b = daily[day] ?? { feedback: 0, comments: 0, resolved: 0 };
  b[field] = (b[field] ?? 0) + by;
  daily[day] = b;
}

async function streamQueryDocs(opts: {
  coll: ReturnType<typeof collection>;
  workspaceId: string;
  orderByField: string;
  whereField: string;
  batchSize: number;
  onBatch: (docs: QueryDocumentSnapshot[]) => Promise<void> | void;
}) {
  const { coll, workspaceId, whereField, orderByField, batchSize, onBatch } =
    opts;
  let cursor: QueryDocumentSnapshot | null = null;
  while (true) {
    const q = query(
      coll,
      where(whereField, "==", workspaceId),
      orderBy(orderByField, "desc"),
      ...(cursor ? [startAfter(cursor)] : []),
      limit(batchSize)
    );
    const snap = await getDocs(q);
    if (snap.docs.length === 0) break;
    await onBatch(snap.docs as QueryDocumentSnapshot[]);
    cursor = snap.docs[snap.docs.length - 1] as QueryDocumentSnapshot;
    if (snap.docs.length < batchSize) break;
  }
}

function normalizeDocForLog(doc: WorkspaceInsightsDoc | null): unknown {
  if (!doc) return null;
  return {
    totalFeedback: Math.max(0, Math.floor(Number(doc.totalFeedback) || 0)),
    totalComments: Math.max(0, Math.floor(Number(doc.totalComments) || 0)),
    totalResolved: Math.max(0, Math.floor(Number(doc.totalResolved) || 0)),
    timeSavedMinutes: Math.max(0, Math.floor(Number(doc.timeSavedMinutes) || 0)),
    issueTypesKeys: Object.keys((doc.issueTypes ?? {}) as Record<string, number>)
      .length,
    sessionCountsKeys: Object.keys(
      (doc.sessionCounts ?? {}) as Record<string, number>
    ).length,
    dailyDays: Object.keys((doc.daily ?? {}) as Record<string, DailyBucket>)
      .length,
    response: doc.response ?? null,
    updatedAt: (doc.updatedAt as unknown) ?? null,
  };
}

async function loadInsightsDoc(workspaceId: string): Promise<WorkspaceInsightsDoc> {
  const snap = await getDoc(workspaceInsightsRef(workspaceId));
  return snap.exists()
    ? (snap.data() as WorkspaceInsightsDoc)
    : emptyWorkspaceInsightsDoc();
}

async function computeBackfill(workspaceId: string): Promise<{
  totalFeedback: number;
  totalComments: number;
  totalResolved: number;
  timeSavedMinutes: number;
  issueTypes: Record<string, number>;
  sessionCounts: Record<string, number>;
  daily: Record<string, DailyBucket>;
}> {
  const issueTypes: Record<string, number> = {};
  const sessionCounts: Record<string, number> = {};
  const daily: Record<string, DailyBucket> = {};

  let totalFeedback = 0;
  let totalComments = 0;
  let totalResolved = 0;

  await streamQueryDocs({
    coll: collection(db, "feedback"),
    workspaceId,
    whereField: "workspaceId",
    orderByField: "createdAt",
    batchSize: 500,
    onBatch: async (docs) => {
      for (const d of docs) {
        totalFeedback += 1;
        const data = d.data() as Record<string, unknown>;
        if (data.status === "resolved") {
          totalResolved += 1;
        }

        const type = (typeof data.type === "string" ? data.type : "").trim() ||
          "general";
        inc(issueTypes, type, 1);

        const sessionId = (typeof data.sessionId === "string"
          ? data.sessionId
          : ""
        ).trim();
        if (sessionId) inc(sessionCounts, sessionId, 1);

        const ms = toMs(data.createdAt as Timestamp | null);
        if (ms != null) {
          const day = dayKeyUtcFromMs(ms);
          incDaily(daily, day, "feedback", 1);
          if (data.status === "resolved") incDaily(daily, day, "resolved", 1);
        }
      }
    },
  });

  await streamQueryDocs({
    coll: collection(db, "comments"),
    workspaceId,
    whereField: "workspaceId",
    orderByField: "createdAt",
    batchSize: 500,
    onBatch: async (docs) => {
      for (const d of docs) {
        totalComments += 1;
        const data = d.data() as Record<string, unknown>;
        const ms = toMs(data.createdAt as Timestamp | null);
        if (ms != null) incDaily(daily, dayKeyUtcFromMs(ms), "comments", 1);
      }
    },
  });

  return {
    totalFeedback,
    totalComments,
    totalResolved,
    timeSavedMinutes: totalFeedback * 5,
    issueTypes,
    sessionCounts,
    daily,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspaceId =
    (typeof args.workspaceId === "string" ? args.workspaceId : "") ||
    process.env.WORKSPACE_ID ||
    "";
  if (!workspaceId) {
    console.error("Missing workspaceId. Provide --workspaceId <id>.");
    process.exit(1);
  }

  console.log(`Backfilling insights for workspace: ${workspaceId}\n`);

  const before = await loadInsightsDoc(workspaceId);
  console.log("Before (summary):");
  console.log(JSON.stringify(normalizeDocForLog(before), null, 2));
  console.log("");

  const computed = await computeBackfill(workspaceId);
  console.log("Computed (to write):");
  console.log(JSON.stringify(computed, null, 2));
  console.log("");

  const ref = workspaceInsightsRef(workspaceId);
  await setDoc(
    ref,
    {
      ...computed,
      response: { totalFirstReplyMs: 0, count: 0 },
      updatedAt: serverTimestamp(),
    } as WorkspaceInsightsDoc,
    { merge: false }
  );

  const after = await loadInsightsDoc(workspaceId);
  console.log("After (summary):");
  console.log(JSON.stringify(normalizeDocForLog(after), null, 2));
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

