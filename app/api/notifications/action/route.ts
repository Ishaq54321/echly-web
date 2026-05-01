import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { updateNotificationActionStatus } from "@/lib/repositories/notificationsRepository.server";

function badRequest(message: string) {
  return apiError({ code: "INVALID_INPUT", message, status: 400 });
}

export const PATCH = withAuthorization(
  null,
  async (req, _ctx, { userId }) => {
    let body: { notificationId?: unknown; actionStatus?: unknown };
    try {
      body = (await req.json()) as { notificationId?: unknown; actionStatus?: unknown };
    } catch {
      return badRequest("Invalid JSON body");
    }

    const notificationId =
      typeof body.notificationId === "string" ? body.notificationId.trim() : "";
    const actionStatus = body.actionStatus;

    if (!notificationId) return badRequest("notificationId required");
    if (actionStatus !== "approved" && actionStatus !== "rejected") {
      return badRequest("actionStatus must be 'approved' or 'rejected'");
    }

    try {
      const ok = await updateNotificationActionStatus(
        userId,
        notificationId,
        actionStatus
      );
      if (!ok) {
        return apiError({
          code: "NOT_FOUND",
          message: "Notification not found",
          status: 404,
        });
      }
      return apiSuccess({ success: true });
    } catch (err) {
      console.error("PATCH /api/notifications/action:", err);
      return apiError({
        code: "INTERNAL_ERROR",
        message: "Server error",
        status: 500,
      });
    }
  },
  {
    skipAuthorization: true,
    resolveWorkspace: async () => "",
  }
);
