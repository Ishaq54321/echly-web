"use client";

import { useId } from "react";
import { Check, ChevronDown, Link, Loader2, Trash2, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type {
  ShareAccess,
  ShareAccessRequestItem,
  ShareGeneralAccess,
  ShareItem,
} from "@/components/share/useShareController";
import { ShareDropdown, type ShareDropdownOption } from "@/components/share/ShareDropdown";
import { ExternalShareModal } from "@/components/share/ExternalShareModal";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  canManageShare: boolean;
  /** True only for OWNER — gates the general access dropdown. */
  canManageAccess: boolean;
  /** True for OWNER and WS-MEMBER — shows full modal vs simplified external view. */
  isWorkspaceMember?: boolean;
  /** Forwarded to ExternalShareModal for display; optional. */
  sessionId?: string;
  sessionName?: string | null;
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
  // Link copy section
  canResolve: boolean;
  linkAccessLevel: ShareAccess;
  setLinkAccessLevel: (v: ShareAccess) => void;
  copyingLink: boolean;
  linkCopied: boolean;
  onCopyShareLink: () => void;
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
  canManageAccess,
  isWorkspaceMember = false,
  sessionId = "",
  sessionName = null,
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
  canResolve,
  linkAccessLevel,
  setLinkAccessLevel,
  copyingLink,
  linkCopied,
  onCopyShareLink,
}: ShareModalProps) {
  const titleId = useId();
  const canWrite = canManageShare;

  if (!open) return null;

  if (!isWorkspaceMember) {
    return (
      <ExternalShareModal
        isOpen={open}
        onClose={onClose}
        sessionId={sessionId}
        sessionName={sessionName}
      />
    );
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabelledBy={titleId}>
      <div className="modal share-modal relative overflow-visible" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <h2 id={titleId} className="share-modal-title">
            Share session
          </h2>
          <button type="button" className="icon-btn shrink-0" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="share-modal-share-stack flex min-h-0 min-w-0 flex-1 flex-col">
          {/* General access */}
          <section className="share-modal-general-access-stack">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-medium text-muted-foreground mb-1.5">
                General access
                {loadingGeneralAccess ? (
                  <Loader2 size={12} className="ml-1.5 inline animate-spin" aria-hidden />
                ) : null}
              </h3>
            </div>
            <p className="share-modal-general-access-hint">Default access for anyone opening the link</p>
            <div className="share-modal-permissions share-modal-permissions--flush">
              <div
                title={!canManageAccess ? "Only the session owner can change general access" : undefined}
              >
                <ShareDropdown
                  variant="general"
                  value={generalAccess}
                  options={GENERAL_ACCESS_OPTIONS}
                  onSelect={(v) => {
                    if (v === "restricted" || v === "link_view") {
                      onUpdateGeneralAccess(v);
                    }
                  }}
                  disabled={!canManageAccess || updatingGeneralAccess || loadingGeneralAccess}
                  ariaLabel="Default access for the link"
                />
              </div>
            </div>
          </section>

          <hr className="share-modal-divider" />

          {/* Invite people */}
          <section className="py-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Invite people</h3>
            <div className="flex items-center gap-2">
              {/* Email input */}
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 h-[38px] border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue-400 bg-background disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canWrite || inviting}
                autoComplete="email"
              />

              {/* Can view / Can resolve pill toggle */}
              <div className="flex items-center bg-muted border border-border rounded-lg p-[3px] gap-[2px] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setInviteAccess("view")}
                  disabled={!canWrite || inviting}
                  className={`text-xs font-medium rounded-md px-2.5 py-1 transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${inviteAccess === "view" ? "bg-background text-foreground border border-border shadow-none" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Can view
                </button>
                <button
                  type="button"
                  onClick={() => setInviteAccess("resolve")}
                  disabled={!canWrite || inviting}
                  className={`text-xs font-medium rounded-md px-2.5 py-1 transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${inviteAccess === "resolve" ? "bg-background text-foreground border border-border shadow-none" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Can resolve
                </button>
              </div>

              {/* Invite button */}
              <button
                type="button"
                className="h-[38px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 flex-shrink-0 transition-colors inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onInvite}
                disabled={!canWrite || inviting}
              >
                {inviting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
                Invite
              </button>
            </div>

            {inviteError ? <p className="share-modal-list-error mt-2">{inviteError}</p> : null}
            {listError ? <p className="share-modal-list-error mt-1">{listError}</p> : null}
            {!canWrite ? (
              <p className="share-modal-general-access-hint mt-2">
                You do not have permission to manage access.
              </p>
            ) : null}
          </section>

          {/* Requests */}
          {canWrite ? (
            <>
              <hr className="share-modal-divider" />
              <section className="share-modal-requests shrink-0 py-3">
                <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Requests</h3>
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
                          className="share-access-request-row flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] font-medium text-foreground">
                              {req.requesterEmail}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="share-access-request-badge inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                                Status: Pending
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {/* Role selector */}
                            <div className="flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-[5px] text-xs font-medium text-muted-foreground bg-background cursor-pointer hover:border-border/80 transition-colors select-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                              Can view
                              <ChevronDown className="h-3 w-3 ml-0.5" />
                            </div>
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

          <hr className="share-modal-divider" />

          {/* People with access */}
          <div className="share-modal-shared-with min-h-0 flex-1 py-3">
            <h3 className="text-xs font-medium text-muted-foreground mb-1.5">People with access</h3>
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

                        {/* Role dropdown */}
                        <div
                          className={`flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-[5px] text-xs font-medium text-muted-foreground bg-background cursor-pointer hover:border-border/80 transition-colors select-none${disabled ? " opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                          onClick={() => {
                            if (!disabled) {
                              onUpdateRole(item, item.access === "view" ? "resolve" : "view");
                            }
                          }}
                        >
                          {busyUpdate ? (
                            <Loader2 size={12} className="animate-spin" aria-hidden />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          {item.access === "resolve" ? "Can resolve" : "Can view"}
                          <ChevronDown className="h-3 w-3 ml-0.5" />
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Remove access"
                          disabled={disabled}
                          onClick={() => onRemove(item)}
                        >
                          {busyRemove ? (
                            <Loader2 size={14} className="animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border">
          {/* Copy link — bottom left */}
          {canWrite ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-[7px] hover:bg-blue-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onCopyShareLink}
              disabled={copyingLink}
            >
              {copyingLink ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : linkCopied ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Link className="h-3.5 w-3.5" aria-hidden />
              )}
              {linkCopied ? "Copied" : "Copy link"}
            </button>
          ) : (
            <span />
          )}

          {/* Cancel + Done — bottom right */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-9 px-4 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 px-5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
