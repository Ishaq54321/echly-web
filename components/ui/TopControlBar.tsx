"use client";

import { Check, Link as LinkIcon, MoreHorizontal, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShareModal } from "@/components/share/ShareModal";
import { GlobalSearchButton } from "@/components/layout/GlobalSearchButton";
import { GlobalNotificationButton } from "@/components/layout/GlobalNotificationButton";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

export function TopControlBar({
  sessionId,
  sessionTitle,
}: {
  sessionId: string;
  sessionTitle?: string;
}) {
  const copyTimerRef = useRef<number | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyCurrentLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard?.writeText?.(url);
    } catch {
      // Clipboard may be blocked; still show inline feedback.
    }
    setLinkCopied(true);
    if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setLinkCopied(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <>
      <div className="page-header sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-end gap-4 bg-[var(--layer-1-bg)] px-6">
        <div className="right flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            className="primary-btn"
            aria-label="Share"
            onClick={() => {
              setNotificationsOpen(false);
              setShareOpen(true);
            }}
          >
            <UserPlus size={20} strokeWidth={2} />
            Share
          </button>

          <button
            type="button"
            className={`icon-btn copy-link-btn ${linkCopied ? "copy-link-btn--copied" : ""}`}
            aria-label={linkCopied ? "Copied" : "Copy link"}
            onClick={copyCurrentLink}
          >
            {linkCopied ? (
              <>
                <Check size={18} strokeWidth={2.5} aria-hidden />
                <span className="copy-link-label">Copied</span>
              </>
            ) : (
              <LinkIcon size={20} strokeWidth={2} aria-hidden />
            )}
          </button>

          <button type="button" className="icon-btn" aria-label="More">
            <MoreHorizontal size={20} strokeWidth={2} />
          </button>

          <span
            className="divider mx-1.5 h-5 w-px shrink-0 bg-[#E5E7EB]"
            aria-hidden
          />

          <GlobalSearchButton
            onBeforeOpen={() => {
              setShareOpen(false);
              setNotificationsOpen(false);
            }}
          />
          <GlobalNotificationButton
            open={notificationsOpen}
            onOpenChange={(next) => {
              if (next) setShareOpen(false);
              setNotificationsOpen(next);
            }}
          />
          <ProfileDropdown />
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        sessionId={sessionId}
        sessionTitle={sessionTitle}
      />
    </>
  );
}
