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
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loadingWorkspaceMembers, setLoadingWorkspaceMembers] = useState(false);

  // Link copy state ("Copy link" → "Copied" toggle).
  const [linkCopied, setLinkCopied] = useState(false);
  const linkCopiedTimerRef = useRef<number | null>(null);

  const generalAccessDebounceRef = useRef<number | null>(null);
  const generalAccessLatestGenRef = useRef(0);
  const generalAccessPendingValueRef = useRef<ShareGeneralAccess | null>(null);
  const generalAccessPreviousValueRef = useRef<ShareGeneralAccess | null>(null);

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
        item?: ShareItem;
      }>;
      if (!res.ok || !json.success) {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        setInviteError(getErrorMessage(json));
        return;
      }

      if (json.data?.type === "already_member") {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        setInviteError("User already has access");
        setInviteEmail("");
        return;
      }

      setInviteEmail("");

      // Reconcile in place: swap the optimistic row for the canonical item
      // the server returned. No follow-up GET /members — the response IS the
      // source of truth (Fix A). If the email already had a non-optimistic
      // row (e.g. invite_updated on an existing invite), collapse to one.
      const canonical = json.data?.item;
      if (canonical) {
        setItems((prev) => {
          const withoutDupes = prev.filter(
            (i) =>
              i.id !== optimisticItem.id &&
              !(i.type === canonical.type && i.id === canonical.id)
          );
          return [canonical, ...withoutDupes];
        });
      } else {
        // No canonical item (shouldn't happen for success types) — drop the
        // optimistic row rather than leave a permanently-fake entry.
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
      }
    } finally {
      setInviting(false);
    }
  }, [inviteAccess, inviteEmail, sessionId]);

  const updateGeneralAccess = useCallback(
    (value: ShareGeneralAccess) => {
      const sid = sessionId.trim();
      if (!sid) return;

      // Capture the pre-toggle value on the first click of a debounce window,
      // so rapid back-and-forth toggles still know what to roll back to on failure.
      if (generalAccessDebounceRef.current === null) {
        setGeneralAccess((prev) => {
          generalAccessPreviousValueRef.current = prev;
          return value;
        });
      } else {
        setGeneralAccess(value);
      }

      generalAccessPendingValueRef.current = value;
      setUpdatingGeneralAccess(true);

      if (generalAccessDebounceRef.current !== null) {
        window.clearTimeout(generalAccessDebounceRef.current);
      }

      generalAccessDebounceRef.current = window.setTimeout(async () => {
        generalAccessDebounceRef.current = null;
        const myGen = generalAccessLatestGenRef.current + 1;
        generalAccessLatestGenRef.current = myGen;

        const valueToSend = generalAccessPendingValueRef.current;
        const previous = generalAccessPreviousValueRef.current;
        if (valueToSend === null) {
          setUpdatingGeneralAccess(false);
          return;
        }

        const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/share-settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generalAccess: valueToSend }),
        });

        // Newer request superseded this one — ignore the response.
        if (myGen !== generalAccessLatestGenRef.current) return;

        if (!res) {
          if (previous !== null) setGeneralAccess(previous);
          setUpdatingGeneralAccess(false);
          generalAccessPendingValueRef.current = null;
          generalAccessPreviousValueRef.current = null;
          return;
        }

        const json = (await res.json().catch(() => ({}))) as ApiEnvelope<Record<string, never>>;
        if (myGen !== generalAccessLatestGenRef.current) return;

        if (!res.ok || !json.success) {
          if (previous !== null) setGeneralAccess(previous);
          setListError("Only the session owner can change general access");
          console.error("[useShareController] updateGeneralAccess failed", { status: res.status, json });
        }
        setUpdatingGeneralAccess(false);
        generalAccessPendingValueRef.current = null;
        generalAccessPreviousValueRef.current = null;
      }, 300);
    },
    [sessionId]
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
      if (generalAccessDebounceRef.current != null) window.clearTimeout(generalAccessDebounceRef.current);
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

      // Optimistic: flip the access label immediately. Snapshot the prior
      // list so a failed PATCH can roll the row back. `updatingId` keeps the
      // small inline spinner on the row so the user knows it's still settling.
      let previousItems: ShareItem[] = [];
      setItems((prev) => {
        previousItems = prev;
        return prev.map((row) =>
          row.type === item.type && row.id === item.id
            ? { ...row, access }
            : row
        );
      });
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
        setItems(previousItems);
        setUpdatingId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_updated" | "invite_updated";
      }>;
      if (!res.ok || !json.success) {
        setItems(previousItems);
        setListError(getErrorMessage(json) || "Failed to update access");
        setUpdatingId(null);
        return;
      }
      // Success: optimistic value already applied — nothing more to do.
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
      const optimisticMemberId = optimisticRequest?.id;
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
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: string;
        item?: ShareItem;
      }>;
      if (!res.ok || !json.success) {
        if (optimisticMemberId) {
          setItems(prev => prev.filter(i => i.id !== optimisticMemberId));
        }
        setListError("Could not process request. Try again.");
        setPatchingAccessRequestId(null);
        return;
      }

      // Reconcile in place: swap the optimistic (request-id keyed) row for the
      // canonical member item the server returned. No follow-up GET /members —
      // the pending request itself disappears via the realtime accessRequests
      // listener once the server PATCH commits (Fix A).
      const canonical = json.data?.item;
      if (action === "approve" && canonical) {
        setItems((prev) => {
          const withoutDupes = prev.filter(
            (i) =>
              i.id !== optimisticMemberId &&
              !(i.type === canonical.type && i.id === canonical.id)
          );
          return [canonical, ...withoutDupes];
        });
      } else if (action === "approve" && optimisticMemberId) {
        // No canonical item on an approve success (shouldn't happen) — drop
        // the optimistic row rather than leave a request-id keyed fake.
        setItems((prev) => prev.filter((i) => i.id !== optimisticMemberId));
      }

      setPatchingAccessRequestId(null);
    },
    [sessionId, accessRequests]
  );

  const removeAccess = useCallback(
    async (item: Pick<ShareItem, "type" | "id">) => {
      const sid = sessionId.trim();
      if (!sid) return;
      const key = itemKey(item);

      // Optimistic: drop the row immediately. Snapshot the prior list so a
      // failed DELETE can re-insert it. `removingId` drives the inline
      // spinner for the brief window the request is in flight.
      let previousItems: ShareItem[] = [];
      setItems((prev) => {
        previousItems = prev;
        return prev.filter(
          (row) => !(row.type === item.type && row.id === item.id)
        );
      });
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
        setItems(previousItems);
        setRemovingId(null);
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_removed" | "invite_removed";
      }>;
      if (!res.ok || !json.success) {
        setItems(previousItems);
        setListError(getErrorMessage(json) || "Failed to remove access");
        setRemovingId(null);
        return;
      }
      // Success: row already gone — nothing more to do.
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
    workspaceMembers,
    loadingWorkspaceMembers,
  };
}
