import type { NextRequest } from "next/server";
import type { Query, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";
import { corsHeaders } from "@/lib/server/cors";
import { tryBuildRequestContext } from "@/lib/server/requestContext";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { parseActivityFeedEventTypesParam } from "@/lib/activity/activityEventTypeFilters";
import { groupEventsServer } from "@/lib/server/activity/groupEventsServer";
import { normalizeForGrouping } from "@/lib/server/activity/normalizeForGrouping";
import { resolveUserAvatars } from "@/lib/utils/resolveUserAvatar";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Events that live exclusively in the per-ticket activity panel
// (Phase 26.7 decoupling). Excluded from the workspace Activity
// feed because they're field-level changes most useful in the
// context of a specific ticket. Lifecycle events (created,
// resolved, reopened) remain on the workspace feed.
//
// The per-ticket panel (TicketActivityPanel) does NOT use this
// route — it reads workspaces/{wid}/activityEvents directly via
// useTicketActivity's onSnapshot listener — so excluding these
// here has no effect on the per-ticket timeline.
//
// Going forward: new event types specific to per-ticket context
// should be added to this set.
const PER_TICKET_PANEL_EVENT_TYPES = new Set([
  "ticket.priority.changed",
  "ticket.assignment.changed",
]);

type ActivityFeedNextCursor = {
  createdAt: number;
  id: string;
} | null;

function parseLimit(searchParams: URLSearchParams): number {
  return Math.min(Number(searchParams.get("limit")) || DEFAULT_LIMIT, MAX_LIMIT);
}

function parseCursorPayload(v: unknown): { createdAt: number; id: string } | null {
  if (typeof v !== "object" || v == null) return null;
  const o = v as { createdAt?: unknown; id?: unknown };
  const createdAt = typeof o.createdAt === "number" ? o.createdAt : NaN;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  if (!Number.isFinite(createdAt) || id === "") return null;
  return { createdAt, id };
}

function parseCursorParam(raw: string): { createdAt: number; id: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const fromJson = parseCursorPayload(JSON.parse(trimmed));
    if (fromJson) return fromJson;
  } catch {
    /* try base64url */
  }
  try {
    const pad = trimmed.length % 4 === 0 ? "" : "=".repeat(4 - (trimmed.length % 4));
    const json = Buffer.from(
      trimmed.replace(/-/g, "+").replace(/_/g, "/") + pad,
      "base64"
    ).toString("utf8");
    return parseCursorPayload(JSON.parse(json));
  } catch {
    return null;
  }
}

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
 * GET /api/activity-feed?sessionId=&eventTypes=&cursor=&limit=20
 *
 * `eventTypes`: comma-separated allowlist, e.g. `comment.added,feedback.created`
 *
 * `cursor`: JSON string `{ "createdAt": epoch ms, "id": doc id }` (e.g. encodeURIComponent)
 * or the same object encoded as base64url.
 * Raw activity events for the workspace (or one session), newest first.
 *
 * Response `data` includes `events` (unchanged) plus `groupedEvents` (server-side
 * adjacency groups for `comment.added` / `feedback.created` only). Each group item
 * includes `groupId`, `count`, `previewEvents` (first 1–2 events); full members load via
 * `/api/activity-group-members` when a group is expanded.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionIdParam = searchParams.get("sessionId")?.trim() ?? "";
  const eventTypesRaw = searchParams.get("eventTypes");
  const cursorParam = searchParams.get("cursor")?.trim() ?? "";
  const actorIdParam = searchParams.get("actorId")?.trim() || null;
  const limit = parseLimit(searchParams);
  const eventTypesForQuery = parseActivityFeedEventTypesParam(eventTypesRaw);
  const hasEventTypeFilter = eventTypesForQuery.length > 0;

  const hasSessionFilter = sessionIdParam !== "";

  const built = hasSessionFilter
    ? await tryBuildRequestContext({
        req,
        sessionId: sessionIdParam,
        optionalAuth: true,
      })
    : await tryBuildRequestContext({ req });

  if (!built.ok) {
    return new Response(built.response.body, {
      status: built.response.status,
      statusText: built.response.statusText,
      headers: { ...Object.fromEntries(built.response.headers), ...corsHeaders(req) },
    });
  }

  const ctx = built.ctx;

  let workspaceIdForQuery = "";

  if (hasSessionFilter) {
    if (!ctx.access?.capabilities.canView) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    workspaceIdForQuery = (ctx.sessionWorkspaceId ?? "").trim();
  } else {
    if (ctx.identityType !== "USER" || !ctx.userId?.trim()) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    const trustedWorkspaceId = (await getUserWorkspaceIdRepo(ctx.userId)).trim();
    if (!trustedWorkspaceId || trustedWorkspaceId !== (ctx.workspaceId ?? "").trim()) {
      return apiError({
        code: "FORBIDDEN",
        message: "You do not have access",
        status: 403,
        init: { headers: corsHeaders(req) },
      });
    }
    workspaceIdForQuery = trustedWorkspaceId;
  }

  if (!workspaceIdForQuery) {
    return apiError({
      code: "FORBIDDEN",
      message: "You do not have access",
      status: 403,
      init: { headers: corsHeaders(req) },
    });
  }

  const parsedCursor = cursorParam !== "" ? parseCursorParam(cursorParam) : null;
  if (cursorParam !== "" && parsedCursor == null) {
    return apiError({
      code: "INVALID_INPUT",
      message: "Invalid cursor",
      status: 400,
      init: { headers: corsHeaders(req) },
    });
  }

  let q: Query = adminDb
    .collection("workspaces")
    .doc(workspaceIdForQuery)
    .collection("activityEvents");

  if (hasSessionFilter) {
    q = q.where("sessionId", "==", sessionIdParam);
  }

  if (hasEventTypeFilter) {
    q = q.where("eventType", "in", eventTypesForQuery);
  }

  if (actorIdParam) {
    q = q.where("actor.id", "==", actorIdParam);
  }

  q = q
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc")
    .limit(limit);

  if (parsedCursor) {
    q = q.startAfter(Timestamp.fromMillis(parsedCursor.createdAt), parsedCursor.id);
  }

  try {
    const snapshot = await q.get();
    const rawEvents = snapshot.docs.map((d) => activityEventFromDoc(d as QueryDocumentSnapshot));

    // Phase 26.7: always exclude per-ticket-panel field-change events
    // from the workspace Activity feed, regardless of the eventTypes
    // allowlist filter. This guarantees they never surface here, even
    // via a malformed query string. (No effect on the per-ticket
    // panel — see PER_TICKET_PANEL_EVENT_TYPES note above.)
    const events = rawEvents.filter(
      (event) =>
        event.eventType == null ||
        !PER_TICKET_PANEL_EVENT_TYPES.has(event.eventType)
    );

    // Phase 25.1: resolve actor avatars LIVE from users/{uid} and OVERRIDE
    // the photoURL frozen onto the activity event at write time (it goes
    // stale when the actor changes their photo). The event snapshot is
    // only a fallback when the user doc has no avatar.
    const actorIds = [
      ...new Set(
        events
          .map((e) => e.actor?.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    ];

    const photoByActorId = await resolveUserAvatars(actorIds);

    const enrichedEvents = events.map((event) => {
      if (!event.actor) return event;
      const live = photoByActorId.get(event.actor.id);
      const resolved = live ?? event.actor.photoURL ?? null;
      if (resolved === (event.actor.photoURL ?? null)) return event;
      return {
        ...event,
        actor: {
          ...event.actor,
          photoURL: resolved,
        },
      };
    });

    const normalizedEvents = enrichedEvents.map(normalizeForGrouping);
    const groupedEvents = groupEventsServer(normalizedEvents);

    if (process.env.NODE_ENV === "development") {
      try {
        const { assertGroupingParity } = await import(
          "@/lib/server/activity/assertGroupingParity"
        );
        assertGroupingParity(normalizedEvents);
      } catch (e) {
        console.warn("Parity check failed", e);
      }
    }

    let nextCursor: ActivityFeedNextCursor = null;
    // Pagination is driven by the raw Firestore page size, NOT the
    // post-filter count — otherwise filtering out per-ticket events
    // could falsely signal "no more pages" while more docs remain.
    if (snapshot.docs.length === limit) {
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot;
      const createdAtMs = lastDoc.get("createdAt")?.toMillis?.();
      if (createdAtMs != null) {
        nextCursor = { createdAt: createdAtMs, id: lastDoc.id };
      }
    }

    return apiSuccess(
      { events: enrichedEvents, groupedEvents, nextCursor },
      hasSessionFilter ? ctx.access : null,
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("requires an index")) {
      console.warn("[FIRESTORE] Missing composite index for activityEvents", {
        workspaceIdForQuery,
        hasSessionFilter,
        hasEventTypeFilter,
      });
    }
    console.error("GET /api/activity-feed:", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Server error",
      status: 500,
      init: { headers: corsHeaders(req) },
    });
  }
}
