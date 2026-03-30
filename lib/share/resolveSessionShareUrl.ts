"use client";

import { getOrCreateShareLink } from "@/lib/share/getOrCreateShareLink";

const MAX_CACHE_SIZE = 50;

function cacheKey(sessionId: string, userId: string, origin: string): string {
  return `${userId.trim()}:${sessionId.trim()}:${origin.replace(/\/$/, "")}`;
}

const urlByKey = new Map<string, string>();
const inflightByKey = new Map<string, Promise<string>>();

function trimUrlCache(): void {
  while (urlByKey.size > MAX_CACHE_SIZE) {
    const first = urlByKey.keys().next().value as string | undefined;
    if (first === undefined) break;
    urlByKey.delete(first);
  }
}

/**
 * Resolves `${origin}/session/:id?shareToken=...` after ensuring a share link exists, deduping concurrent
 * and repeat calls for the same session in one page lifetime.
 */
export async function resolveSessionShareUrl(
  sessionId: string,
  userId: string,
  origin: string
): Promise<string | null> {
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";
  const uid = typeof userId === "string" ? userId.trim() : "";
  const base = typeof origin === "string" ? origin.replace(/\/$/, "") : "";
  if (!sid || !uid || !base) return null;

  const k = cacheKey(sid, uid, base);
  const cached = urlByKey.get(k);
  if (cached) return cached;

  let p = inflightByKey.get(k);
  if (!p) {
    p = getOrCreateShareLink({
      sessionId: sid,
      userId: uid,
      origin: base,
    })
      .then((url) => {
        urlByKey.set(k, url);
        trimUrlCache();
        inflightByKey.delete(k);
        return url;
      })
      .catch((err) => {
        inflightByKey.delete(k);
        throw err;
      });
    inflightByKey.set(k, p);
  }

  try {
    return await p;
  } catch {
    return null;
  }
}
