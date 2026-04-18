import type { NextRequest } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { corsHeaders } from "@/lib/server/cors";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  ACTIVITY_GROUP_WINDOW_MS,
  findAdjacencyGroupMembers,
} from "@/lib/server/activity/groupEventsServer";
import { normalizeForGrouping } from "@/lib/server/activity/normalizeForGrouping";

/** Cap for one group expansion (scalable default; avoids unbounded reads). */
const MAX_EVENTS_IN_WINDOW = 400;

function activityEventFromDoc(doc: QueryDocumentSnapshot) {
  const d = doc.data();
  return {
    id: doc.id,
    eventType: d.eventType ?? null,
    workspaceId: d.workspaceId ?? null,
    sessionId: d.sessionId ?? null,
    feedbackId: d.feedbackId ?? null,
    commentId: d.commentId ?? null,
    actor: d.actor ?? null,
    metadata: d.metadata ?? null,
    createdAt: d.createdAt?.toMillis?.() ?? null,
    groupKey: d.groupKey ?? null,
  };
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/activity-group-members?groupId=&sessionId=&eventType=&actorId=&createdAt=
 *
 * Re-fetches activity in a time window around the group's anchor `createdAt`,
 * re-groups server-side, and returns `events` for the matching `groupId`.
 * Access: same session-scoped rules as {@link GET /api/activity-feed} with `sessionId`.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId")?.trim() ?? "";
  const sessionIdParam = searchParams.get("sessionId")?.trim() ?? "";
  const eventType = searchParams.get("eventType")?.trim() ?? "";
  const actorId = searchParams.get("actorId")?.trim() ?? "";
  const createdAtRaw = searchParams.get("createdAt")?.trim() ?? "";

  if (!groupId || !sessionIdParam || !eventType || !actorId || !createdAtRaw) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Missing groupId, sessionId, eventType, actorId, or createdAt",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const createdAtMs = Number(createdAtRaw);
  if (!Number.isFinite(createdAtMs) || createdAtMs <= 0) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid createdAt",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  const built = await tryBuildRequestContext({
    req,
    sessionId: sessionIdParam,
    optionalAuth: true,
  });

  if (!built.ok) {
    return new Response(built.response.body, {
      status: built.response.status,
      statusText: built.response.statusText,
      headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
    });
  }

  const ctx = built.ctx;

  if (!ctx.access?.capabilities.canView) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }

  const workspaceIdForQuery = (ctx.sessionWorkspaceId ?? "").trim();
  if (!workspaceIdForQuery) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }

  // Adjacency grouping anchors on the newest row; only older rows merge in.
  const windowStart = createdAtMs - ACTIVITY_GROUP_WINDOW_MS;
  const windowEnd = createdAtMs;

  try {
    const snapshot = await adminDb
      .collection("workspaces")
      .doc(workspaceIdForQuery)
      .collection("activityEvents")
      .where("sessionId", "==", sessionIdParam)
      .where("eventType", "==", eventType)
      .where("createdAt", ">=", Timestamp.fromMillis(windowStart))
      .where("createdAt", "<=", Timestamp.fromMillis(windowEnd))
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(MAX_EVENTS_IN_WINDOW)
      .get();

    const rawEvents = snapshot.docs.map((d) => activityEventFromDoc(d as QueryDocumentSnapshot));
    const actorFiltered = rawEvents.filter((row) => {
      const a = row.actor;
      return typeof a === "object" && a != null && typeof (a as { id?: unknown }).id === "string"
        ? (a as { id: string }).id === actorId
        : false;
    });

    const normalized = actorFiltered.map((row) => normalizeForGrouping(row));
    const membersNorm = findAdjacencyGroupMembers(normalized, groupId);

    const rawById = new Map(actorFiltered.map((r) => [r.id, r]));

    if (membersNorm && membersNorm.length > 0) {
      const eventsWire = membersNorm
        .map((e) => rawById.get(e.id))
        .filter((row): row is NonNullable<typeof row> => row != null);
      return apiSuccess(
        { events: eventsWire },
        ctx.access,
        { headers: corsHeaders(req) }
      );
    }

    return apiError({
      code: "GROUP_NOT_FOUND",
      message: "Group not found or no longer matches this window",
      status: 404,
      init: { headers: corsHeaders(req) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("requires an index")) {
      console.warn("[FIRESTORE] Missing composite index for activity-group-members", {
        workspaceIdForQuery,
        sessionIdParam,
        eventType,
      });
    }
    console.error("GET /api/activity-group-members:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
