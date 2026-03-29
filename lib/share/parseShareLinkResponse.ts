/**
 * Parses POST /api/sessions/:id/share-link JSON body into `${origin}/s/${token}`.
 * Single implementation for web (authFetch) and extension (apiFetch).
 */
export async function parseShareLinkResponse(res: Response, origin: string): Promise<string> {
  const base = (origin || "").replace(/\/$/, "");
  if (!base) {
    throw new Error("share-link: origin is required");
  }

  if (!res.ok) {
    let message = "share-link failed";
    try {
      const err = (await res.json()) as { error?: string };
      if (typeof err?.error === "string" && err.error) message = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { success?: boolean; token?: string };
  const token = typeof data.token === "string" ? data.token.trim() : "";
  if (!data.success || !token) {
    throw new Error("Invalid share-link response");
  }

  return `${base}/s/${encodeURIComponent(token)}`;
}
