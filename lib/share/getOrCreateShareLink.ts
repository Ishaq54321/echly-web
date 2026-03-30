"use client";

import { authFetch } from "@/lib/authFetch";

export type GetOrCreateShareLinkParams = {
  sessionId: string;
  origin: string;
};

/**
 * Ensures an active `share_links` row exists for the session (server-side), then returns
 * `${origin}/session/${sessionId}?token=...` for anonymous-capable links.
 */
export async function getOrCreateShareLink({
  sessionId,
  origin,
}: GetOrCreateShareLinkParams): Promise<string> {
  const sid = sessionId.trim();
  const base = origin.replace(/\/$/, "");
  if (!sid) throw new Error("getOrCreateShareLink: sessionId is required");
  if (!base) throw new Error("getOrCreateShareLink: origin is required");

  const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res) {
    throw new Error("share-link failed");
  }

  if (!res.ok) {
    let message = "share-link failed";
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (typeof err?.error?.message === "string" && err.error.message) {
        message = err.error.message;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as {
    success?: boolean;
    data?: { token?: string };
  };
  const token = typeof data.data?.token === "string" ? data.data.token.trim() : "";
  if (!data.success || !token) {
    throw new Error("Invalid share-link response");
  }

  return `${base}/session/${encodeURIComponent(sid)}?token=${encodeURIComponent(token)}`;
}
