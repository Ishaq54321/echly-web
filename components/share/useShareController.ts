"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import {
  retainAccessRequestsListener,
  useAccessRequestsStore,
} from "@/lib/realtime/accessRequestStore";

export type ShareAccess = "view" | "resolve";
export type ShareGeneralAccess = "restricted" | "link_view";
export type ShareItemType = "member" | "invite";
export type ShareItemStatus = "active" | "pending";

export type WorkspaceMember = {
  uid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "OWNER" | "MEMBER";
};

export type ShareItem = {
  type: ShareItemType;
  id: string;
  email: string;
  access: ShareAccess;
  status: ShareItemStatus;
  avatarUrl?: string | null;
};

export type ShareAccessRequestItem = {
  id: string;
  requesterEmail: string;
  requestedAccess: "view" | "resolve";
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
  options?: { canResolve?: boolean; initialGeneralAccess?: ShareGeneralAccess }
) {
  const canResolve = options?.canResolve ?? false;
  const initialGeneralAccess = options?.initialGeneralAccess;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ShareItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState<ShareAccess>("view");
  const [initialLoading, setInitialLoading] = useState(false);
  const [generalAccess, setGeneralAccess] = useState<ShareGeneralAccess>(
    initialGeneralAccess ?? "restricted"
  );
  const [updatingGeneralAccess, setUpdatingGeneralAccess] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const accessRequestsState = useAccessRequestsStore(sessionId);
  const accessRequests = useMemo<ShareAccessRequestItem[]>(
    () =>
      accessRequestsState.requests.map((r) => ({
        id: r.id,
        requesterEmail: r.requesterEmail,
        requestedAccess: r.requestedAccess,
        status: r.status,
      })),
    [accessRequestsState.requests]
  );
  const [patchingAccessRequestId, setPatchingAccessRequestId] = useState<string | null>(null);
  const [refetchingAfterApproval, setRefetchingAfterApproval] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loadingWorkspaceMembers, setLoadingWorkspaceMembers] = useState(false);

  // Link copy state ("Copy link" → "Copied" toggle).
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
      setInitialLoading(false);
      return;
    }
    setItems(Array.isArray(json.data?.items) ? json.data.items : []);

    setInitialLoading(false);
  }, [sessionId]);

  const invite = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    setInviting(true);
    setInviteError("");
    setListError("");

    const optimisticItem: ShareItem = {
      id: `optimistic-${Date.now()}`,
      type: "invite",
      email: inviteEmail.trim(),
      access: inviteAccess,
      status: "pending",
    };
    setItems((prev) => [optimisticItem, ...prev]);

    try {
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          access: inviteAccess,
        }),
      });

      if (!res) {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        return;
      }

      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_added" | "invite_created" | "invite_updated" | "already_member";
      }>;
      if (!res.ok || !json.success) {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        setInviteError(getErrorMessage(json));
        return;
      }

      if (json.data?.type === "already_member") {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        setInviteError("User already has access");
        return;
      }

      setInviteEmail("");
      await load();
    } finally {
      setInviting(false);
    }
  }, [inviteAccess, inviteEmail, load, sessionId]);

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
    if (!sid) return;
    const url = `${window.location.origin}/session/${encodeURIComponent(sid)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    if (linkCopiedTimerRef.current != null) window.clearTimeout(linkCopiedTimerRef.current);
    setLinkCopied(true);
    linkCopiedTimerRef.current = window.setTimeout(() => setLinkCopied(false), 2000);
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (linkCopiedTimerRef.current != null) window.clearTimeout(linkCopiedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const sid = sessionId.trim();
    if (!sid) return;
    const release = retainAccessRequestsListener(sid);
    return release;
  }, [sessionId]);

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
    async (requestId: string, action: "approve" | "reject", access?: "view" | "resolve") => {
      const sid = sessionId.trim();
      const rid = requestId.trim();
      if (!sid || !rid) return;
      setPatchingAccessRequestId(rid);
      setListError("");

      // Optimistic: add new member for approve. Request removal is handled by
      // the realtime accessRequests listener once the server PATCH commits.
      const optimisticRequest = accessRequests.find(r => r.id === rid);
      if (action === "approve" && optimisticRequest) {
        const optimisticMember: ShareItem = {
          id: optimisticRequest.id,
          type: "invite" as const,
          email: optimisticRequest.requesterEmail,
          access: access ?? optimisticRequest.requestedAccess ?? "resolve",
          status: "active",
        };
        setItems(prev => [optimisticMember, ...prev]);
      }
      const optimisticMemberId = optimisticRequest?.id;

      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/access-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: rid,
          action,
          ...(access ? { access } : {}),
        }),
      });
      if (!res) {
        if (optimisticMemberId) {
          setItems(prev => prev.filter(i => i.id !== optimisticMemberId));
        }
        setPatchingAccessRequestId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{ type?: string }>;
      if (!res.ok || !json.success) {
        if (optimisticMemberId) {
          setItems(prev => prev.filter(i => i.id !== optimisticMemberId));
        }
        setListError("Could not process request. Try again.");
        setPatchingAccessRequestId(null);
        return;
      }
      setPatchingAccessRequestId(null);
      setRefetchingAfterApproval(true);

      const memRes = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`);
      const mj = memRes?.ok ? await memRes.json() : null;
      if (mj?.success && Array.isArray(mj.data?.items)) {
        setItems(mj.data.items);
      }

      setRefetchingAfterApproval(false);
    },
    [sessionId, accessRequests]
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
    if (initialGeneralAccess) {
      setGeneralAccess(initialGeneralAccess);
    }
  }, [initialGeneralAccess]);

  useEffect(() => {
    if (!open) return;
    setLoadingWorkspaceMembers(true);
    authFetch("/api/workspace/members")
      .then(r => r?.ok ? r.json() : null)
      .then(data => {
        const members = data?.data?.members ?? [];
        setWorkspaceMembers(members);
      })
      .catch(() => setWorkspaceMembers([]))
      .finally(() => setLoadingWorkspaceMembers(false));
  }, [open]);

  return {
    open,
    setOpen,
    items,
    accessRequests,
    patchingAccessRequestId,
    patchAccessRequest,
    onApproveAccessRequest: (requestId: string, access?: "view" | "resolve") =>
      patchAccessRequest(requestId, "approve", access),
    inviteEmail,
    setInviteEmail,
    inviteAccess,
    setInviteAccess,
    generalAccess,
    updatingGeneralAccess,
    initialLoading,
    inviting,
    updatingId,
    removingId,
    listError,
    inviteError,
    load,
    updateGeneralAccess,
    invite,
    updateRole,
    removeAccess,
    canResolve,
    linkCopied,
    copyShareLink,
    refetchingAfterApproval,
    workspaceMembers,
    loadingWorkspaceMembers,
  };
}
