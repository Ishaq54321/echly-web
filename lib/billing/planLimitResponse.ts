import type { PlanLimitError } from "./checkPlanLimit";
import type { PlanId } from "./plans";
import type { ApiErrorParams } from "@/lib/server/apiResponse";

/**
 * Unified API error args for POST /api/sessions when {@link checkPlanLimit} fails.
 */
export function planLimitReachedApiError(err: PlanLimitError): ApiErrorParams {
  return {
    code: "FORBIDDEN",
    message: err.message,
    status: 403,
    data: { upgradePlan: err.upgradePlan as PlanId | null },
  };
}
