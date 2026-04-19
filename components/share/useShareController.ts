"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";

export type ShareAccess = "view" | "resolve";
export type ShareGeneralAccess = "restricted" | "link_view";
export type ShareItemType = "member" | "invite";
export type ShareItemStatus = "active" | "pending";

export type ShareItem = {
  type: ShareItemType;
  id: string;
  email: string;
  access: ShareAccess;
  status: ShareItemStatus;
};

export type ShareAccessRequestItem = {
  id: string;
  requesterEmail: string;
  status: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

function getErrorMessage(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const value = (input as { error?: { message?: unknown } }).error?.message;
  return typeof value === "string" ? value : "";
}

function itemKey(item: Pick<ShareItem, "type" | "id">): string {
  return `${item.type}:${item.id}`;
}

export function useShareController(
  sessionId: string,
  options?: { canResolve?: boolean }
) {
  const canResolve = options?.canResolve ?? false;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ShareItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState<ShareAccess>("view");
  const [initialLoading, setInitialLoading] = useState(false);
  const [generalAccess, setGeneralAccess] = useState<ShareGeneralAccess>("restricted");
  const [loadingGeneralAccess, setLoadingGeneralAccess] = useState(false);
  const [updatingGeneralAccess, setUpdatingGeneralAccess] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [accessRequests, setAccessRequests] = useState<ShareAccessRequestItem[]>([]);
  const [patchingAccessRequestId, setPatchingAccessRequestId] = useState<string | null>(null);

  // Link access level for share link copy
  const [linkAccessLevel, setLinkAccessLevel] = useState<ShareAccess>("view");
  const [copyingLink, setCopyingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const linkCopiedTimerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    setInitialLoading(true);
    setListError("");
    const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`);
    if (!res) {
      setInitialLoading(false);
      return;
    }
    const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
      items?: ShareItem[];
    }>;
    if (!res.ok || !json.success) {
      setListError(getErrorMessage(json));
      setAccessRequests([]);
      setInitialLoading(false);
      return;
    }
    setItems(Array.isArray(json.data?.items) ? json.data.items : []);

    const arRes = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/access-requests`);
    if (arRes?.ok) {
      const arJson = (await arRes.json().catch(() => ({}))) as ApiEnvelope<{
        requests?: ShareAccessRequestItem[];
      }>;
      if (arJson.success && Array.isArray(arJson.data?.requests)) {
        setAccessRequests(arJson.data.requests);
      } else {
        setAccessRequests([]);
      }
    } else {
      setAccessRequests([]);
    }

    setInitialLoading(false);
  }, [sessionId]);

  const invite = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    setInviting(true);
    setInviteError("");
    setListError("");

    const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.trim(),
        access: inviteAccess,
      }),
    });

    if (!res) {
      setInviting(false);
      return;
    }

    const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
      type?: "member_added" | "invite_created" | "invite_updated" | "already_member";
    }>;
    if (!res.ok || !json.success) {
      setInviteError(getErrorMessage(json));
      setInviting(false);
      return;
    }

    if (json.data?.type === "already_member") {
      setInviteError("User already has access");
      setInviting(false);
      return;
    }

    setInviteEmail("");
    await load();
    setInviting(false);
  }, [inviteAccess, inviteEmail, load, sessionId]);

  const fetchGeneralAccess = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    setLoadingGeneralAccess(true);
    const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-settings`);
    if (!res) {
      setLoadingGeneralAccess(false);
      return;
    }
    const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
      generalAccess?: ShareGeneralAccess;
    }>;
    if (res.ok && json.success) {
      const next = json.data?.generalAccess;
      if (next === "restricted" || next === "link_view") {
        setGeneralAccess(next);
      }
    }
    setLoadingGeneralAccess(false);
  }, [sessionId]);

  const updateGeneralAccess = useCallback(
    async (value: ShareGeneralAccess) => {
      const sid = sessionId.trim();
      if (!sid) return;
      const previous = generalAccess;
      setGeneralAccess(value);
      setUpdatingGeneralAccess(true);
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generalAccess: value }),
      });
      if (!res) {
        setGeneralAccess(previous);
        setUpdatingGeneralAccess(false);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<Record<string, never>>;
      if (!res.ok || !json.success) {
        setGeneralAccess(previous);
        setListError("Only the session owner can change general access");
        console.error("[useShareController] updateGeneralAccess failed", { status: res.status, json });
      }
      setUpdatingGeneralAccess(false);
    },
    [sessionId, generalAccess]
  );

  const copyShareLink = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid || copyingLink) return;
    setCopyingLink(true);
    setListError("");
    try {
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access: linkAccessLevel }),
      });
      if (!res) {
        setCopyingLink(false);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{ token?: string }>;
      if (!res.ok || !json.success) {
        setListError(getErrorMessage(json) || "Could not create share link");
        setCopyingLink(false);
        return;
      }
      const token = json.data?.token;
      if (token) {
        const url = `${window.location.origin}/dashboard/${encodeURIComponent(sid)}?token=${encodeURIComponent(token)}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // fallback: no-op
        }
        if (linkCopiedTimerRef.current != null) window.clearTimeout(linkCopiedTimerRef.current);
        setLinkCopied(true);
        linkCopiedTimerRef.current = window.setTimeout(() => setLinkCopied(false), 2000);
      }
    } finally {
      setCopyingLink(false);
    }
  }, [sessionId, linkAccessLevel, copyingLink]);

  useEffect(() => {
    return () => {
      if (linkCopiedTimerRef.current != null) window.clearTimeout(linkCopiedTimerRef.current);
    };
  }, []);

  const updateRole = useCallback(
    async (item: Pick<ShareItem, "type" | "id">, access: ShareAccess) => {
      const sid = sessionId.trim();
      if (!sid) return;
      const key = itemKey(item);
      setUpdatingId(key);
      setListError("");

      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          id: item.id,
          access,
        }),
      });
      if (!res) {
        setUpdatingId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_updated" | "invite_updated";
      }>;
      if (!res.ok || !json.success) {
        setListError(getErrorMessage(json));
        setUpdatingId(null);
        return;
      }
      setItems((prev) =>
        prev.map((row) => (row.type === item.type && row.id === item.id ? { ...row, access } : row))
      );
      setUpdatingId(null);
    },
    [sessionId]
  );

  const patchAccessRequest = useCallback(
    async (requestId: string, action: "approve" | "reject") => {
      const sid = sessionId.trim();
      const rid = requestId.trim();
      if (!sid || !rid) return;
      setPatchingAccessRequestId(rid);
      setListError("");
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/access-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: rid, action }),
      });
      if (!res) {
        setPatchingAccessRequestId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{ type?: string }>;
      if (!res.ok || !json.success) {
        setListError(getErrorMessage(json));
        setPatchingAccessRequestId(null);
        return;
      }
      setPatchingAccessRequestId(null);

      const memRes = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`);
      if (memRes?.ok) {
        const mj = (await memRes.json().catch(() => ({}))) as ApiEnvelope<{ items?: ShareItem[] }>;
        if (mj.success && Array.isArray(mj.data?.items)) {
          setItems(mj.data.items);
        }
      }

      const arRes2 = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/access-requests`);
      if (arRes2?.ok) {
        const arJson = (await arRes2.json().catch(() => ({}))) as ApiEnvelope<{
          requests?: ShareAccessRequestItem[];
        }>;
        if (arJson.success && Array.isArray(arJson.data?.requests)) {
          setAccessRequests(arJson.data.requests);
        }
      }
    },
    [sessionId]
  );

  const removeAccess = useCallback(
    async (item: Pick<ShareItem, "type" | "id">) => {
      const sid = sessionId.trim();
      if (!sid) return;
      const key = itemKey(item);
      setRemovingId(key);
      setListError("");

      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          id: item.id,
        }),
      });
      if (!res) {
        setRemovingId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_removed" | "invite_removed";
      }>;
      if (!res.ok || !json.success) {
        setListError(getErrorMessage(json));
        setRemovingId(null);
        return;
      }
      setItems((prev) => prev.filter((row) => !(row.type === item.type && row.id === item.id)));
      setRemovingId(null);
    },
    [sessionId]
  );

  useEffect(() => {
    if (!open) return;
    void fetchGeneralAccess().catch(() => {});
  }, [open, fetchGeneralAccess]);

  return {
    open,
    setOpen,
    items,
    accessRequests,
    patchingAccessRequestId,
    patchAccessRequest,
    inviteEmail,
    setInviteEmail,
    inviteAccess,
    setInviteAccess,
    generalAccess,
    loadingGeneralAccess,
    updatingGeneralAccess,
    initialLoading,
    inviting,
    updatingId,
    removingId,
    listError,
    inviteError,
    load,
    fetchGeneralAccess,
    updateGeneralAccess,
    invite,
    updateRole,
    removeAccess,
    canResolve,
    linkAccessLevel,
    setLinkAccessLevel,
    copyingLink,
    linkCopied,
    copyShareLink,
  };
}
