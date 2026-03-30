import "server-only";
import type { Action } from "@/lib/server/auth/authorize";

export function logAuthDecision(input: {
  uid: string;
  action: Action | null;
  route?: string;
  allowed: boolean;
  reason?: string;
  role?: string | null;
}): void {
  const payload = {
    uid: input.uid,
    action: input.action,
    route: input.route,
    result: input.allowed ? "allow" : "deny",
    role: input.role ?? null,
    reason: input.reason ?? null,
  };

  if (input.allowed) {
    console.info("[AUTH]", payload);
    return;
  }
  console.warn("[AUTH]", payload);
}
