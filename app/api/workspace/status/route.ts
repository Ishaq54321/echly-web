import {
  requireAuth,
  toAuthorizationResponse,
} from "@/lib/server/auth/authorize";
import { apiSuccess } from "@/lib/server/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspace/status
 * Legacy compatibility route. Workspace suspension is deprecated in user-owned mode
 * and returns suspended: false when auth succeeds.
 */
export async function GET(_req: Request) {
  try {
    await requireAuth(_req);
    return apiSuccess({ suspended: false });
  } catch (e) {
    return toAuthorizationResponse(e);
  }
}
