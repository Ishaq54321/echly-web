import "server-only";

/**
 * Optional share link token: query `shareToken` or header `x-share-token`.
 * For POST handlers that also accept a body field, pass `bodyShareToken` (e.g. session view).
 * Precedence: body → query → header.
 */
export function extractShareToken(
  req: Request,
  bodyShareToken?: string | null
): string | null {
  const fromBody = typeof bodyShareToken === "string" ? bodyShareToken.trim() : "";
  const fromQuery = new URL(req.url).searchParams.get("shareToken")?.trim() ?? "";
  const fromHeader = req.headers.get("x-share-token")?.trim() ?? "";
  const raw = fromBody || fromQuery || fromHeader;
  return raw !== "" ? raw : null;
}

export function getShareTokenFromRequest(
  req: Request,
  bodyShareToken?: string | null
): string | undefined {
  const t = extractShareToken(req, bodyShareToken);
  return t ?? undefined;
}
