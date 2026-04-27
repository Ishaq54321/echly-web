"use client";

import { Upload } from "lucide-react";

export function ShareButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-[7px] h-[34px] px-3.5 rounded-[9px] bg-[var(--brand)] text-white text-[13px] font-semibold tracking-[-0.005em] border-0 cursor-pointer shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(23,117,224,0.3)] hover:bg-[var(--brand-hover)] transition-colors${disabled ? ' opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <Upload size={13} strokeWidth={1.6} />
      Share
    </button>
  );
}
