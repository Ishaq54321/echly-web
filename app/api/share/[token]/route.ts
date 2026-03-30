import { NextResponse } from "next/server";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";
import { getShareLinkByToken } from "@/lib/repositories/shareLinksRepository";

export const dynamic = "force-dynamic";

type SharePermissionLabel = "COMMENTER" | "RESOLVER";

function permissionFromGeneralAccess(raw: unknown): SharePermissionLabel {
  return normalizeAccessLevel(raw) === "resolve" ? "RESOLVER" : "COMMENTER";
}

async function paramToken(
  params: Promise<{ token?: string }> | { token?: string }
): Promise<string> {
  const resolved =
    params && typeof (params as Promise<unknown>).then === "function"
      ? await (params as Promise<{ token?: string }>)
      : (params as { token?: string });
  return typeof resolved?.token === "string" ? resolved.token.trim() : "";
}

/**
 * GET /api/share/:token — bootstrap: validate share link (Admin SDK) and return session id + permission.
 * Does not mint session cookies; clients continue with `/api/sessions/:id?shareToken=` or `x-share-token`.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> | { token: string } }
) {
  const token = await paramToken(ctx.params);
  if (!token) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  const link = await getShareLinkByToken(token);
  if (!link || !link.isActive) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  const expiresAt =
    link.expiresAt && typeof link.expiresAt.toDate === "function"
      ? link.expiresAt.toDate()
      : null;
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Expired link" }, { status: 410 });
  }

  return NextResponse.json({
    sessionId: link.sessionId,
    permission: permissionFromGeneralAccess(link.generalAccess),
    token,
  });
}
