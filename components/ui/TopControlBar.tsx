"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Check, Link as LinkIcon, Loader2, PanelLeftOpen, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShareButton } from "@/components/share/ShareButton";

const ShareModal = dynamic(
  () => import("@/components/share/ShareModal").then((m) => m.ShareModal),
  { ssr: false }
);
import { useShareController, type ShareGeneralAccess } from "@/components/share/useShareController";
import { GlobalSearchButton } from "@/components/layout/GlobalSearchButton";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { SessionActionsDropdown } from "@/components/dashboard/SessionActionsDropdown";
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
  pendingRequestsCount = 0,
  onShareModalOpen,
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
  /** Number of pending access requests; shows red dot on Share button when > 0. */
  pendingRequestsCount?: number;
  /** Called when share modal is opened (e.g. to clear pending count). */
  onShareModalOpen?: () => void;
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
    pendingRequestsCount,
    initialGeneralAccess: session?.generalAccess as ShareGeneralAccess | undefined,
  });

  useEffect(() => {
    if (!share.open) return;
    void share.load().catch(() => {});
  }, [share.open, share.load]);

  const handleShareOpen = useCallback(() => {
    share.setOpen(true);
    onShareModalOpen?.();
  }, [share, onShareModalOpen]);

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
      <div className="page-header sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-end gap-4 bg-[var(--layer-1-bg)] px-6">
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
      <div className="page-header sticky top-0 z-50 flex h-14 w-full shrink-0 items-center px-5 bg-[var(--surface-card)]">
        {/* Left: Panel Toggle + Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleNavPanel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-body)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
            title="Open navigation"
          >
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0"
            title="Go to dashboard"
          >
            <div className="relative w-7 h-7 bg-[var(--brand)] rounded-md flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/Echly_logo.svg" alt="" fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-[15px] font-bold text-[var(--text-heading)] tracking-[-0.01em]">Echly</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Center: Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search tickets..."
            className="w-[220px] h-[34px] pl-9 pr-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-card)] text-[14px] text-[var(--text-body)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] focus:ring-[1.5px] focus:ring-[var(--brand)]/15 transition-all font-[inherit]"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Share + Link grouped pill */}
          <div className="relative inline-flex items-center bg-[var(--brand)] rounded-[var(--radius-sm)] overflow-hidden shadow-[0_1px_3px_rgba(23,117,224,0.2)]">
            <ShareButton onClick={handleShareOpen} disabled={!sessionLoaded} />
            <button
              type="button"
              className="flex items-center justify-center h-[34px] w-[38px] text-white/80 hover:text-white hover:bg-[var(--brand-hover)] transition-colors border-l border-white/20"
              onClick={copyCurrentLink}
              title="Copy link"
              disabled={linkCopyBusy}
            >
              <LinkIcon size={15} strokeWidth={2} />
            </button>
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
              pendingRequestsCount={pendingRequestsCount}
              patchingAccessRequestId={share.patchingAccessRequestId}
              onApproveAccessRequest={(id, access) => {
                void share.patchAccessRequest(id, "approve", access).catch(() => {});
              }}
              onRejectAccessRequest={(id) => {
                void share.patchAccessRequest(id, "reject").catch(() => {});
              }}
              canResolve={canManageShare}
              linkAccessLevel={share.linkAccessLevel}
              setLinkAccessLevel={share.setLinkAccessLevel}
              copyingLink={share.copyingLink}
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
                hideActions={["copyLink"]}
                onRenameSuccess={onSessionRenameSuccess}
                onSetArchived={onSetSessionArchived}
                onRequestDelete={onRequestDeleteSession}
                triggerClassName="icon-btn"
                triggerIconClassName="h-5 w-5"
                triggerAriaLabel="Session actions"
              />
            </div>
          ) : null}

          <span
            className="w-[3px] h-[3px] rounded-full bg-[var(--border)] mx-0.5"
            aria-hidden
          />

          <GlobalSearchButton
            onBeforeOpen={() => {
              setNotificationsOpen(false);
            }}
          />
          <GlobalNotificationButton
            open={notificationsOpen}
            onOpenChange={(next) => {
              setNotificationsOpen(next);
            }}
          />
          <ProfileDropdown />
        </div>
      </div>

    </>
  );
}
