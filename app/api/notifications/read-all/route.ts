import { withAuthorization } from "@/lib/server/auth/withAuthorization";
import { apiError, apiSuccess } from "@/lib/server/apiResponse";
import { markAllRead } from "@/lib/repositories/notificationsRepository.server";

export const POST = withAuthorization(
  null,
  async (_req, _ctx, { userId }) => {
    try {
      const count = await markAllRead(userId);
      return apiSuccess({ markedRead: count });
    } catch (err) {
      console.error("POST /api/notifications/read-all:", err);
      return apiError({ code: "INTERNAL_ERROR", message: "Server error", status: 500 });
    }
  },
  {
    skipAuthorization: true,
    resolveWorkspace: async () => "",
  }
);
