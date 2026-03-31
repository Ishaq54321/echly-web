import "server-only";
import type { HandlerContext } from "@/lib/server/auth/withAuthorization";

/** Resolves route id from App Router `ctx.params` (sync object or Promise). */
export async function routeParamId(ctx: HandlerContext): Promise<string> {
  const p = ctx.params;
  const resolved =
    p && typeof (p as Promise<unknown>).then === "function"
      ? await (p as Promise<{ sessionId?: string; id?: string }>)
      : (p as { sessionId?: string; id?: string } | undefined);
  if (typeof resolved?.sessionId === "string") return resolved.sessionId;
  return typeof resolved?.id === "string" ? resolved.id : "";
}
