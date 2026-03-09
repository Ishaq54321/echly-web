"use client";

import React, { useState, useRef, useEffect } from "react";
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
  /** When true, show editable session title + ticket count. Otherwise show "Echly" and optional summary. */
  showSessionTitle?: boolean;
  /** Session title (e.g. "Untitled Session"). Used when showSessionTitle is true. */
  sessionTitle?: string;
  /** Called when user saves the session title (blur or Enter). */
  onSessionTitleChange?: (title: string) => void;
  /** Open ticket count; shown as subtext when showSessionTitle. */
  openTicketCount?: number;
  /** Legacy: when set and not showSessionTitle, used as main header title. Otherwise "Echly". */
  title?: string | null;
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
  showSessionTitle = false,
  sessionTitle = "Untitled Session",
  onSessionTitleChange,
  openTicketCount = 0,
  title = null,
  summary = null,
  theme = "dark",
  onThemeToggle,
  handlers,
  onShowCommandScreen,
}: CaptureHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(sessionTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTitle(sessionTitle);
  }, [sessionTitle]);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTitle]);

  const saveTitle = () => {
    setEditingTitle(false);
    const trimmed = localTitle.trim() || "Untitled Session";
    setLocalTitle(trimmed);
    onSessionTitleChange?.(trimmed);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    }
  };

  return (
    <div className="echly-sidebar-header">
      <div className="echly-sidebar-header-left">
        {showSessionTitle ? (
          <>
            {editingTitle ? (
              <input
                id="echlyTitleEdit"
                ref={inputRef}
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                className="echly-sidebar-title session-title-input"
                aria-label="Session title"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="echly-sidebar-title echly-sidebar-title-button"
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {localTitle}
              </button>
            )}
            <span className="echly-sidebar-ticket-count">
              {openTicketCount} feedback ticket{openTicketCount !== 1 ? "s" : ""}
            </span>
          </>
        ) : (
          <>
            <span className="echly-sidebar-title">{title ?? "Echly"}</span>
            {summary && (
              <span className="echly-sidebar-summary">{summary}</span>
            )}
          </>
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
          onClick={onClose}
          className="echly-sidebar-close"
          aria-label="Minimize"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
