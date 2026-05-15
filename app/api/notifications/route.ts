import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  type NotificationsCursor,
} from "@/lib/repositories/notificationsRepository.server";
import { getUserWorkspaceIdRepo } from "@/lib/repositories/usersRepository.server";

function badRequest(message: string) {
  return apiError({ code: "INVALID_INPUT", message, status: 400 });
}

function parseCursorPayload(v: unknown): NotificationsCursor | null {
  if (typeof v !== "object" || v == null) return null;
  const o = v as { createdAt?: unknown; id?: unknown };
  const createdAt = typeof o.createdAt === "number" ? o.createdAt : NaN;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  if (!Number.isFinite(createdAt) || id === "") return null;
  return { createdAt, id };
}

function parseCursorParam(raw: string): NotificationsCursor | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const fromJson = parseCursorPayload(JSON.parse(trimmed));
    if (fromJson) return fromJson;
  } catch {
    /* fall through to base64url */
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

export const GET = withAuthorization(
  null,
  async (req, _ctx, { userId }) => {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const cursorParam = url.searchParams.get("cursor")?.trim() ?? "";
    const unreadOnly = url.searchParams.get("unread") === "true";

    const limit = limitParam
      ? Math.min(parseInt(limitParam, 10) || 20, 50)
      : 20;

    let cursor: NotificationsCursor | null = null;
    if (cursorParam !== "") {
      cursor = parseCursorParam(cursorParam);
      if (!cursor) return badRequest("Invalid cursor");
    }

    try {
      const workspaceId = await getUserWorkspaceIdRepo(userId);
      const [result, unreadCount] = await Promise.all([
        getNotifications(userId, { limit, cursor, unreadOnly, workspaceId }),
        getUnreadCount(userId, workspaceId),
      ]);

      return apiSuccess({
        notifications: result.notifications,
        nextCursor: result.nextCursor,
        unreadCount,
      });
    } catch (err) {
      console.error("GET /api/notifications:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  {
    skipAuthorization: true,
    resolveWorkspace: async () => "",
  }
);

export const PATCH = withAuthorization(
  null,
  async (req, _ctx, { userId }) => {
    let body: { notificationId?: unknown };
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    const notificationId =
      typeof body?.notificationId === "string" ? body.notificationId.trim() : "";
    if (!notificationId) {
      return badRequest("notificationId is required");
    }

    try {
      await markNotificationRead(userId, notificationId);
      return apiSuccess({ success: true });
    } catch (err) {
      console.error("PATCH /api/notifications:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  {
    skipAuthorization: true,
    resolveWorkspace: async () => "",
  }
);
