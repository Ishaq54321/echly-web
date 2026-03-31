"use client";

import { useEffect, useId } from "react";
import { Loader2, Trash2, Users, X } from "lucide-react";
import type {
  ShareAccess,
  ShareAccessRequestItem,
  ShareGeneralAccess,
  ShareItem,
} from "@/components/share/useShareController";
import { ShareDropdown, type ShareDropdownOption } from "@/components/share/ShareDropdown";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  canManageShare: boolean;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviteAccess: ShareAccess;
  setInviteAccess: (access: ShareAccess) => void;
  generalAccess: ShareGeneralAccess;
  loadingGeneralAccess: boolean;
  updatingGeneralAccess: boolean;
  items: ShareItem[];
  initialLoading: boolean;
  inviting: boolean;
  updatingId: string | null;
  removingId: string | null;
  inviteError: string;
  listError: string;
  onInvite: () => void;
  onUpdateGeneralAccess: (value: ShareGeneralAccess) => void;
  onUpdateRole: (item: ShareItem, access: ShareAccess) => void;
  onRemove: (item: ShareItem) => void;
  accessRequests: ShareAccessRequestItem[];
  patchingAccessRequestId: string | null;
  onApproveAccessRequest: (requestId: string) => void;
  onRejectAccessRequest: (requestId: string) => void;
}

const GENERAL_ACCESS_OPTIONS: { value: ShareGeneralAccess; label: string }[] = [
  { value: "restricted", label: "Restricted" },
  { value: "link_view", label: "Anyone with the link" },
];

const ROLE_OPTIONS: ShareDropdownOption[] = [
  { value: "view", label: "Can view", dot: "viewer" },
  { value: "resolve", label: "Can resolve", dot: "resolver" },
];

function emailInitial(email: string): string {
  const t = email.trim();
  if (!t) return "?";
  const ch = t[0];
  return ch ? ch.toUpperCase() : "?";
}

function memberSubtitle(item: ShareItem): string {
  const kind = item.type === "member" ? "Member" : "Invite";
  const st = item.status === "active" ? "Active" : "Pending";
  return `${kind} · ${st}`;
}

export function ShareModal({
  open,
  onClose,
  canManageShare,
  inviteEmail,
  setInviteEmail,
  inviteAccess,
  setInviteAccess,
  generalAccess,
  loadingGeneralAccess,
  updatingGeneralAccess,
  items,
  initialLoading,
  inviting,
  updatingId,
  removingId,
  inviteError,
  listError,
  onInvite,
  onUpdateGeneralAccess,
  onUpdateRole,
  onRemove,
  accessRequests,
  patchingAccessRequestId,
  onApproveAccessRequest,
  onRejectAccessRequest,
}: ShareModalProps) {
  const titleId = useId();
  const inviteAccessId = useId();
  const canWrite = canManageShare;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal share-modal relative z-[1] overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-modal-header">
          <h2 id={titleId} className="share-modal-title">
            Share session
          </h2>
          <button type="button" className="icon-btn shrink-0" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="share-modal-share-stack flex min-h-0 min-w-0 flex-1 flex-col">
          <section className="share-modal-general-access-stack">
            <div className="flex items-center justify-between gap-3">
              <h3 className="share-modal-section-heading share-modal-section-heading--general-access">
                General access
              </h3>
              {loadingGeneralAccess ? (
                <Loader2 size={16} className="shrink-0 animate-spin text-[#6b7280]" aria-hidden />
              ) : null}
            </div>
            <p className="share-modal-general-access-hint">Default access for anyone opening the link</p>
            <div className="share-modal-permissions share-modal-permissions--flush">
              <ShareDropdown
                variant="general"
                value={generalAccess}
                options={GENERAL_ACCESS_OPTIONS}
                onSelect={(v) => {
                  if (v === "restricted" || v === "link_view") {
                    onUpdateGeneralAccess(v);
                  }
                }}
                disabled={!canWrite || updatingGeneralAccess || loadingGeneralAccess}
                ariaLabel="Default access for the link"
              />
            </div>
          </section>

          <hr className="share-modal-divider" />

          <div className="share-modal-invite">
            <div className="share-modal-invite-actions">
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="share-input min-w-0 flex-1 basis-[120px] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canWrite || inviting}
                autoComplete="email"
              />
              <ShareDropdown
                id={inviteAccessId}
                variant="role-pill"
                value={inviteAccess}
                options={ROLE_OPTIONS}
                onSelect={(v) => {
                  if (v === "view" || v === "resolve") {
                    setInviteAccess(v);
                  }
                }}
                disabled={!canWrite || inviting}
                ariaLabel="Invite permission"
              />
              <button
                type="button"
                className="share-btn share-btn--primary share-modal-invite-share-btn inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                onClick={onInvite}
                disabled={!canWrite || inviting}
              >
                {inviting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
                Invite
              </button>
            </div>
          </div>

          {inviteError ? <p className="share-modal-list-error">{inviteError}</p> : null}
          {listError ? <p className="share-modal-list-error">{listError}</p> : null}
          {!canWrite ? (
            <p className="share-modal-general-access-hint">
              You do not have permission to manage access.
            </p>
          ) : null}

          {canWrite ? (
            <>
              <hr className="share-modal-divider" />
              <section className="share-modal-requests shrink-0">
                <h3 className="share-modal-section-heading share-modal-section-heading--requests">
                  Requests
                </h3>
                {initialLoading ? (
                  <div className="share-modal-list-loading flex items-center justify-center py-6">
                    <Loader2 size={18} className="animate-spin text-[#6b7280]" aria-hidden />
                  </div>
                ) : accessRequests.length === 0 ? (
                  <p className="share-modal-general-access-hint m-0 py-1">No pending requests</p>
                ) : (
                  <ul className="share-access-request-list m-0 list-none space-y-2 p-0">
                    {accessRequests.map((req) => {
                      const busy = patchingAccessRequestId === req.id;
                      return (
                        <li
                          key={req.id}
                          className="share-access-request-row flex flex-wrap items-center gap-3 rounded-lg border border-[#E8EBEF] bg-[#FAFBFC] px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] font-medium text-[#111827]">
                              {req.requesterEmail}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="share-access-request-badge inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                                Status: Pending
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              className="share-btn share-btn--primary inline-flex h-8 min-w-[5.5rem] items-center justify-center gap-1.5 px-3 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={busy}
                              onClick={() => onApproveAccessRequest(req.id)}
                            >
                              {busy ? (
                                <Loader2 size={14} className="animate-spin" aria-hidden />
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              type="button"
                              className="share-btn h-8 px-3 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={busy}
                              onClick={() => onRejectAccessRequest(req.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          ) : null}

          <div className="share-modal-shared-with min-h-0 flex-1">
            <h3 className="share-modal-section-heading share-modal-section-heading--people">
              People with access
            </h3>
            <div className="share-modal-team share-modal-team--members min-h-0 overflow-y-auto pr-1">
              {initialLoading ? (
                <div className="share-modal-list-loading flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-[#6b7280]" aria-hidden />
                </div>
              ) : items.length === 0 ? (
                <div className="share-modal-members-empty">
                  <span className="share-modal-members-empty-icon" aria-hidden>
                    <Users size={22} strokeWidth={1.75} />
                  </span>
                  <span>No one has access yet</span>
                </div>
              ) : (
                <ul className="share-team-list m-0 list-none p-0">
                  {items.map((item) => {
                    const busyUpdate = updatingId === `${item.type}:${item.id}`;
                    const busyRemove = removingId === `${item.type}:${item.id}`;
                    const disabled = !canWrite || busyUpdate || busyRemove;
                    return (
                      <li key={`${item.type}:${item.id}`} className="share-member">
                        <div className="share-member-info">
                          <div className="share-user-avatar" aria-hidden>
                            <span className="share-user-avatar-initial">
                              {emailInitial(item.email)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="share-user-email">{item.email}</span>
                            <p>{memberSubtitle(item)}</p>
                          </div>
                        </div>
                        <ShareDropdown
                          variant="role-pill"
                          value={item.access}
                          options={ROLE_OPTIONS}
                          onSelect={(v) => {
                            if (v === "view" || v === "resolve") {
                              onUpdateRole(item, v);
                            }
                          }}
                          disabled={disabled}
                          ariaLabel={`Access for ${item.email}`}
                        />
                        <button
                          type="button"
                          className="icon-btn shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Remove access"
                          disabled={disabled}
                          onClick={() => onRemove(item)}
                        >
                          {busyRemove ? (
                            <Loader2 size={16} className="animate-spin" aria-hidden />
                          ) : (
                            <Trash2 size={16} aria-hidden />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="share-modal-actions share-modal-actions--footer">
          <button type="button" className="share-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="share-btn share-btn--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
