"use client";

import { UserPlus } from "lucide-react";

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
      className={`inline-flex items-center gap-1.5 h-[34px] px-3.5 text-white text-[13px] font-semibold hover:bg-[var(--brand-hover)] transition-colors cursor-pointer${disabled ? " opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <UserPlus size={15} strokeWidth={2} className="shrink-0" />
      Share
    </button>
  );
}
