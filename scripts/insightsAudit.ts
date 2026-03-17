/**
 * Insights end-to-end audit (read-only).
 *
 * Usage:
 *   npx tsx scripts/insightsAudit.ts --workspaceId <id>
 *
 * Optional:
 *   --apiBaseUrl http://localhost:3000     (default)
 *   --noApi                                (skip GET /api/insights validation)
 *   --reportPath docs/INSIGHTS_AUDIT_REPORT.md (default)
 *
 * Notes:
 * - Uses Firestore Web SDK (same as other scripts in this repo).
 * - Performs only reads; does not write to Firestore.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
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
import fs from "node:fs";
import path from "node:path";

type DailyBucket = { feedback: number; comments: number };

type RawGroundTruth = {
  totalFeedbackRaw: number;
  totalCommentsRaw: number;
  timeSavedRaw: number;
  issueTypesRaw: Record<string, number>;
  sessionCountsRaw: Record<string, number>;
  dailyRaw: Record<string, DailyBucket>;
  anomalies: Array<{ kind: string; message: string; docId?: string }>;
};

type DiffEntry = {
  path: string;
  expected: unknown;
  actual: unknown;
  severity: "critical" | "high" | "medium" | "low";
  note?: string;
};

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

function toMs(ts: Timestamp | { toDate?: () => Date; seconds?: number } | null | undefined): number | null {
  if (!ts) return null;
  const d = typeof (ts as { toDate?: () => Date }).toDate === "function" ? (ts as { toDate: () => Date }).toDate() : null;
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

function incDaily(daily: Record<string, DailyBucket>, day: string, field: "feedback" | "comments", by = 1) {
  if (!day) return;
  const b = daily[day] ?? { feedback: 0, comments: 0 };
  b[field] = (b[field] ?? 0) + by;
  daily[day] = b;
}

function normalizeCountMap(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input || typeof input !== "object") return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const key = String(k);
    const num = Number(v);
    if (!Number.isFinite(num)) continue;
    out[key] = Math.max(0, Math.floor(num));
  }
  return out;
}

function normalizeDailyMap(input: unknown): Record<string, DailyBucket> {
  const out: Record<string, DailyBucket> = {};
  if (!input || typeof input !== "object") return out;
  for (const [date, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const obj = (v ?? {}) as Record<string, unknown>;
    const feedback = Math.max(0, Math.floor(Number(obj.feedback) || 0));
    const comments = Math.max(0, Math.floor(Number(obj.comments) || 0));
    out[date] = { feedback, comments };
  }
  return out;
}

function diffNumber(path: string, expected: number, actual: number, severity: DiffEntry["severity"]): DiffEntry[] {
  if (expected !== actual) {
    return [{ path, expected, actual, severity }];
  }
  return [];
}

function diffCountMap(path: string, expected: Record<string, number>, actual: Record<string, number>, severity: DiffEntry["severity"]): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  for (const k of [...keys].sort()) {
    const e = expected[k] ?? 0;
    const a = actual[k] ?? 0;
    if (e !== a) {
      diffs.push({
        path: `${path}.${k}`,
        expected: e,
        actual: a,
        severity,
      });
    }
  }
  return diffs;
}

function diffDaily(path: string, expected: Record<string, DailyBucket>, actual: Record<string, DailyBucket>, severity: DiffEntry["severity"]): DiffEntry[] {
  const diffs: DiffEntry[] = [];
  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  for (const date of [...keys].sort()) {
    const e = expected[date] ?? { feedback: 0, comments: 0 };
    const a = actual[date] ?? { feedback: 0, comments: 0 };
    if ((e.feedback ?? 0) !== (a.feedback ?? 0)) {
      diffs.push({ path: `${path}.${date}.feedback`, expected: e.feedback ?? 0, actual: a.feedback ?? 0, severity });
    }
    if ((e.comments ?? 0) !== (a.comments ?? 0)) {
      diffs.push({ path: `${path}.${date}.comments`, expected: e.comments ?? 0, actual: a.comments ?? 0, severity });
    }
  }
  return diffs;
}

async function streamQueryDocs(opts: {
  coll: ReturnType<typeof collection>;
  workspaceId: string;
  orderByField: string;
  whereField: string;
  batchSize: number;
  onBatch: (docs: QueryDocumentSnapshot[]) => Promise<void> | void;
}) {
  const { coll, workspaceId, whereField, orderByField, batchSize, onBatch } = opts;
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

async function computeGroundTruth(workspaceId: string): Promise<RawGroundTruth> {
  const issueTypesRaw: Record<string, number> = {};
  const sessionCountsRaw: Record<string, number> = {};
  const dailyRaw: Record<string, DailyBucket> = {};
  const anomalies: RawGroundTruth["anomalies"] = [];

  let totalFeedbackRaw = 0;
  let totalCommentsRaw = 0;

  // Feedback
  await streamQueryDocs({
    coll: collection(db, "feedback"),
    workspaceId,
    whereField: "workspaceId",
    orderByField: "createdAt",
    batchSize: 500,
    onBatch: async (docs) => {
      for (const d of docs) {
        totalFeedbackRaw += 1;
        const data = d.data() as Record<string, unknown>;
        const type = (typeof data.type === "string" ? data.type : "").trim() || "general";
        const sessionId = (typeof data.sessionId === "string" ? data.sessionId : "").trim();
        inc(issueTypesRaw, type, 1);
        if (sessionId) inc(sessionCountsRaw, sessionId, 1);
        else anomalies.push({ kind: "feedback_missing_sessionId", message: "feedback missing sessionId", docId: d.id });

        const ms = toMs(data.createdAt as Timestamp | null);
        if (ms == null) anomalies.push({ kind: "feedback_missing_createdAt", message: "feedback missing createdAt", docId: d.id });
        else incDaily(dailyRaw, dayKeyUtcFromMs(ms), "feedback", 1);
      }
    },
  });

  // Comments
  await streamQueryDocs({
    coll: collection(db, "comments"),
    workspaceId,
    whereField: "workspaceId",
    orderByField: "createdAt",
    batchSize: 500,
    onBatch: async (docs) => {
      for (const d of docs) {
        totalCommentsRaw += 1;
        const data = d.data() as Record<string, unknown>;
        const ms = toMs(data.createdAt as Timestamp | null);
        if (ms == null) anomalies.push({ kind: "comment_missing_createdAt", message: "comment missing createdAt", docId: d.id });
        else incDaily(dailyRaw, dayKeyUtcFromMs(ms), "comments", 1);
      }
    },
  });

  const timeSavedRaw = totalFeedbackRaw * 5;

  return {
    totalFeedbackRaw,
    totalCommentsRaw,
    timeSavedRaw,
    issueTypesRaw,
    sessionCountsRaw,
    dailyRaw,
    anomalies,
  };
}

async function loadInsightsDoc(workspaceId: string): Promise<WorkspaceInsightsDoc> {
  const snap = await getDoc(workspaceInsightsRef(workspaceId));
  return snap.exists() ? (snap.data() as WorkspaceInsightsDoc) : emptyWorkspaceInsightsDoc();
}

async function loadInsightsApi(opts: { workspaceId: string; apiBaseUrl: string }): Promise<unknown> {
  const { workspaceId, apiBaseUrl } = opts;
  const url = new URL("/api/insights?nocache=1", apiBaseUrl);
  const res = await fetch(url, {
    headers: {
      // supported in non-production per app/api/insights/route.ts
      "x-debug-uid": workspaceId,
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { parseError: true, raw: text };
  }
  if (!res.ok) {
    throw new Error(`GET /api/insights failed: ${res.status} ${res.statusText} body=${text.slice(0, 400)}`);
  }
  return json;
}

function compareInsights(opts: {
  raw: RawGroundTruth;
  insightsDoc: WorkspaceInsightsDoc;
}): { diffs: DiffEntry[]; warnings: string[] } {
  const { raw, insightsDoc } = opts;
  const diffs: DiffEntry[] = [];
  const warnings: string[] = [];

  const docTotalFeedback = Math.max(0, Math.floor(Number(insightsDoc.totalFeedback) || 0));
  const docTotalComments = Math.max(0, Math.floor(Number(insightsDoc.totalComments) || 0));
  const docTimeSaved = Math.max(0, Math.floor(Number(insightsDoc.timeSavedMinutes) || 0));

  diffs.push(...diffNumber("insights.totalFeedback", raw.totalFeedbackRaw, docTotalFeedback, "critical"));
  diffs.push(...diffNumber("insights.totalComments", raw.totalCommentsRaw, docTotalComments, "critical"));
  diffs.push(...diffNumber("insights.timeSavedMinutes", raw.timeSavedRaw, docTimeSaved, "high"));

  const docIssueTypes = normalizeCountMap(insightsDoc.issueTypes);
  const docSessionCounts = normalizeCountMap(insightsDoc.sessionCounts);
  const docDaily = normalizeDailyMap(insightsDoc.daily);

  diffs.push(...diffCountMap("insights.issueTypes", raw.issueTypesRaw, docIssueTypes, "high"));
  diffs.push(...diffCountMap("insights.sessionCounts", raw.sessionCountsRaw, docSessionCounts, "high"));
  diffs.push(...diffDaily("insights.daily", raw.dailyRaw, docDaily, "high"));

  // Detect missing fields / zero values where raw > 0
  if (!insightsDoc.issueTypes || typeof insightsDoc.issueTypes !== "object") warnings.push("insights.issueTypes missing or invalid");
  if (!insightsDoc.sessionCounts || typeof insightsDoc.sessionCounts !== "object") warnings.push("insights.sessionCounts missing or invalid");
  if (!insightsDoc.daily || typeof insightsDoc.daily !== "object") warnings.push("insights.daily missing or invalid");

  if (raw.totalFeedbackRaw > 0 && docTotalFeedback === 0) warnings.push("insights.totalFeedback is 0 but raw feedback > 0");
  if (raw.totalCommentsRaw > 0 && docTotalComments === 0) warnings.push("insights.totalComments is 0 but raw comments > 0");
  if (raw.timeSavedRaw > 0 && docTimeSaved === 0) warnings.push("insights.timeSavedMinutes is 0 but raw feedback > 0");

  return { diffs, warnings };
}

function compareApiToDoc(api: unknown, insightsDoc: WorkspaceInsightsDoc): { diffs: DiffEntry[]; warnings: string[] } {
  const diffs: DiffEntry[] = [];
  const warnings: string[] = [];
  if (!api || typeof api !== "object") {
    warnings.push("API response is not an object");
    return { diffs, warnings };
  }
  const obj = api as Record<string, unknown>;
  const lifetime = (obj.lifetime ?? null) as Record<string, unknown> | null;
  const analytics = (obj.analytics ?? null) as Record<string, unknown> | null;
  if (!lifetime || typeof lifetime !== "object") warnings.push("API missing lifetime");
  if (!analytics || typeof analytics !== "object") warnings.push("API missing analytics");

  const apiTotalFeedback = Math.max(0, Math.floor(Number(lifetime?.totalFeedback) || 0));
  const apiTotalComments = Math.max(0, Math.floor(Number(lifetime?.totalComments) || 0));
  const apiTimeSaved = Math.max(0, Math.floor(Number(lifetime?.timeSavedMinutes) || 0));

  diffs.push(...diffNumber("api.lifetime.totalFeedback", Math.max(0, Math.floor(Number(insightsDoc.totalFeedback) || 0)), apiTotalFeedback, "critical"));
  diffs.push(...diffNumber("api.lifetime.totalComments", Math.max(0, Math.floor(Number(insightsDoc.totalComments) || 0)), apiTotalComments, "critical"));
  diffs.push(...diffNumber("api.lifetime.timeSavedMinutes", Math.max(0, Math.floor(Number(insightsDoc.timeSavedMinutes) || 0)), apiTimeSaved, "high"));

  const apiIssueTypes = normalizeCountMap(analytics?.issueTypes);
  const apiSessionCounts = normalizeCountMap(analytics?.sessionCounts);
  const apiDaily = normalizeDailyMap(analytics?.daily);

  diffs.push(...diffCountMap("api.analytics.issueTypes", normalizeCountMap(insightsDoc.issueTypes), apiIssueTypes, "high"));
  diffs.push(...diffCountMap("api.analytics.sessionCounts", normalizeCountMap(insightsDoc.sessionCounts), apiSessionCounts, "high"));
  diffs.push(...diffDaily("api.analytics.daily", normalizeDailyMap(insightsDoc.daily), apiDaily, "high"));

  return { diffs, warnings };
}

function computeConfidenceScore(allDiffs: DiffEntry[], anomalyCount: number): number {
  let score = 100;
  for (const d of allDiffs) {
    if (d.severity === "critical") score -= 25;
    else if (d.severity === "high") score -= 8;
    else if (d.severity === "medium") score -= 4;
    else score -= 1;
  }
  score -= Math.min(15, anomalyCount); // cap anomaly penalty
  return Math.max(0, Math.min(100, Math.round(score)));
}

function isFail(allDiffs: DiffEntry[]): boolean {
  // Any mismatch on the three lifetime totals is a fail.
  return allDiffs.some((d) => d.severity === "critical");
}

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function topDiffs(diffs: DiffEntry[], max = 50): DiffEntry[] {
  const weight = (s: DiffEntry["severity"]) => (s === "critical" ? 4 : s === "high" ? 3 : s === "medium" ? 2 : 1);
  return [...diffs]
    .sort((a, b) => weight(b.severity) - weight(a.severity) || a.path.localeCompare(b.path))
    .slice(0, max);
}

function uiStructuralValidationNotes(): string[] {
  // Based on app/(app)/dashboard/insights/page.tsx and app/api/insights/route.ts
  return [
    "Time saved is displayed from `data.lifetime.timeSavedMinutes` (lifetime), not range-filtered.",
    "Charts are derived from `analytics.daily` and then filtered by selected range via `filterDaily(daily, rangeDays)`.",
    "Range affects only the Activity chart + in-range totals; Issue Types and Top Sessions use lifetime `issueTypes` / `sessionCounts` (no range filtering).",
    "API (`GET /api/insights`) reads only `workspaces/{workspaceId}/insights/main` and maps fields 1:1 into `lifetime` and `analytics`.",
  ];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspaceId =
    (typeof args.workspaceId === "string" ? args.workspaceId : "") ||
    process.env.AUDIT_WORKSPACE_ID ||
    process.env.WORKSPACE_ID ||
    "";
  if (!workspaceId) {
    console.error("Missing workspaceId. Provide --workspaceId <id> or set AUDIT_WORKSPACE_ID.");
    process.exit(1);
  }

  const apiBaseUrl = (typeof args.apiBaseUrl === "string" ? args.apiBaseUrl : "") || process.env.AUDIT_API_BASE_URL || "http://localhost:3000";
  const noApi = args.noApi === true || process.env.AUDIT_NO_API === "1";
  const reportPathRel = (typeof args.reportPath === "string" ? args.reportPath : "") || "docs/INSIGHTS_AUDIT_REPORT.md";
  const reportAbs = path.resolve(process.cwd(), reportPathRel);

  const startedAt = new Date();

  const insightsDoc = await loadInsightsDoc(workspaceId);
  const raw = await computeGroundTruth(workspaceId);
  const docCompare = compareInsights({ raw, insightsDoc });

  let apiJson: unknown = null;
  let apiCompare: { diffs: DiffEntry[]; warnings: string[] } = { diffs: [], warnings: [] };
  let apiError: string | null = null;
  if (!noApi) {
    try {
      apiJson = await loadInsightsApi({ workspaceId, apiBaseUrl });
      apiCompare = compareApiToDoc(apiJson, insightsDoc);
    } catch (e) {
      apiError = e instanceof Error ? e.message : String(e);
      apiCompare.warnings.push(`API validation failed: ${apiError}`);
    }
  }

  const allDiffs = [...docCompare.diffs, ...apiCompare.diffs];
  const confidence = computeConfidenceScore(allDiffs, raw.anomalies.length);
  const fail = isFail(allDiffs);

  const mismatches = topDiffs(allDiffs, 80);
  const missingFieldWarnings = [...docCompare.warnings, ...apiCompare.warnings];

  const reportLines: string[] = [];
  reportLines.push(`# INSIGHTS AUDIT REPORT`);
  reportLines.push(``);
  reportLines.push(`- **Workspace**: \`${workspaceId}\``);
  reportLines.push(`- **Generated at**: \`${startedAt.toISOString()}\``);
  reportLines.push(`- **API base URL**: \`${apiBaseUrl}\``);
  reportLines.push(`- **API validation**: ${noApi ? "**SKIPPED**" : apiError ? `**FAILED** (${apiError})` : "**OK**"}`);
  reportLines.push(`- **Result**: ${fail ? "**FAIL**" : "**PASS**"}`);
  reportLines.push(`- **Confidence score**: **${confidence}%**`);
  reportLines.push(``);

  reportLines.push(`## Raw counts (ground truth)`);
  reportLines.push(``);
  reportLines.push(`- **totalFeedbackRaw**: ${raw.totalFeedbackRaw}`);
  reportLines.push(`- **totalCommentsRaw**: ${raw.totalCommentsRaw}`);
  reportLines.push(`- **timeSavedRaw (minutes)**: ${raw.timeSavedRaw}`);
  reportLines.push(``);

  reportLines.push(`## Insights doc values`);
  reportLines.push(``);
  reportLines.push(`- **insights.totalFeedback**: ${Math.max(0, Math.floor(Number(insightsDoc.totalFeedback) || 0))}`);
  reportLines.push(`- **insights.totalComments**: ${Math.max(0, Math.floor(Number(insightsDoc.totalComments) || 0))}`);
  reportLines.push(`- **insights.timeSavedMinutes**: ${Math.max(0, Math.floor(Number(insightsDoc.timeSavedMinutes) || 0))}`);
  reportLines.push(`- **insights.issueTypes keys**: ${Object.keys(normalizeCountMap(insightsDoc.issueTypes)).length}`);
  reportLines.push(`- **insights.sessionCounts keys**: ${Object.keys(normalizeCountMap(insightsDoc.sessionCounts)).length}`);
  reportLines.push(`- **insights.daily days**: ${Object.keys(normalizeDailyMap(insightsDoc.daily)).length}`);
  reportLines.push(``);

  reportLines.push(`## Differences`);
  reportLines.push(``);
  if (mismatches.length === 0) {
    reportLines.push(`No mismatches detected.`);
  } else {
    reportLines.push(`Top mismatches (showing ${mismatches.length}):`);
    reportLines.push(``);
    reportLines.push(`| Path | Expected (raw/doc) | Actual (doc/api) | Severity |`);
    reportLines.push(`|---|---:|---:|---|`);
    for (const d of mismatches) {
      reportLines.push(`| \`${d.path}\` | \`${String(d.expected)}\` | \`${String(d.actual)}\` | **${d.severity}** |`);
    }
  }
  reportLines.push(``);

  reportLines.push(`## Problems detected`);
  reportLines.push(``);
  const problems: string[] = [];
  for (const w of missingFieldWarnings) problems.push(w);
  for (const a of raw.anomalies.slice(0, 100)) problems.push(`${a.kind}${a.docId ? ` (${a.docId})` : ""}: ${a.message}`);
  if (problems.length === 0) {
    reportLines.push(`No problems detected.`);
  } else {
    reportLines.push(`- ` + problems.map((p) => p.replace(/\r?\n/g, " ")).join(`\n- `));
    if (raw.anomalies.length > 100) {
      reportLines.push(`- (truncated) ${raw.anomalies.length - 100} more anomaly entries not shown`);
    }
  }
  reportLines.push(``);

  reportLines.push(`## UI validation (structural)`);
  reportLines.push(``);
  for (const note of uiStructuralValidationNotes()) {
    reportLines.push(`- ${note}`);
  }
  reportLines.push(``);

  reportLines.push(`## Snapshots (for debugging)`);
  reportLines.push(``);
  reportLines.push(`### Insights doc (normalized)`);
  reportLines.push(``);
  reportLines.push("```json");
  reportLines.push(
    formatJson({
      totalFeedback: Math.max(0, Math.floor(Number(insightsDoc.totalFeedback) || 0)),
      totalComments: Math.max(0, Math.floor(Number(insightsDoc.totalComments) || 0)),
      timeSavedMinutes: Math.max(0, Math.floor(Number(insightsDoc.timeSavedMinutes) || 0)),
      issueTypes: normalizeCountMap(insightsDoc.issueTypes),
      sessionCounts: normalizeCountMap(insightsDoc.sessionCounts),
      daily: normalizeDailyMap(insightsDoc.daily),
      response: insightsDoc.response ?? null,
      updatedAt: insightsDoc.updatedAt ?? null,
    })
  );
  reportLines.push("```");
  reportLines.push(``);

  reportLines.push(`### Raw ground truth (summary)`);
  reportLines.push(``);
  reportLines.push("```json");
  reportLines.push(
    formatJson({
      totalFeedbackRaw: raw.totalFeedbackRaw,
      totalCommentsRaw: raw.totalCommentsRaw,
      timeSavedRaw: raw.timeSavedRaw,
      issueTypesRawKeys: Object.keys(raw.issueTypesRaw).length,
      sessionCountsRawKeys: Object.keys(raw.sessionCountsRaw).length,
      dailyRawDays: Object.keys(raw.dailyRaw).length,
      anomalies: raw.anomalies.length,
    })
  );
  reportLines.push("```");
  reportLines.push(``);

  if (!noApi) {
    reportLines.push(`### API response (raw)`);
    reportLines.push(``);
    reportLines.push("```json");
    reportLines.push(formatJson(apiJson));
    reportLines.push("```");
    reportLines.push(``);
  }

  fs.mkdirSync(path.dirname(reportAbs), { recursive: true });
  fs.writeFileSync(reportAbs, reportLines.join("\n"), "utf8");

  const mismatchSummary = mismatches.slice(0, 10).map((d) => `${d.severity.toUpperCase()}: ${d.path} expected=${d.expected} actual=${d.actual}`);

  console.log("INSIGHTS AUDIT RESULT");
  console.log(fail ? "FAIL" : "PASS");
  if (mismatchSummary.length > 0) {
    console.log("mismatches:");
    for (const line of mismatchSummary) console.log("-", line);
  } else {
    console.log("mismatches: none");
  }
  console.log(`report: ${reportPathRel}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

