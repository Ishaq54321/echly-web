"use client";

import Image from "next/image";
import { Share2, MoreVertical, X } from "lucide-react";

type CaptureHeaderProps = {
  onStartDrag: (e: React.MouseEvent) => void;
  onShare: () => void;
  onMoreClick: () => void;
  onClose: () => void;
  showMenu: boolean;
  onResetSession: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

export default function CaptureHeader({
  onStartDrag,
  onShare,
  onMoreClick,
  onClose,
  showMenu,
  onResetSession,
  menuRef,
}: CaptureHeaderProps) {
  return (
    <div
      onMouseDown={onStartDrag}
      className="px-6 py-4 flex justify-between items-center
                 bg-[rgba(0,0,0,0.03)] border-b border-[rgba(0,0,0,0.06)]
                 cursor-move"
    >
      <div className="flex items-center gap-2 min-h-8">
        <Image src="/Echly_logo.svg" alt="Echly" width={24} height={24} className="shrink-0" />
        <span className="text-base font-semibold text-slate-900 leading-none">Echly</span>
      </div>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-2 h-8 px-2 rounded-sm
                         text-sm font-medium text-slate-600
                         hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        >
          <Share2 size={14} strokeWidth={2} className="shrink-0" />
          Share
        </button>

        <button
          type="button"
          onClick={onMoreClick}
          className="flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        >
          <MoreVertical size={18} strokeWidth={2} className="text-slate-500" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-sm hover:bg-[rgba(0,0,0,0.04)] transition-colors duration-[120ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        >
          <X size={18} strokeWidth={2} className="text-slate-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-12
                              bg-white border border-slate-200
                              rounded-lg shadow-md w-56 py-2">
            <button
              onClick={onResetSession}
              className="w-full text-left px-4 py-2 text-sm
                             hover:bg-slate-50 text-rose-600 transition"
            >
              Reset Feedback Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
