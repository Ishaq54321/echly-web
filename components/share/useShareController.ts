"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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

export function itemKey(item: Pick<ShareItem, "type" | "id">): string {
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

  // Focused error states — each surfaces next to the control that caused it.
  // Replaces the single shared `listError`.
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [generalAccessError, setGeneralAccessError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});

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

  // Silent double-submit / staleness guards (no UI dependence). Mirrors the
  // AssignDropdown `if (busy) return;` pattern and the generalAccess
  // generation ref below — invite/role/remove mutations apply optimistically
  // and never block the UI; these refs only prevent duplicate sends and
  // discard out-of-order responses.
  const invitingRef = useRef(false);
  const updateGenerationRefs = useRef<Map<string, number>>(new Map());
  const removeGenerationRefs = useRef<Map<string, number>>(new Map());

  const generalAccessDebounceRef = useRef<number | null>(null);
  const generalAccessLatestGenRef = useRef(0);
  const generalAccessPendingValueRef = useRef<ShareGeneralAccess | null>(null);
  const generalAccessPreviousValueRef = useRef<ShareGeneralAccess | null>(null);

  // Per-row / per-request error timers, so a fresh action on the same key
  // cancels a still-pending auto-clear instead of clearing the new error.
  const rowErrorTimers = useRef<Map<string, number>>(new Map());
  const requestErrorTimers = useRef<Map<string, number>>(new Map());

  const setRowErrorWithTimeout = useCallback((key: string, message: string) => {
    const existing = rowErrorTimers.current.get(key);
    if (existing != null) window.clearTimeout(existing);
    setRowErrors((prev) => ({ ...prev, [key]: message }));
    const timer = window.setTimeout(() => {
      rowErrorTimers.current.delete(key);
      setRowErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 4000);
    rowErrorTimers.current.set(key, timer);
  }, []);

  const clearRowError = useCallback((key: string) => {
    const existing = rowErrorTimers.current.get(key);
    if (existing != null) {
      window.clearTimeout(existing);
      rowErrorTimers.current.delete(key);
    }
    setRowErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setRequestErrorWithTimeout = useCallback((key: string, message: string) => {
    const existing = requestErrorTimers.current.get(key);
    if (existing != null) window.clearTimeout(existing);
    setRequestErrors((prev) => ({ ...prev, [key]: message }));
    const timer = window.setTimeout(() => {
      requestErrorTimers.current.delete(key);
      setRequestErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, 4000);
    requestErrorTimers.current.set(key, timer);
  }, []);

  const clearRequestError = useCallback((key: string) => {
    const existing = requestErrorTimers.current.get(key);
    if (existing != null) {
      window.clearTimeout(existing);
      requestErrorTimers.current.delete(key);
    }
    setRequestErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Modal-closed fallback: if the failure lands while the modal is closed,
  // the inline surface would be invisible — fall back to a single Sonner
  // toast so the user isn't silently misled. This is the ONLY remaining
  // toast.error path in this controller. `open` is read via a ref so this
  // callback stays identity-stable — the mutation callbacks below capture it
  // once, but it always observes the *current* modal-open state (a request
  // started while open can still land after the modal closed → Test 10).
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const reportError = useCallback((inlineSetter: () => void) => {
    if (openRef.current) {
      inlineSetter();
    } else {
      toast.error("Action failed — please try again", { duration: 5000 });
    }
  }, []);

  const load = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    setInitialLoading(true);
    setLoadError(null);

    const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`);

    if (!res) {
      setLoadError("Could not load access list");
      setInitialLoading(false);
      return;
    }
    const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
      items?: ShareItem[];
    }>;
    if (!res.ok || !json.success) {
      setLoadError(getErrorMessage(json) || "Could not load access list");
      setInitialLoading(false);
      return;
    }
    setItems(Array.isArray(json.data?.items) ? json.data.items : []);

    setInitialLoading(false);
  }, [sessionId]);

  const invite = useCallback(async () => {
    const sid = sessionId.trim();
    if (!sid) return;
    if (invitingRef.current) return; // silent double-submit guard
    invitingRef.current = true;
    setInviteError(null);

    const email = inviteEmail.trim();
    const optimisticItem: ShareItem = {
      id: `optimistic-${Date.now()}`,
      type: "invite",
      email,
      access: inviteAccess,
      status: "pending",
    };
    // Clear the input immediately and apply the optimistic row — the action
    // feels instant, no different from Assign/Priority.
    setInviteEmail("");
    setItems((prev) => [optimisticItem, ...prev]);

    try {
      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          access: inviteAccess,
        }),
      });

      if (!res) {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        reportError(() => setInviteError("Failed to invite — please try again"));
        return;
      }

      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_added" | "invite_created" | "invite_updated" | "already_member";
        item?: ShareItem;
      }>;
      if (!res.ok || !json.success) {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        reportError(() =>
          setInviteError(getErrorMessage(json) || "Failed to invite — please try again")
        );
        return;
      }

      if (json.data?.type === "already_member") {
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        reportError(() => setInviteError("User already has access"));
        return;
      }

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
      invitingRef.current = false;
    }
  }, [inviteAccess, inviteEmail, sessionId, reportError]);

  const updateGeneralAccess = useCallback(
    (value: ShareGeneralAccess) => {
      const sid = sessionId.trim();
      if (!sid) return;
      setGeneralAccessError(null);

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

        // Superseded by a later toggle — intentional silent rollback.
        if (myGen !== generalAccessLatestGenRef.current) return;

        if (!res) {
          if (previous !== null) setGeneralAccess(previous);
          setGeneralAccessError("Failed to update general access — please try again");
          setUpdatingGeneralAccess(false);
          generalAccessPendingValueRef.current = null;
          generalAccessPreviousValueRef.current = null;
          return;
        }

        const json = (await res.json().catch(() => ({}))) as ApiEnvelope<Record<string, never>>;
        // Superseded by a later toggle — intentional silent rollback.
        if (myGen !== generalAccessLatestGenRef.current) return;

        if (!res.ok || !json.success) {
          if (previous !== null) setGeneralAccess(previous);
          setGeneralAccessError(
            getErrorMessage(json) || "Only the session owner can change general access"
          );
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
    const rowTimers = rowErrorTimers.current;
    const reqTimers = requestErrorTimers.current;
    return () => {
      if (linkCopiedTimerRef.current != null) window.clearTimeout(linkCopiedTimerRef.current);
      if (generalAccessDebounceRef.current != null) window.clearTimeout(generalAccessDebounceRef.current);
      rowTimers.forEach((t) => window.clearTimeout(t));
      reqTimers.forEach((t) => window.clearTimeout(t));
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
      // list so a failed PATCH can roll the row back. The per-key generation
      // ref discards out-of-order responses (rapid re-edits) without any UI
      // dependence — the mutation is silent, just like Assign/Priority.
      let previousItems: ShareItem[] = [];
      setItems((prev) => {
        previousItems = prev;
        return prev.map((row) =>
          row.type === item.type && row.id === item.id
            ? { ...row, access }
            : row
        );
      });
      const gen = (updateGenerationRefs.current.get(key) ?? 0) + 1;
      updateGenerationRefs.current.set(key, gen);
      clearRowError(key);

      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          id: item.id,
          access,
        }),
      });

      // A newer edit to this same row superseded us — discard this response.
      if (updateGenerationRefs.current.get(key) !== gen) return;

      if (!res) {
        setItems(previousItems);
        reportError(() =>
          setRowErrorWithTimeout(key, "Failed to update access — please try again")
        );
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_updated" | "invite_updated";
      }>;
      if (updateGenerationRefs.current.get(key) !== gen) return;
      if (!res.ok || !json.success) {
        setItems(previousItems);
        reportError(() =>
          setRowErrorWithTimeout(key, getErrorMessage(json) || "Failed to update access")
        );
        return;
      }
      // Success: optimistic value already applied — nothing more to do.
    },
    [sessionId, reportError, setRowErrorWithTimeout, clearRowError]
  );

  const patchAccessRequest = useCallback(
    async (requestId: string, action: "approve" | "reject", access?: "view" | "resolve") => {
      const sid = sessionId.trim();
      const rid = requestId.trim();
      if (!sid || !rid) return;
      setPatchingAccessRequestId(rid);
      clearRequestError(rid);

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
        reportError(() =>
          setRequestErrorWithTimeout(rid, "Could not process request. Try again.")
        );
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
        reportError(() =>
          setRequestErrorWithTimeout(rid, "Could not process request. Try again.")
        );
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
    [sessionId, accessRequests, reportError, setRequestErrorWithTimeout, clearRequestError]
  );

  const removeAccess = useCallback(
    async (item: Pick<ShareItem, "type" | "id">) => {
      const sid = sessionId.trim();
      if (!sid) return;
      const key = itemKey(item);

      // Optimistic: drop the row immediately. Snapshot the prior list so a
      // failed DELETE can re-insert it. The per-key generation ref discards
      // out-of-order responses without any UI dependence — the removal is
      // silent, just like Assign/Priority.
      let previousItems: ShareItem[] = [];
      setItems((prev) => {
        previousItems = prev;
        return prev.filter(
          (row) => !(row.type === item.type && row.id === item.id)
        );
      });
      const gen = (removeGenerationRefs.current.get(key) ?? 0) + 1;
      removeGenerationRefs.current.set(key, gen);
      clearRowError(key);

      const res = await authFetch(`/api/sessions/${encodeURIComponent(sid)}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          id: item.id,
        }),
      });

      // A newer mutation to this same row superseded us — discard.
      if (removeGenerationRefs.current.get(key) !== gen) return;

      if (!res) {
        setItems(previousItems);
        reportError(() =>
          setRowErrorWithTimeout(key, "Failed to remove — please try again")
        );
        return;
      }
      const json = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        type?: "member_removed" | "invite_removed";
      }>;
      if (removeGenerationRefs.current.get(key) !== gen) return;
      if (!res.ok || !json.success) {
        setItems(previousItems);
        reportError(() =>
          setRowErrorWithTimeout(key, getErrorMessage(json) || "Failed to remove access")
        );
        return;
      }
      // Success: row already gone — nothing more to do.
    },
    [sessionId, reportError, setRowErrorWithTimeout, clearRowError]
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

  // Wrap setInviteEmail so any keystroke clears a stale invite error
  // (plan Step 3: "Errors clear on relevant input change").
  const handleSetInviteEmail = useCallback((value: string) => {
    setInviteEmail(value);
    setInviteError(null);
  }, []);

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
    setInviteEmail: handleSetInviteEmail,
    inviteAccess,
    setInviteAccess,
    generalAccess,
    updatingGeneralAccess,
    initialLoading,
    // Focused error surfaces — bundled so the two call sites pass one prop.
    shareErrors: {
      inviteError,
      generalAccessError,
      loadError,
      rowErrors,
      requestErrors,
    },
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

export type ShareErrors = {
  inviteError: string | null;
  generalAccessError: string | null;
  loadError: string | null;
  rowErrors: Record<string, string>;
  requestErrors: Record<string, string>;
};
