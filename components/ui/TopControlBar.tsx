"use client";

import Link from "next/link";
import { Check, Link as LinkIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
}) {
  const { authUid, isIdentityResolved } = useWorkspace();
  const copyTimerRef = useRef<number | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkCopyBusy, setLinkCopyBusy] = useState(false);

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
            href={`/login?next=${encodeURIComponent(`/session/${sessionId}`)}`}
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

          {session ? (
            <div
              className="relative shrink-0"
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
            className="divider mx-1.5 h-5 w-px shrink-0 bg-[#E5E7EB]"
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
