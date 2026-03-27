"use client";

import { Check, Link as LinkIcon, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function PublicShareTopBar({ shareUrl }: { shareUrl: string }) {
  const copyTimerRef = useRef<number | null>(null);
  const inviteTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(false);
  const [copyBusy, setCopyBusy] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);

  const doCopy = useCallback(async () => {
    if (copyBusy || !shareUrl) return;
    setCopyBusy(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setCopyBusy(false);
    }
  }, [copyBusy, shareUrl]);

  const onShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: shareUrl, title: document.title });
        return;
      }
    } catch {
      /* user cancelled or share failed */
    }
    await doCopy();
  }, [shareUrl, doCopy]);

  const onInvite = useCallback(async () => {
    if (inviteBusy || !shareUrl) return;
    setInviteBusy(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setInvited(true);
      if (inviteTimerRef.current != null) window.clearTimeout(inviteTimerRef.current);
      inviteTimerRef.current = window.setTimeout(() => setInvited(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setInviteBusy(false);
    }
  }, [inviteBusy, shareUrl]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current != null) window.clearTimeout(copyTimerRef.current);
      if (inviteTimerRef.current != null) window.clearTimeout(inviteTimerRef.current);
    };
  }, []);

  return (
    <div className="page-header sticky top-0 z-50 flex h-[68px] w-full shrink-0 items-center justify-end gap-2.5 bg-[var(--layer-1-bg)] px-4 sm:px-6 border-b border-[#EEF2F6]">
      <a
        href="/signup"
        className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-[#4B5563] transition-colors hover:bg-[#F4F6F8] hover:text-[#111827]"
      >
        Try Echly
      </a>
      <button
        type="button"
        onClick={() => void onInvite()}
        disabled={inviteBusy}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
          invited
            ? "border-[#D7E8FF] bg-[#EEF5FF] text-[#1D4ED8]"
            : "border-[#E8EDF3] bg-[#F8FAFC] text-[#4B5563] hover:bg-[#F1F5F9] hover:text-[#111827]"
        }`}
      >
        {invited ? <Check size={15} strokeWidth={2.2} aria-hidden /> : <UserPlus size={15} strokeWidth={2} aria-hidden />}
        {invited ? "Link copied" : "Invite people"}
      </button>
      <button
        type="button"
        className="primary-btn"
        aria-label="Share"
        onClick={() => {
          void onShare();
        }}
      >
        Share
      </button>
      <button
        type="button"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8EDF3] bg-white text-[#4B5563] transition-all duration-200 hover:bg-[#F4F6F8] hover:text-[#111827] ${copied ? "border-[#D7E8FF] bg-[#EEF5FF] text-[#1D4ED8]" : ""}`}
        aria-label={copyBusy ? "Copying…" : copied ? "Copied" : "Copy link"}
        disabled={copyBusy}
        onClick={() => void doCopy()}
      >
        {copied ? (
          <Check size={18} strokeWidth={2.5} aria-hidden />
        ) : (
          <LinkIcon size={18} strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
