"use client";

import React from "react";

/** Minimal orbit-style illustration: thin lines, Echly brand color. */
function SessionLimitIllustration() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="echly-limit-illustration"
      aria-hidden
    >
      {/* Outer orbit */}
      <ellipse
        cx="48"
        cy="48"
        rx="40"
        ry="40"
        fill="none"
        stroke="#1775E0"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Inner orbit */}
      <ellipse
        cx="48"
        cy="48"
        rx="26"
        ry="26"
        fill="none"
        stroke="#1775E0"
        strokeWidth="1"
        strokeOpacity="0.25"
      />
      {/* Center dot */}
      <circle cx="48" cy="48" r="2" fill="#1775E0" fillOpacity="0.8" />
      {/* Orbiting dot */}
      <circle cx="88" cy="48" r="2" fill="#1775E0" fillOpacity="0.9" />
    </svg>
  );
}

export type SessionLimitReachedViewProps = {
  /** Optional session cap from plan (e.g. 3). When set, description shows "up to {maxSessions} sessions". */
  maxSessions?: number;
  /** Fallback message when maxSessions not provided (legacy). */
  message?: string;
  onUpgrade: () => void;
  /** Opens dashboard/sessions so user can delete old sessions. */
  onDeleteOldSessions?: () => void;
  onClose?: () => void;
  theme?: "dark" | "light";
};

/** Try to extract a session limit number from backend message (e.g. "up to 3 sessions" or "maximum of 5"). */
function parseSessionLimitFromMessage(message: string | undefined): number | undefined {
  if (!message || typeof message !== "string") return undefined;
  const match = message.match(/(\d+)\s*session|maximum\s*(?:of\s*)?(\d+)|limit\s*(?:of\s*)?(\d+)/i);
  if (match) {
    const n = parseInt(match[1] ?? match[2] ?? match[3] ?? "", 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function SessionLimitReachedView({
  maxSessions: maxSessionsProp,
  message,
  onUpgrade,
  onDeleteOldSessions,
  theme = "dark",
}: SessionLimitReachedViewProps) {
  const maxSessions = maxSessionsProp ?? parseSessionLimitFromMessage(message);
  const limitLine =
    maxSessions != null
      ? `Your current plan allows up to ${maxSessions} session${maxSessions === 1 ? "" : "s"}.`
      : message ?? "Your current plan has a session limit.";

  return (
    <div className="echly-limit-reached-view" data-theme={theme}>
      <div className="echly-limit-reached-illustration-wrap">
        <SessionLimitIllustration />
      </div>
      <h2 className="echly-limit-reached-title">You&apos;ve reached your session limit</h2>
      <p className="echly-limit-reached-description">
        {limitLine}
        <br />
        Upgrade your plan to keep capturing feedback, or delete older sessions to free up space.
      </p>
      <button
        type="button"
        className="echly-limit-reached-upgrade-btn"
        onClick={onUpgrade}
        aria-label="Upgrade plan"
      >
        Upgrade Plan
      </button>
      {onDeleteOldSessions && (
        <button
          type="button"
          className="echly-limit-reached-secondary-link"
          onClick={onDeleteOldSessions}
          aria-label="Delete old sessions"
        >
          Delete old sessions
        </button>
      )}
    </div>
  );
}
