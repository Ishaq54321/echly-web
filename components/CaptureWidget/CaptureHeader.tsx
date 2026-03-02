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
  /** When true, shows soft animated pulse around Echly header (processing-structure phase). */
  isProcessingStructure?: boolean;
};

export default function CaptureHeader({
  onStartDrag,
  onShare,
  onMoreClick,
  onClose,
  showMenu,
  onResetSession,
  menuRef,
  isProcessingStructure = false,
}: CaptureHeaderProps) {
  return (
    <div
      onMouseDown={onStartDrag}
      className="px-6 py-4 flex justify-between items-center
                 bg-[rgba(0,0,0,0.03)] border-b border-[rgba(0,0,0,0.06)]
                 cursor-move"
    >
      <div
        className={`flex items-center gap-2 min-h-8 ${isProcessingStructure ? "capture-header-pulse" : ""}`}
      >
        <Image src="/Echly_logo.svg" alt="Echly" width={24} height={24} className="shrink-0" />
        <span className="text-base font-semibold text-slate-900 leading-none">Echly</span>
      </div>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-2 h-8 px-2 rounded-md text-sm font-medium text-slate-600 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
        >
          <Share2 size={16} strokeWidth={1.5} className="shrink-0 text-neutral-500" />
          Share
        </button>

        <button
          type="button"
          onClick={onMoreClick}
          className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
        >
          <MoreVertical size={18} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-accent transition-colors duration-120 cursor-pointer"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {showMenu && (
          <div className="dropdown-enter absolute right-0 top-12
                              bg-white border border-slate-200
                              rounded-lg shadow-md w-56 py-2">
            <button
              type="button"
              onClick={onResetSession}
              className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 text-brand-accent transition-colors duration-120 cursor-pointer"
            >
              Reset Feedback Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
