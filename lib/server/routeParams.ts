import "server-only";
import type { HandlerContext } from "@/lib/server/auth/withAuthorization";

/** Resolves `id` from App Router `ctx.params` (sync object or Promise). */
export async function routeParamId(ctx: HandlerContext): Promise<string> {
  const p = ctx.params;
  const resolved =
    p && typeof (p as Promise<unknown>).then === "function"
      ? await (p as Promise<{ id?: string }>)
      : (p as { id?: string } | undefined);
  return typeof resolved?.id === "string" ? resolved.id : "";
}
