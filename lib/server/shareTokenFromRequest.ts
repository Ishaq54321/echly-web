import "server-only";

function bearerRaw(req: Request): string | null {
  const raw =
    req.headers.get("authorization")?.trim() ??
    req.headers.get("Authorization")?.trim() ??
    "";
  const m = /^Bearer\s+(.+)$/i.exec(raw);
  const t = m?.[1]?.trim() ?? "";
  return t !== "" ? t : null;
}

/** Firebase ID tokens (and typical extension JWTs) use three dot-separated segments. */
function looksLikeJwt(bearer: string): boolean {
  const parts = bearer.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Share link token for token-only (non-Firebase) access:
 * POST body (caller-supplied), `?token=` / `?shareToken=`, or `Authorization: Bearer` when the value is not JWT-shaped.
 */
export function extractShareToken(
  req: Request,
  bodyShareToken?: string | null
): string | null {
  const fromBody = typeof bodyShareToken === "string" ? bodyShareToken.trim() : "";
  const sp = new URL(req.url).searchParams;
  const fromQuery =
    (sp.get("token")?.trim() ?? "") || (sp.get("shareToken")?.trim() ?? "");

  const bearer = bearerRaw(req);
  const fromBearer = bearer && !looksLikeJwt(bearer) ? bearer : "";

  const raw = fromBody || fromQuery || fromBearer;
  return raw !== "" ? raw : null;
}
