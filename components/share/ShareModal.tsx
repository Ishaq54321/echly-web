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
  pendingRequestsCount?: number;
  // Link copy section
  canResolve: boolean;
  linkAccessLevel: ShareAccess;
  setLinkAccessLevel: (v: ShareAccess) => void;
  copyingLink: boolean;
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
  pendingRequestsCount = 0,
  canResolve,
  linkAccessLevel,
  setLinkAccessLevel,
  copyingLink,
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
              <h3 className="text-[13px] font-medium text-foreground/70 mb-3">
                General access
              </h3>
            </div>
            <p className="share-modal-general-access-hint text-foreground/60">Default access for anyone opening the link</p>
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
                  disabled={!canManageAccess || updatingGeneralAccess}
                  ariaLabel="Default access for the link"
                />
              </div>
            </div>
          </section>

          {/* Invite people */}
          <section className="py-3">
            <h3 className="text-[13px] font-medium text-foreground/70 mb-3">Invite people</h3>
            <div className="flex items-center gap-2">
              {/* Email input */}
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 h-[38px] border border-border rounded-lg px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#1775E0] bg-background disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canWrite || inviting}
                autoComplete="email"
              />

              {/* Can view / Can resolve dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-border rounded-lg bg-transparent hover:bg-muted/30 transition-colors text-foreground whitespace-nowrap">
                    {inviteAccess === "resolve" ? "Can resolve" : "Can view"}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
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
                className="h-[38px] bg-[#1775E0] hover:bg-[#1462C4] text-white text-sm font-medium rounded-lg px-4 flex-shrink-0 transition-colors inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
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
              {((pendingRequestsCount ?? 0) > 0 ||
                accessRequests.length > 0) && (
              <>
              <section className="share-modal-requests shrink-0 py-3">
                <h3 className="text-[13px] font-medium text-foreground/70 mb-3">Requests</h3>
                {initialLoading ? (
                  <div className="flex flex-col gap-0 px-5 py-2">
                    {Array.from({ length: 1 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted animate-pulse flex-shrink-0" />
                        <div className="flex-1 h-3.5 rounded bg-muted animate-pulse" style={{ width: `${55 + i * 10}%` }} />
                        <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
                        <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : accessRequests.length === 0 ? (
                  <p className="share-modal-general-access-hint m-0 py-1">No pending requests</p>
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
                                <button className="inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-border rounded-lg bg-transparent hover:bg-muted/30 transition-colors text-foreground whitespace-nowrap">
                                  {getRequestAccess(req) === "resolve" ? "Can resolve" : "Can view"}
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
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
                                    className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${getRequestAccess(req) === "view" ? "text-[#1775E0]" : "text-transparent"}`}
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
                                    className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${getRequestAccess(req) === "resolve" ? "text-[#1775E0]" : "text-transparent"}`}
                                  />
                                  <span>Can resolve</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <button
                              type="button"
                              className="h-7 px-3 text-[12px] font-medium bg-[#1775E0] hover:bg-[#1462C4] text-white rounded-lg transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
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
                              className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger-border)] hover:text-[var(--color-danger)] transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h3 className="text-[13px] font-medium text-foreground/70 mb-3">People with access</h3>
            <div className="share-modal-team share-modal-team--members min-h-0 overflow-y-auto pr-1">
              {initialLoading ? (
                <div className="flex flex-col gap-0">
                  {Array.from({ length: 1 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3.5 rounded bg-muted animate-pulse" style={{ width: `${50 + i * 15}%` }} />
                        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                      </div>
                      <div className="h-7 w-24 rounded-lg bg-muted animate-pulse flex-shrink-0" />
                      <div className="h-7 w-7 rounded-md bg-muted animate-pulse flex-shrink-0" />
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
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.email}
                                className="w-full h-full object-cover rounded-full"
                                onError={e => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("style");
                                }}
                              />
                            ) : null}
                            <span
                              className="share-user-avatar-initial"
                              style={item.avatarUrl ? { display: "none" } : {}}
                            >
                              {emailInitial(item.email)}
                            </span>
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
                              className={`inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-border rounded-lg bg-transparent hover:bg-muted/30 transition-colors text-foreground whitespace-nowrap${disabled ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                            >
                              {busyUpdate && (
                                <Loader2 size={12} className="animate-spin" aria-hidden />
                              )}
                              {item.access === "resolve" ? "Can resolve" : "Can view"}
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(item, "view")}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${item.access === "view" ? "text-[#1775E0]" : "text-transparent"}`}
                              />
                              <span>Can view</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateRole(item, "resolve")}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={`h-4 w-4 flex-shrink-0 stroke-[2.5px] ${item.access === "resolve" ? "text-[#1775E0]" : "text-transparent"}`}
                              />
                              <span>Can resolve</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Remove button */}
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-[var(--color-danger-bg)] hover:border-[var(--color-danger-border)] hover:text-[var(--color-danger)] transition-colors text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
                      <h3 className="text-[13px] font-medium text-foreground/70">Members</h3>
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-neutral-400">
                      <ChevronDown className="h-3.5 w-3.5 text-neutral-600" />
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
                    <h3 className="text-[13px] font-medium text-foreground/70">Members</h3>
                    <div
                      onClick={e => e.stopPropagation()}
                      className="relative group flex items-center justify-center"
                    >
                      <div className="w-[17px] h-[17px] rounded-full border border-foreground/40 flex items-center justify-center cursor-default flex-shrink-0">
                        <div className="flex items-center justify-center w-full h-full text-[10px] font-medium text-foreground/60 leading-none select-none">i</div>
                      </div>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block z-50 pointer-events-none w-52">
                        <div className="rounded-lg px-4 py-3 text-[12px] leading-snug shadow-md text-white bg-neutral-900">
                          Members in your workspace can already view, resolve and manage feedback in any session.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-neutral-400">
                    <ChevronDown className={`h-3.5 w-3.5 text-neutral-600 transition-transform duration-200${membersExpanded ? " rotate-180" : ""}`} />
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
                              {member.avatarUrl ? (
                                <img
                                  src={member.avatarUrl}
                                  alt={member.displayName ?? member.email}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="share-user-avatar-initial">
                                  {initials}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="share-user-email">
                                {member.displayName ?? member.email}
                                {isYou && (
                                  <span className="text-muted-foreground font-normal ml-1">(you)</span>
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {/* Copy link — bottom left */}
          {canWrite ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#1775E0] bg-[#EBF4FF] border border-[#C3DFFE] rounded-lg px-4 py-2 hover:bg-[#E0EAFF] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
              className="h-9 px-5 text-[13px] font-medium border border-border rounded-lg bg-transparent hover:bg-muted/40 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onClose}
              disabled={inviting || patchingAccessRequestId !== null}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 px-6 text-[13px] font-medium bg-[#1775E0] hover:bg-[#1462C4] text-white rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onClose}
              disabled={
                inviting ||
                updatingId !== null ||
                removingId !== null ||
                updatingGeneralAccess ||
                patchingAccessRequestId !== null ||
                refetchingAfterApproval ||
                copyingLink
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
