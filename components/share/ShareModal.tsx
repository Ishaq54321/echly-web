"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Link, Loader2, Trash2, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type {
  ShareAccess,
  ShareAccessRequestItem,
  ShareGeneralAccess,
  ShareItem,
  WorkspaceMember,
} from "@/components/share/useShareController";
import { ShareDropdown, type ShareDropdownOption } from "@/components/share/ShareDropdown";
import { ExternalShareModal } from "@/components/share/ExternalShareModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/Tooltip";

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
  onApproveAccessRequest: (requestId: string, access?: "view" | "resolve") => void;
  onRejectAccessRequest: (requestId: string) => void;
  // Link copy section
  canResolve: boolean;
  linkCopied: boolean;
  onCopyShareLink: () => void;
  refetchingAfterApproval?: boolean;
  workspaceMembers?: WorkspaceMember[];
  loadingWorkspaceMembers?: boolean;
  currentUserUid?: string;
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

function MemberAvatar({
  avatarUrl,
  alt,
  initial,
}: {
  avatarUrl?: string | null;
  alt: string;
  initial: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (!avatarUrl || imageError) {
    return <span className="share-user-avatar-initial">{initial}</span>;
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
      onError={() => setImageError(true)}
    />
  );
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
  linkCopied,
  onCopyShareLink,
  refetchingAfterApproval = false,
  workspaceMembers = [],
  loadingWorkspaceMembers = false,
  currentUserUid,
}: ShareModalProps) {
  const titleId = useId();
  const canWrite = canManageShare;
  const [requestAccessOverrides, setRequestAccessOverrides] =
    useState<Record<string, "view" | "resolve">>({});
  const [membersExpanded, setMembersExpanded] = useState(false);

  const getRequestAccess = (req: ShareAccessRequestItem) =>
    requestAccessOverrides[req.id] ?? req.requestedAccess ?? "resolve";

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
          <button
            type="button"
            className={`icon-btn shrink-0${inviting || patchingAccessRequestId !== null ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            aria-label="Close"
            onClick={onClose}
            disabled={inviting || patchingAccessRequestId !== null}
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="share-modal-share-stack flex min-h-0 min-w-0 flex-1 flex-col">
          {/* General access */}
          <section className="share-modal-general-access-stack">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70 mb-3">
                General access
              </h3>
            </div>
            <p className="share-modal-general-access-hint text-[var(--text-heading)]/60">Default access for anyone opening the link</p>
            <div className="share-modal-permissions share-modal-permissions--flush">
              <Tooltip content={!canManageAccess ? "Only the session owner can change general access" : ""}>
                <div>
                  <ShareDropdown
                    variant="general"
                    value={generalAccess}
                    options={GENERAL_ACCESS_OPTIONS}
                    onSelect={(v) => {
                      if (v === "restricted" || v === "link_view") {
                        onUpdateGeneralAccess(v);
                      }
                    }}
                    disabled={!canManageAccess || updatingGeneralAccess}
                    ariaLabel="Default access for the link"
                  />
                </div>
              </Tooltip>
            </div>
          </section>

          {/* Invite people */}
          <section className="py-3">
            <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70 mb-3">Invite people</h3>
            <div className="flex items-center gap-2">
              {/* Email input */}
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 h-[38px] border border-[var(--border)] rounded-lg px-3 text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] bg-[var(--surface-page)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canWrite || inviting}
                autoComplete="email"
              />

              {/* Can view / Can resolve dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 h-[38px] px-4 text-[14px] font-medium border border-[var(--border)] rounded-[var(--radius-btn)] bg-transparent hover:bg-[var(--surface-hover)]/30 transition-colors text-[var(--text-heading)] whitespace-nowrap">
                    {inviteAccess === "resolve" ? "Can resolve" : "Can view"}
                    <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => setInviteAccess("view")}>
                    Can view
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInviteAccess("resolve")}>
                    Can resolve
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Invite button */}
              <button
                type="button"
                className="inline-flex h-[38px] items-center justify-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
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
              {(accessRequests.length > 0 || initialLoading) && (
              <>
              <section className="share-modal-requests shrink-0 py-3">
                <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70 mb-3">Requests</h3>
                {initialLoading ? (
                  <div className="flex flex-col gap-0 px-5 py-2">
                    {Array.from({ length: 1 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--surface-hover)] animate-pulse flex-shrink-0" />
                        <div className="flex-1 h-3.5 rounded bg-[var(--surface-hover)] animate-pulse" style={{ width: `${55 + i * 10}%` }} />
                        <div className="h-7 w-20 rounded-lg bg-[var(--surface-hover)] animate-pulse" />
                        <div className="h-7 w-20 rounded-lg bg-[var(--surface-hover)] animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : accessRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center" style={{ padding: "20px 16px" }}>
                    <div style={{ width: 120, height: 100, marginBottom: 12 }}>
                      <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ overflow: "visible" }}>
                        <g transform="translate(100 86) translate(-44 -28)">
                          <path d="M0 28 L0 50 L88 50 L88 28 L66 28 L60 36 L28 36 L22 28 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
                          <path d="M14 8 L74 8 L74 28 L14 28 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                          <rect x="22" y="14" width="40" height="3" rx="1.5" fill="#E5E7EB" />
                          <rect x="22" y="20" width="32" height="3" rx="1.5" fill="#E5E7EB" />
                        </g>
                        <g transform="translate(146 112)">
                          <circle cx="17" cy="17" r="14" fill="#6B7280" />
                          <rect x="10" y="13" width="14" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8" />
                          <path d="M10 13 L17 19 L24 13" fill="none" stroke="#fff" strokeWidth="1.8" />
                        </g>
                      </svg>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-heading)", margin: "0 0 4px 0" }}>
                      No pending requests
                    </h4>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, maxWidth: 240 }}>
                      Access requests from external viewers will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="share-access-request-list m-0 list-none p-0">
                    {accessRequests.map((req) => {
                      const busy = patchingAccessRequestId === req.id;
                      return (
                        <li
                          key={req.id}
                          className="share-access-request-row flex items-center gap-3 py-3 px-0"
                        >
                          <div className="share-member-info">
                            <div className="share-user-avatar" aria-hidden>
                              <span className="share-user-avatar-initial">
                                {req.requesterEmail[0]?.toUpperCase() ?? "?"}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="share-user-email">{req.requesterEmail}</span>
                              <p>Request · Pending</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {/* Role selector */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center gap-1.5 h-[38px] px-4 text-[14px] font-medium border border-[var(--border)] rounded-[var(--radius-btn)] bg-transparent hover:bg-[var(--surface-hover)]/30 transition-colors text-[var(--text-heading)] whitespace-nowrap">
                                  {getRequestAccess(req) === "resolve" ? "Can resolve" : "Can view"}
                                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] ml-0.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  onClick={() => setRequestAccessOverrides(prev => ({
                                    ...prev,
                                    [req.id]: "view",
                                  }))}
                                  className="flex items-center gap-2"
                                >
                                  <Check
                                    className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${getRequestAccess(req) === "view" ? "text-[var(--brand)]" : "text-transparent"}`}
                                  />
                                  <span>Can view</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setRequestAccessOverrides(prev => ({
                                    ...prev,
                                    [req.id]: "resolve",
                                  }))}
                                  className="flex items-center gap-2"
                                >
                                  <Check
                                    className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${getRequestAccess(req) === "resolve" ? "text-[var(--brand)]" : "text-transparent"}`}
                                  />
                                  <span>Can resolve</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <button
                              type="button"
                              className="inline-flex h-[38px] items-center justify-center gap-1.5 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
                              disabled={busy}
                              onClick={() => onApproveAccessRequest(req.id, getRequestAccess(req))}
                            >
                              {busy ? (
                                <Loader2 size={13} className="animate-spin" aria-hidden />
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => onRejectAccessRequest(req.id)}
                              className="w-7 h-7 rounded-md border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger-border)] hover:text-[var(--color-danger)] transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
              </>
              )}
            </>
          ) : null}

          {/* People with access */}
          <div className="share-modal-shared-with min-h-0 flex-1 py-3">
            <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70 mb-3">People with access</h3>
            <div className="share-modal-team share-modal-team--members min-h-0 overflow-y-auto pr-1">
              {initialLoading ? (
                <div className="flex flex-col gap-0">
                  {Array.from({ length: 1 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] animate-pulse flex-shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3.5 rounded bg-[var(--surface-hover)] animate-pulse" style={{ width: `${50 + i * 15}%` }} />
                        <div className="h-3 w-32 rounded bg-[var(--surface-hover)] animate-pulse" />
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-[var(--surface-hover)] animate-pulse flex-shrink-0" />
                      <div className="h-7 w-7 rounded-md bg-[var(--surface-hover)] animate-pulse flex-shrink-0" />
                    </div>
                  ))}
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
                      <li key={`${item.type}:${item.id}`} className="share-member" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                        <div className="share-member-info">
                          <div className="share-user-avatar" aria-hidden>
                            <MemberAvatar
                              avatarUrl={item.avatarUrl}
                              alt={item.email}
                              initial={emailInitial(item.email)}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="share-user-email">{item.email}</span>
                            <p>{memberSubtitle(item)}</p>
                          </div>
                        </div>

                        {/* Role dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1.5 h-[38px] px-4 text-[14px] font-medium border border-[var(--border)] rounded-[var(--radius-btn)] bg-transparent hover:bg-[var(--surface-hover)]/30 transition-colors text-[var(--text-heading)] whitespace-nowrap${disabled ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                            >
                              {busyUpdate && (
                                <Loader2 size={12} className="animate-spin" aria-hidden />
                              )}
                              {item.access === "resolve" ? "Can resolve" : "Can view"}
                              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] ml-0.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(item, "view")}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${item.access === "view" ? "text-[var(--brand)]" : "text-transparent"}`}
                              />
                              <span>Can view</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(item, "resolve")}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${item.access === "resolve" ? "text-[var(--brand)]" : "text-transparent"}`}
                              />
                              <span>Can resolve</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Remove button */}
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-[var(--border)] flex items-center justify-center hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger-border)] hover:text-[var(--color-danger)] transition-colors text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Members section */}
          {(() => {
            const otherMembers = workspaceMembers.filter(m => m.uid !== currentUserUid);
            const allWithSelf = [
              ...workspaceMembers.filter(m => m.uid === currentUserUid),
              ...otherMembers,
            ];

            if (loadingWorkspaceMembers) {
              return (
                <section className="share-modal-section py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70">Members</h3>
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-[var(--border-strong)]">
                      <ChevronDown className="h-3.5 w-3.5 text-[var(--text-body)]" />
                    </div>
                  </div>
                </section>
              );
            }

            return (
              <section className="share-modal-section py-3">
                <div
                  className="flex items-center justify-between cursor-pointer select-none mb-3"
                  onClick={() => setMembersExpanded(prev => !prev)}
                >
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] font-medium text-[var(--text-heading)]/70">Members</h3>
                    <div
                      onClick={e => e.stopPropagation()}
                      className="relative group flex items-center justify-center"
                    >
                      <div className="w-[17px] h-[17px] rounded-full border border-foreground/40 flex items-center justify-center cursor-default flex-shrink-0">
                        <div className="flex items-center justify-center w-full h-full text-[12px] font-medium text-[var(--text-heading)]/60 leading-none select-none">i</div>
                      </div>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block z-50 pointer-events-none w-52">
                        <div className="rounded-lg px-4 py-3 text-[12px] leading-snug shadow-md text-white bg-[var(--text-heading)]">
                          Members in your workspace can already view, resolve and manage feedback in any session.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-[var(--border-strong)]">
                    <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-body)] transition-transform duration-200${membersExpanded ? " rotate-180" : ""}`} />
                  </div>
                </div>

                {membersExpanded && (
                  <ul className="share-access-request-list m-0 list-none p-0">
                    {allWithSelf.map(member => {
                      const isYou = member.uid === currentUserUid;
                      const initials = (member.displayName ?? member.email)[0]?.toUpperCase() ?? "?";
                      return (
                        <li key={member.uid} className="share-access-request-row flex items-center gap-3 py-3 px-0">
                          <div className="share-member-info">
                            <div className="share-user-avatar" aria-hidden>
                              <MemberAvatar
                                avatarUrl={member.avatarUrl}
                                alt={member.displayName ?? member.email}
                                initial={initials}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="share-user-email">
                                {member.displayName ?? member.email}
                                {isYou && (
                                  <span className="text-[var(--text-secondary)] font-normal ml-1">(you)</span>
                                )}
                              </span>
                              <p>{member.role === "OWNER" ? "Owner" : "Member"}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
          {/* Copy link — bottom left */}
          {canWrite ? (
            <button
              type="button"
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand)] text-[14px] font-medium hover:bg-[var(--brand-muted)] transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              onClick={onCopyShareLink}
            >
              {linkCopied ? (
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
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border border-[var(--border)] bg-transparent text-[var(--text-heading)] text-[14px] font-medium hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              onClick={onClose}
              disabled={inviting || patchingAccessRequestId !== null}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-[38px] items-center gap-2 px-4 rounded-[var(--radius-btn)] border-none bg-[var(--brand)] text-white text-[14px] font-medium hover:bg-[var(--brand-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              onClick={onClose}
              disabled={
                inviting ||
                updatingId !== null ||
                removingId !== null ||
                updatingGeneralAccess ||
                patchingAccessRequestId !== null ||
                refetchingAfterApproval
              }
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
