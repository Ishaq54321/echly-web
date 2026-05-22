/**
 * SessionTopBar — the Share/Copy pill + presence row, extracted from
 * components/ui/TopControlBar.tsx (the right-side action cluster, lines 221-265).
 *
 * Modifications from source:
 * - Extracted ONLY the PresenceAvatarRow + the merged brand-purple Share/Copy
 *   pill. The full TopControlBar (logo, nav toggle, search box, SessionActions
 *   dropdown, notifications, profile) is NOT forklifted — it's app-shell chrome
 *   coupled to useWorkspace/useShareController/SessionActionsDropdown.
 * - The pill markup (flex, brand bg, inset+drop shadow, Share button with
 *   UserPlus, 1.5px divider, Copy button toggling Check/LinkIcon) is verbatim.
 * - useShareController.copyCurrentLink → copies the demo share URL and toggles
 *   the Check icon for 2000ms (TopControlBar.tsx:129), same timing.
 * - Share button opens the forklifted ShareModal (via onShareClick prop).
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon, UserPlus } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { PresenceAvatarRow } from "./PresenceAvatarRow";
import { MOCK_SESSION } from "./sessionMockData";

export function SessionTopBar({ onShareClick }: { onShareClick: () => void }) {
  const copyTimerRef = useRef<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyCurrentLink = useCallback(() => {
    try {
      void navigator.clipboard?.writeText(`https://${MOCK_SESSION.shareUrl}`);
    } catch {
      /* clipboard may be unavailable; the visual still plays */
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
    <div className="flex items-center gap-4 justify-end">
      <PresenceAvatarRow viewers={MOCK_SESSION.viewers} />
      {/* Share + Copy link merged pill */}
      <div className="relative">
        <div className="flex items-center bg-[var(--brand)] rounded-[var(--radius-btn)] shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(90,73,191,0.3)] overflow-hidden hover:bg-[var(--brand-hover)] transition-colors">
          <button
            type="button"
            onClick={onShareClick}
            className="flex items-center gap-1.5 h-[34px] px-3.5 text-white text-[13px] font-semibold tracking-[-0.005em] border-0 bg-transparent cursor-pointer"
          >
            <UserPlus size={14} strokeWidth={2} />
            Share
          </button>
          <div className="w-[1.5px] self-stretch bg-white/50" />
          <Tooltip content="Copy link">
            <button
              type="button"
              onClick={copyCurrentLink}
              className="flex items-center justify-center h-[34px] w-[36px] text-white border-0 bg-transparent cursor-pointer hover:bg-white/10 transition-colors"
            >
              {linkCopied ? <Check size={14} strokeWidth={2} /> : <LinkIcon size={14} strokeWidth={2} />}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
