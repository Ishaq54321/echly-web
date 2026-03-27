import { authFetch } from "@/lib/authFetch";
import type { AccessLevel } from "@/lib/domain/accessLevel";
import { normalizeAccessLevel } from "@/lib/domain/accessLevel";

export type SharePermission = AccessLevel;

export async function fetchSessionLinkAccess(sessionId: string): Promise<AccessLevel> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res) {
    throw new Error("Failed to load session");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Failed to load session");
  }
  const data = (await res.json()) as {
    success?: boolean;
    session?: { accessLevel?: unknown };
  };
  return normalizeAccessLevel(data.session?.accessLevel);
}

export async function updateSessionLinkAccess(params: {
  sessionId: string;
  accessLevel: AccessLevel;
}): Promise<void> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(params.sessionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessLevel: params.accessLevel }),
  });
  if (!res) {
    throw new Error("Failed to update link access");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Failed to update link access");
  }
}

export async function shareSession(params: {
  sessionId: string;
  email: string;
  permission: SharePermission;
}): Promise<void> {
  const res = await authFetch("/api/sessions/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res) {
    throw new Error("Share failed");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Share failed");
  }
}

/** Same upsert as shareSession; use when changing permission for an existing invite. */
export async function updateSharePermission(params: {
  sessionId: string;
  email: string;
  permission: SharePermission;
}): Promise<void> {
  return shareSession(params);
}

export async function fetchSessionShares(sessionId: string): Promise<
  { email: string; permission: SharePermission }[]
> {
  const res = await authFetch(`/api/sessions/${encodeURIComponent(sessionId)}/shares`);
  if (!res) {
    throw new Error("Failed to load shares");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Failed to load shares");
  }
  const data = (await res.json()) as {
    success?: boolean;
    shares?: { email: string; permission: SharePermission }[];
  };
  return data.shares ?? [];
}
