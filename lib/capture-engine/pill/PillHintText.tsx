"use client";

import React, { useEffect, useState } from "react";

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

const SESSION_KEY_PREFIX = "annote:hint-shown:";
const AUTO_DISMISS_MS = 4000;
const FADE_OUT_BEFORE_MS = 300;

/**
 * Per-session "show once" tracker for the default-state hint pills
 * ("We're listening", "What's the feedback?"). Uses sessionStorage so the
 * suppression survives pill re-mounts within the same browser session but
 * clears when the tab closes — mirroring the user experience of the
 * "Click anywhere to capture" tooltip (which is ref-tracked per session in
 * SessionOverlay).
 *
 * Warning / limit_reached / error states are functional alerts and are NOT
 * suppressed by this tracker — they always render.
 */
function readSessionShown(key: string): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markSessionShown(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode / disabled storage — ignore, hint just shows again next time */
  }
}

export function PillHintText({ state, mode, errorMessage }: PillHintTextProps) {
  // Default-state hints (listening / typing) are session-suppressed; functional
  // alerts (warning / limit_reached / error) always show.
  const isDefaultHint = state === "listening" || state === "typing";
  const sessionKey =
    state === "listening"
      ? SESSION_KEY_PREFIX + "voice-listening"
      : state === "typing"
        ? SESSION_KEY_PREFIX + "text-typing"
        : null;

  const [visible, setVisible] = useState<boolean>(() => {
    if (!isDefaultHint) return true;
    if (!sessionKey) return true;
    return !readSessionShown(sessionKey);
  });
  const [dismissing, setDismissing] = useState(false);

  // Re-evaluate visibility when state/mode flips between functional alert and default.
  useEffect(() => {
    if (!isDefaultHint) {
      setVisible(true);
      setDismissing(false);
      return;
    }
    if (!sessionKey) return;
    const alreadyShown = readSessionShown(sessionKey);
    setVisible(!alreadyShown);
    setDismissing(false);
  }, [isDefaultHint, sessionKey]);

  // Auto-dismiss the default-state hint after AUTO_DISMISS_MS, with a brief
  // fade-out before removal. Marks the session key so the hint won't reappear
  // when the pill re-mounts on the next capture.
  useEffect(() => {
    if (!isDefaultHint || !visible || !sessionKey) return;
    const fadeTimer = window.setTimeout(
      () => setDismissing(true),
      AUTO_DISMISS_MS - FADE_OUT_BEFORE_MS,
    );
    const removeTimer = window.setTimeout(() => {
      markSessionShown(sessionKey);
      setVisible(false);
    }, AUTO_DISMISS_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isDefaultHint, visible, sessionKey]);

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

  if (isDefaultHint && !visible) return null;

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
