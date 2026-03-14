"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Home, Mic, PenLine } from "lucide-react";

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
  /** When true (e.g. extension mode), show Home icon button instead of "Echly" title. */
  showHomeButton?: boolean;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
  /** Current capture mode (voice vs text). When set with onCaptureModeToggle, shows mode toggle in header. */
  captureMode?: "voice" | "text";
  /** Called when user clicks the capture mode toggle. */
  onCaptureModeToggle?: () => void;
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
  showHomeButton = false,
  theme = "dark",
  onThemeToggle,
  captureMode = "voice",
  onCaptureModeToggle,
  handlers,
  onShowCommandScreen,
}: CaptureHeaderProps) {
  const [localTitle, setLocalTitle] = useState(sessionTitle);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTitle(sessionTitle);
  }, [sessionTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveTitle = () => {
    setIsEditing(false);
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
    <div className="echly-sidebar-header echly-session-header">
      <div className="echly-sidebar-header-left">
        {showSessionTitle ? (
          <>
            <div className="echly-session-title-wrapper">
              {isEditing ? (
                <input
                  id="echlyTitleEdit"
                  ref={inputRef}
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="echly-sidebar-title echly-session-title-input session-title-input"
                  aria-label="Session title"
                />
              ) : (
                <span
                  className="echly-sidebar-title echly-session-title-text"
                  onClick={() => setIsEditing(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsEditing(true);
                    }
                  }}
                  aria-label="Session title (click to edit)"
                >
                  {localTitle}
                </span>
              )}
            </div>
            <span className="echly-sidebar-ticket-count">
              {openTicketCount} feedback ticket{openTicketCount !== 1 ? "s" : ""}
            </span>
          </>
        ) : showHomeButton ? (
          <button
            type="button"
            className={`echly-header-home-wrap${theme === "dark" ? " dark" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => {
              window.open("https://echly-web.vercel.app/dashboard", "_blank");
            }}
            aria-label="Open Echly dashboard"
          >
            <div className="header-home-btn">
              <Home size={18} />
            </div>
          </button>
        ) : (
          <>
            <span className="echly-sidebar-title">{title ?? "Echly"}</span>
            {summary && (
              <span className="echly-sidebar-summary">{summary}</span>
            )}
          </>
        )}
      </div>
      <div className="echly-header-actions echly-session-icons">
        {onThemeToggle && (
          <button
            type="button"
            id="theme-toggle"
            onClick={onThemeToggle}
            className="echly-theme-toggle"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        )}
        {onCaptureModeToggle && (
          <button
            type="button"
            className="echly-header-mode-toggle"
            onClick={onCaptureModeToggle}
            title={captureMode === "voice" ? "Switch to text feedback mode" : "Switch to voice feedback mode"}
            aria-label="Toggle capture mode"
          >
            {captureMode === "voice" ? (
              <Mic className="echly-header-icon" size={16} strokeWidth={1.5} />
            ) : (
              <PenLine className="echly-header-icon" size={16} strokeWidth={1.5} />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="echly-sidebar-close"
          title="Minimize feedback panel"
          aria-label="Minimize feedback panel"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
