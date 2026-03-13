import type { PlanLimitError } from "./checkPlanLimit";
import type { PlanId } from "./plans";

export interface PlanLimitReachedBody {
  error: "PLAN_LIMIT_REACHED";
  message: string;
  upgradePlan: PlanId | null;
}

/**
 * Returns the JSON body for a 403 plan limit response.
 */
export function planLimitReachedBody(err: PlanLimitError): PlanLimitReachedBody {
  return {
    error: "PLAN_LIMIT_REACHED",
    message: err.message,
    upgradePlan: err.upgradePlan,
  };
}

export interface PlanRequiredBody {
  error: "PLAN_REQUIRED";
  message: string;
  upgradePlan: PlanId | null;
}

/**
 * Returns the JSON body for a 403 plan required response (e.g. insights not on free).
 */
export function planRequiredBody(upgradePlan: PlanId | null): PlanRequiredBody {
  return {
    error: "PLAN_REQUIRED",
    message: "This feature requires a paid plan",
    upgradePlan,
  };
}
