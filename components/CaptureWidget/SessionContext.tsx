"use client";

import React from "react";

export type SessionContextProps = {
  /** Optional session label (e.g. "Homepage Redesign"). When absent, shows generic label. */
  sessionLabel?: string | null;
};

export function SessionContext({ sessionLabel }: SessionContextProps) {
  const label = sessionLabel && sessionLabel.trim() ? sessionLabel : "Feedback session";
  return (
    <div className="echly-session-context">
      Session: {label}
    </div>
  );
}
