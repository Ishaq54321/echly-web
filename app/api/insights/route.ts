import { resolveDebugUid } from "@/lib/server/debugUid";
import { requireAuth, toAuthorizationResponse } from "@/lib/server/auth/authorize";
import { resolveWorkspaceForUser } from "@/lib/server/resolveWorkspaceForUser";
import {
  emptyWorkspaceInsightsDoc,
  workspaceInsightsRef,
  type WorkspaceInsightsDoc,
} from "@/lib/repositories/insightsRepository.server";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";

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
 * Single source of truth for per-workspace insights.
 */
export async function GET(req: Request) {
  let user;
  try {
    const debug = resolveDebugUid(req);
    if (debug.status === "forbidden") {
      return debug.response;
    }
    user =
      debug.status === "ok"
        ? { uid: debug.uid }
        : await requireAuth(req);
  } catch (err) {
    return toAuthorizationResponse(err);
  }

  try {
    const { workspaceId } = await resolveWorkspaceForUser(user.uid, req);

    const now = Date.now();
    const isDev = process.env.NODE_ENV === "development";
    const disableCache =
      isDev || new URL(req.url).searchParams.get("nocache") === "1";
    const cacheKey = workspaceId;

    const cached = insightsCache.get(cacheKey);
    if (!disableCache && cached && now < cached.expiresAt) {
      return apiSuccess(cached.data);
    }

    const snap = await workspaceInsightsRef(workspaceId).get();
    if (!snap.exists) {
      return apiError({ code: "NOT_FOUND", message: "Insights not found", status: 404 });
    }
    const docData =
      (snap.data() as WorkspaceInsightsDoc) ?? emptyWorkspaceInsightsDoc();

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
    return apiSuccess(data);
  } catch (error) {
    console.error("INSIGHTS ERROR FULL:", error);
    throw error;
  }
}
