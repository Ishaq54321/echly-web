"use client";

/**
 * Forklifted from: lib/capture-engine/pill/PillHintText.tsx
 *
 * Visual code is byte-faithful to the source — JSX, className strings,
 * copy strings, and aria-* attributes are unchanged.
 *
 * Modifications (only):
 * - Removed the `sessionStorage` "show once" tracker (the demo always shows
 *   the hint; the per-session suppression is real-production behavior that
 *   doesn't apply to a looping marketing demo).
 * - Removed the auto-dismiss timers (`AUTO_DISMISS_MS`, `FADE_OUT_BEFORE_MS`).
 *   In the demo, the orchestrator controls visibility timing externally by
 *   conditionally rendering this component.
 * - Removed `readSessionShown` / `markSessionShown` helpers.
 *
 * Every visible element (hint container, pulse dot, primary + secondary
 * copy spans, dismissing class application) is unchanged from the source.
 */

import React from "react";

export type PillHintState =
  | "listening"
  | "warning"
  | "limit_reached"
  | "error"
  | "typing";

export type PillHintMode = "voice" | "text";

interface PillHintTextProps {
  state: PillHintState;
  mode: PillHintMode;
  errorMessage?: string;
  /** Demo-only — when true, applies the dismissing class without timer. */
  dismissing?: boolean;
}

type HintEntry = { primary: string; secondary?: string };

const VOICE_COPY: Record<Exclude<PillHintState, "error" | "typing">, HintEntry> = {
  listening: {
    primary: "We're listening",
    secondary: "· just speak naturally",
  },
  warning: {
    primary: "Long recording",
    secondary: "· wrap up or capture another element",
  },
  limit_reached: {
    primary: "Maximum length reached",
    secondary: "· sending now",
  },
};

const TEXT_COPY: Record<"typing", HintEntry> = {
  typing: {
    primary: "What's the feedback?",
    secondary: "· press Enter to send",
  },
};

export function PillHintText({ state, mode, errorMessage, dismissing = false }: PillHintTextProps) {
  if (state === "error") {
    return (
      <div
        className="echly-pill-hint echly-pill-hint--dark echly-pill-hint--error"
        role="status"
        aria-live="polite"
      >
        <span className="echly-pill-hint-primary">{errorMessage ?? "Something went wrong"}</span>
      </div>
    );
  }

  const dismissingClass = dismissing ? " echly-pill-hint--dismissing" : "";

  if (mode === "text") {
    const copy = TEXT_COPY.typing;
    return (
      <div
        className={`echly-pill-hint echly-pill-hint--dark${dismissingClass}`}
        role="status"
        aria-live="polite"
      >
        <span className="echly-pill-hint-primary">{copy.primary}</span>
        {copy.secondary && (
          <span className="echly-pill-hint-secondary">{copy.secondary}</span>
        )}
      </div>
    );
  }

  // voice mode — keep the red heartbeat pulse
  const voiceState = state === "typing" ? "listening" : state;
  const copy = VOICE_COPY[voiceState];
  return (
    <div
      className={`echly-pill-hint echly-pill-hint--dark${dismissingClass}`}
      role="status"
      aria-live="polite"
    >
      <span className="echly-pill-hint-pulse" aria-hidden="true" />
      <span className="echly-pill-hint-primary">{copy.primary}</span>
      {copy.secondary && (
        <span className="echly-pill-hint-secondary">{copy.secondary}</span>
      )}
    </div>
  );
}
