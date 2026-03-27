import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
  type WorkspaceInsightsDoc,
} from "@/lib/repositories/insightsRepository.server";

export interface InsightsApiResponse {
  lifetime: {
    totalFeedback: number;
    totalComments: number;
    totalResolved: number;
    timeSavedMinutes: number;
    resolutionRate: number;
  };
  analytics: {
    daily: WorkspaceInsightsDoc["daily"];
    issueTypes: WorkspaceInsightsDoc["issueTypes"];
    sessionCounts: WorkspaceInsightsDoc["sessionCounts"];
    response: WorkspaceInsightsDoc["response"];
  };
}

const INSIGHTS_CACHE_TTL_MS = 5_000;
const insightsCache = new Map<string, { data: InsightsApiResponse; expiresAt: number }>();

/**
 * GET /api/insights
 * Single source of truth: ONLY reads workspaces/{workspaceId}/insights/main.
 */
export async function GET(req: Request) {
  let user;
  try {
    const debugUid =
      process.env.NODE_ENV !== "production"
        ? req.headers.get("x-debug-uid")
        : null;
    user = debugUid ? { uid: debugUid } : await requireAuth(req);
  } catch (res) {
    return res as Response;
  }

  try {
    // Single source of truth and single Firestore read:
    // We intentionally avoid resolving workspace via additional Firestore reads.
    const workspaceId = user.uid;

    const now = Date.now();
    const isDev = process.env.NODE_ENV !== "production";
    const disableCache =
      isDev || new URL(req.url).searchParams.get("nocache") === "1";
    const cacheKey = workspaceId;

    const cached = insightsCache.get(cacheKey);
    if (!disableCache && cached && now < cached.expiresAt) {
      return NextResponse.json(cached.data);
    }

    const snap = await workspaceInsightsRef(workspaceId).get();
    const docData = snap.exists
      ? ((snap.data() as WorkspaceInsightsDoc) ?? emptyWorkspaceInsightsDoc())
      : emptyWorkspaceInsightsDoc();

    const totalFeedback = Math.max(0, Number(docData.totalFeedback) || 0);
    const totalComments = Math.max(0, Number(docData.totalComments) || 0);
    const totalResolved = Math.max(0, Number(docData.totalResolved) || 0);
    const timeSavedMinutes = Math.max(0, Number(docData.timeSavedMinutes) || 0);
    const resolutionRate =
      totalFeedback > 0 ? Math.round((totalResolved / totalFeedback) * 100) : 0;

    const data: InsightsApiResponse = {
      lifetime: {
        totalFeedback,
        totalComments,
        totalResolved,
        timeSavedMinutes,
        resolutionRate,
      },
      analytics: {
        daily: docData.daily ?? {},
        issueTypes: docData.issueTypes ?? {},
        sessionCounts: docData.sessionCounts ?? {},
        response: docData.response ?? { totalFirstReplyMs: 0, count: 0 },
      },
    };

    insightsCache.set(cacheKey, { data, expiresAt: now + INSIGHTS_CACHE_TTL_MS });
    return NextResponse.json(data);
  } catch (error) {
    console.error("INSIGHTS ERROR FULL:", error);
    throw error;
  }
}
