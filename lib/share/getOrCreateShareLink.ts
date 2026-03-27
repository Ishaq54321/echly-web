"use client";

import { authFetch } from "@/lib/authFetch";

export type GetOrCreateShareLinkParams = {
  sessionId: string;
  userId: string;
  origin: string;
};

/**
 * Ensures an active `share_links` row exists for the session (server-side), then returns
 * `${origin}/s/${token}`. `userId` must match the signed-in user (enforced server-side via Bearer token).
 */
export async function getOrCreateShareLink({
  sessionId,
  userId,
  origin,
}: GetOrCreateShareLinkParams): Promise<string> {
  const sid = sessionId.trim();
  const uid = userId.trim();
  const base = (origin || "").replace(/\/$/, "");
  if (!sid) throw new Error("getOrCreateShareLink: sessionId is required");
  if (!uid) throw new Error("getOrCreateShareLink: userId is required");
  if (!base) throw new Error("getOrCreateShareLink: origin is required");

  const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: uid }),
  });

  if (!res) {
    throw new Error("share-link failed");
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
