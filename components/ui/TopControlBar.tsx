"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Check, Link as LinkIcon, Loader2, PanelLeftOpen, Search, Bell, MoreHorizontal, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";


const ShareModal = dynamic(
  () => import("@/components/share/ShareModal").then((m) => m.ShareModal),
  { ssr: false }
);
import { useShareController, type ShareGeneralAccess } from "@/components/share/useShareController";
import { GlobalSearchButton } from "@/components/layout/GlobalSearchButton";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { SessionActionsDropdown } from "@/components/dashboard/SessionActionsDropdown";
import { triggerAddMoreTickets } from "@/components/dashboard/hooks/triggerAddMoreTickets";
import { Tooltip } from "@/components/ui/Tooltip";
import { PresenceAvatarRow } from "@/components/presence/PresenceAvatarRow";
import { copySessionLink } from "@/utils/copySessionLink";
import {
  assertIdentityResolved,
  useWorkspace,
} from "@/lib/client/workspaceContext";
import type { Session } from "@/lib/domain/session";

export function TopControlBar({
  sessionId,
  sessionTitle,
  session,
  onSessionRenameSuccess,
  onSetSessionArchived,
  onRequestDeleteSession,
  publicViewer = false,
  canManageShare = false,
  canManageAccess = false,
  isWorkspaceMember = false,
  sessionLoaded = false,
  openCount,
  resolvedCount,
  searchQuery,
  onSearchChange,
  isEditingTitle,
  onTitleClick,
  onTitleChange,
  onTitleSave,
  onTitleCancel,
  titleDraft,
  canEditTitle,
  onToggleNavPanel,
}: {
  sessionId: string;
  sessionTitle?: string;
  session: Session | null;
  onSessionRenameSuccess?: (updated: {
    id: string;
    title: string;
    updatedAt?: unknown;
  }) => void;
  onSetSessionArchived?: (
    sessionId: string,
    archived: boolean
  ) => Promise<void> | void;
  onRequestDeleteSession?: (session: Session) => void;
  /** Anonymous `/session/:id` — no share/archive/delete or global chrome. */
  publicViewer?: boolean;
  canManageShare?: boolean;
  /** True only for OWNER — gates the general access dropdown. */
  canManageAccess?: boolean;
  /** True for OWNER and WS-MEMBER — gates the ⋯ actions menu. */
  isWorkspaceMember?: boolean;
  /** True once the session bundle fetch has resolved (success or error). Gates share/actions buttons. */
  sessionLoaded?: boolean;
  openCount?: number;
  resolvedCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isEditingTitle?: boolean;
  onTitleClick?: () => void;
  onTitleChange?: (value: string) => void;
  onTitleSave?: () => void;
  onTitleCancel?: () => void;
  titleDraft?: string;
  canEditTitle?: boolean;
  onToggleNavPanel?: () => void;
}) {
  const { authUid, isIdentityResolved } = useWorkspace();
  const copyTimerRef = useRef<number | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkCopyBusy, setLinkCopyBusy] = useState(false);

  const share = useShareController(sessionId, {
    canResolve: canManageShare,
    initialGeneralAccess: session?.generalAccess as ShareGeneralAccess | undefined,
  });
  const pendingRequestsCount = share.accessRequests.length;

  useEffect(() => {
    if (!share.open) return;
    void share.load().catch(() => {});
  }, [share.open, share.load]);

  const handleShareOpen = useCallback(() => {
    share.setOpen(true);
  }, [share]);

  const copyCurrentLink = useCallback(async () => {
    if (linkCopyBusy) return;
    assertIdentityResolved(isIdentityResolved);
    const ok = await copySessionLink(sessionId, authUid, {
      onBusy: setLinkCopyBusy,
    });
    if (!ok) return;
    setLinkCopied(true);
    if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setLinkCopied(false), 2000);
  }, [sessionId, linkCopyBusy, authUid, isIdentityResolved]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (publicViewer) {
    return (
      <div className="page-header sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-end gap-4 bg-[var(--surface-subtle)] px-6">
        <div className="right flex shrink-0 items-center gap-2.5">
          <Link
            href={`/login?returnUrl=${encodeURIComponent(`/session/${sessionId}`)}`}
            className="primary-btn inline-flex items-center justify-center no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header
        className="shrink-0 bg-[var(--surface-subtle)] grid items-center px-5"
        style={{ height: '60px', gridTemplateColumns: 'auto 1fr auto', gap: '24px' }}
      >
        {/* Left: Panel Toggle + Logo */}
        <div className="flex items-center gap-3.5">
          <Tooltip content="Open navigation">
            <button
              type="button"
              onClick={onToggleNavPanel}
              className="w-10 h-10 rounded-lg grid place-items-center text-[var(--text-heading)] hover:bg-black/[0.04] transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            >
              <PanelLeftOpen size={22} strokeWidth={2.2} />
            </button>
          </Tooltip>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-bold text-[var(--text-heading)] text-[18px] tracking-[-0.02em] no-underline shrink-0"
          >
            <div className="w-[32px] h-[32px] rounded-[9px] bg-[var(--brand)] flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/Echly_logo.svg" alt="" width={32} height={32} sizes="32px" className="object-cover" />
            </div>
            Echly
          </Link>
        </div>

        {/* Center: Search */}
        <div className="justify-self-center w-full max-w-[420px] relative">
          <div className="h-[34px] bg-white/70 border border-[var(--hair)] rounded-[9px] flex items-center gap-2.5 px-3 cursor-text hover:bg-white hover:border-[var(--hair-strong)] transition-all">
            <Search size={16} strokeWidth={2} className="shrink-0 text-[var(--text-body)]" />
            <input
              type="text"
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search ticket title..."
              className="flex-1 border-0 outline-0 bg-transparent text-[14px] text-[var(--text-heading)] placeholder:text-[var(--text-tertiary)] font-[inherit] min-w-0"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {authUid && (
            <PresenceAvatarRow sessionId={sessionId} currentUserId={authUid} />
          )}
          {/* Share + Copy link merged pill */}
          <div className="relative">
            <div className={`flex items-center bg-[var(--brand)] rounded-[var(--radius-btn)] shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(23,117,224,0.3)] overflow-hidden hover:bg-[var(--brand-hover)] transition-colors${!sessionLoaded ? ' opacity-50 pointer-events-none' : ''}`}>
              <button
                type="button"
                onClick={handleShareOpen}
                className="flex items-center gap-1.5 h-[38px] px-4 text-white text-[14px] font-semibold tracking-[-0.005em] border-0 bg-transparent cursor-pointer"
              >
                <UserPlus size={16} strokeWidth={2} />
                Share
              </button>
              <div className="w-[1.5px] self-stretch bg-white/30" />
              <Tooltip content="Copy link">
                <button
                  type="button"
                  onClick={copyCurrentLink}
                  className="flex items-center justify-center h-[38px] w-[40px] text-white border-0 bg-transparent cursor-pointer hover:bg-white/10 transition-colors"
                  disabled={linkCopyBusy}
                >
                  {linkCopied ? <Check size={16} strokeWidth={2} /> : <LinkIcon size={16} strokeWidth={2} />}
                </button>
              </Tooltip>
            </div>
            {pendingRequestsCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 9,
                  height: 9,
                  background: "var(--color-danger)",
                  borderRadius: "50%",
                  border: "1.5px solid white",
                  pointerEvents: "none",
                }}
                aria-hidden
              />
            )}
          </div>

          {share.open ? (
            <ShareModal
              open
              onClose={() => share.setOpen(false)}
              canManageShare={canManageShare}
              canManageAccess={canManageAccess}
              isWorkspaceMember={isWorkspaceMember}
              sessionId={sessionId}
              sessionName={sessionTitle ?? null}
              inviteEmail={share.inviteEmail}
              setInviteEmail={share.setInviteEmail}
              inviteAccess={share.inviteAccess}
              setInviteAccess={share.setInviteAccess}
              generalAccess={share.generalAccess}
              updatingGeneralAccess={share.updatingGeneralAccess}
              items={share.items}
              initialLoading={share.initialLoading}
              inviting={share.inviting}
              updatingId={share.updatingId}
              removingId={share.removingId}
              inviteError={share.inviteError}
              listError={share.listError}
              onInvite={() => {
                void share.invite().catch(() => {});
              }}
              onUpdateGeneralAccess={(value) => {
                void share.updateGeneralAccess(value).catch(() => {});
              }}
              onUpdateRole={(item, access) => {
                void share.updateRole(item, access).catch(() => {});
              }}
              onRemove={(item) => {
                void share.removeAccess(item).catch(() => {});
              }}
              accessRequests={share.accessRequests}
              patchingAccessRequestId={share.patchingAccessRequestId}
              onApproveAccessRequest={(id, access) => {
                void share.patchAccessRequest(id, "approve", access).catch(() => {});
              }}
              onRejectAccessRequest={(id) => {
                void share.patchAccessRequest(id, "reject").catch(() => {});
              }}
              canResolve={canManageShare}
              linkCopied={share.linkCopied}
              onCopyShareLink={() => void share.copyShareLink().catch(() => {})}
              refetchingAfterApproval={share.refetchingAfterApproval}
              workspaceMembers={share.workspaceMembers}
              loadingWorkspaceMembers={share.loadingWorkspaceMembers}
              currentUserUid={authUid ?? undefined}
            />
          ) : null}

          {session !== null && (isWorkspaceMember || canManageAccess) ? (
            <div
              className={`relative shrink-0${!sessionLoaded ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <SessionActionsDropdown
                session={session}
                variant="list"
                flipPlacement
                hideActions={["share"]}
                onRenameSuccess={onSessionRenameSuccess}
                onSetArchived={onSetSessionArchived}
                onRequestDelete={onRequestDeleteSession}
                onAddMoreTickets={() => triggerAddMoreTickets(sessionId)}
                triggerClassName="w-9 h-9 rounded-lg grid place-items-center text-[var(--text-heading)] hover:bg-black/[0.04] cursor-pointer border-0 bg-transparent"
                triggerIconClassName="h-[22px] w-[22px]"
                triggerIconStrokeWidth={2.2}
                triggerAriaLabel="Session actions"
              />
            </div>
          ) : null}

          <GlobalSearchButton
            onBeforeOpen={() => {
              setNotificationsOpen(false);
            }}
          />
          <div className="relative">
            <GlobalNotificationButton
              open={notificationsOpen}
              onOpenChange={(next) => {
                setNotificationsOpen(next);
              }}
            />
          </div>
          <ProfileDropdown />
        </div>
      </header>

    </>
  );
}
