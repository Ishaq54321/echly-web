"use client";

import { X } from "lucide-react";

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

type CaptureHeaderProps = {
  onClose: () => void;
  summary?: string | null;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  handlers?: {
    endSession?: () => void;
    clearPointers?: () => void;
  };
  onShowCommandScreen?: () => void;
};

export default function CaptureHeader({
  onClose,
  summary = null,
  theme = "dark",
  onThemeToggle,
  handlers,
  onShowCommandScreen,
}: CaptureHeaderProps) {
  const handleClose = () => {
    handlers?.endSession?.();
    handlers?.clearPointers?.();
    onShowCommandScreen?.();
    onClose();
  };

  return (
    <div className="echly-sidebar-header">
      <div className="echly-sidebar-header-left">
        <span className="echly-sidebar-title">Echly</span>
        {summary && (
          <span className="echly-sidebar-summary">{summary}</span>
        )}
      </div>
      <div className="echly-header-actions">
        {onThemeToggle && (
          <button
            type="button"
            id="theme-toggle"
            onClick={onThemeToggle}
            className="echly-theme-toggle"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        )}
        <button
          type="button"
          onClick={handleClose}
          className="echly-sidebar-close"
          aria-label="Close"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
