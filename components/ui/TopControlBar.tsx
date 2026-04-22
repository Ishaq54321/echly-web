"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, Link as LinkIcon, Loader2 } from "lucide-react";
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
      <div className="page-header sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-end gap-4 bg-[var(--layer-1-bg)] px-6">
        <div className="right flex shrink-0 items-center gap-2.5">
          {/* Share button with notification dot */}
          <div style={{ position: "relative", display: "inline-flex" }}>
            <ShareButton onClick={handleShareOpen} disabled={!sessionLoaded} />
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
          <button
            type="button"
            className={`icon-btn copy-link-btn ${linkCopied ? "copy-link-btn--copied" : ""}`}
            aria-label={linkCopyBusy ? "Generating link…" : linkCopied ? "Copied" : "Copy link"}
            disabled={linkCopyBusy}
            onClick={copyCurrentLink}
          >
            {linkCopyBusy ? (
              <Loader2 size={20} strokeWidth={2} className="animate-spin" aria-hidden />
            ) : linkCopied ? (
              <>
                <Check size={18} strokeWidth={2.5} aria-hidden />
                <span className="copy-link-label">Copied</span>
              </>
            ) : (
              <LinkIcon size={20} strokeWidth={2} aria-hidden />
            )}
          </button>

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
            className="divider mx-1.5 h-5 w-px shrink-0 bg-[#E8E8E8]"
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
