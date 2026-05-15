"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VoicePillContent } from "./VoicePillContent";
import { TextPillContent } from "./TextPillContent";
import { PillErrorContent, type PillErrorType } from "./PillErrorContent";
import { PillHintText, type PillHintState } from "./PillHintText";
import { SelectedElementOverlay } from "./SelectedElementOverlay";
import { computePillPosition } from "./pillAnchoring";
import { useRecordingTimer } from "./hooks/useRecordingTimer";
import type { VoiceCaptureError } from "../core/types";

/**
 * Pill dimensions used for positioning math. Each mode is compact at rest and
 * grows leftward on hover — positioning uses the COMPACT width so the anchor
 * math agrees with the at-rest pill and never jumps on first paint. The hover
 * expansion is purely visual: the right edge is anchored via the inline style
 * in `pillStyle`, so widening on hover only moves the left edge — primary
 * action buttons stay put.
 *
 * Voice  = fixed 360px (see `.echly-pill-content` in globals.css).
 * Text   = content-sized; at rest ≈ 346px:
 *            12 (pad-l) + 26 (trash) + 12 (gap) + 240 (input wrap)
 *          + 12 (gap) + 36 (send) + 8 (pad-r).
 */
const PILL_HEIGHT = 52;
const VOICE_PILL_WIDTH = 360;
const TEXT_PILL_WIDTH = 346;

export interface CapturePillProps {
  /** Live reference to the clicked element. Powers the persistent selection outline. */
  targetElement: HTMLElement | null;
  /** AnalyserNode from the active voice pipeline; null while idle/error. */
  analyser: AnalyserNode | null;
  /** True while MediaRecorder is actively recording (state === voice_listening). */
  isListening: boolean;
  /** True during the transcribe/upload phase after onSend. */
  isFinishing: boolean;
  /** Current capture mode (controlled by parent SessionOverlay). */
  mode: "voice" | "text";
  /** Voice failure state from useCaptureWidget. */
  voiceError: VoiceCaptureError;
  /** True when the mic permission appears to be permanently blocked (e.g. denied at OS / chrome:// level). */
  micPermissionBlocked?: boolean;
  /** Finish + transcribe the current recording. */
  onSendVoice: () => void;
  /** Discard the current recording, dismiss the pill. */
  onCancel: () => void;
  /** Reset = discard current audio, start over on same mic. */
  onResetVoice: () => void;
  /** Submit a text feedback string. */
  onSendText: (text: string) => void;
  /** Retry after a voice error (re-asks for permission / restarts). */
  onRetryVoice: () => void;
  /** Switch mode (parent handles MediaRecorder teardown). */
  onModeChange: (mode: "voice" | "text") => void;
  /** Select a microphone deviceId; parent should hot-swap MediaRecorder if recording. */
  onSelectMic?: (deviceId: string) => void;
  /** Currently selected microphone deviceId (for checkmark in picker). */
  selectedMicId?: string;
  /** Open the browser's site settings page (chrome://settings/content/siteDetails?site=...). */
  onOpenSiteSettings?: () => void;
  /** Portal target (shadow root or capture root). */
  portalTarget: HTMLElement | null;
}

export function CapturePill(props: CapturePillProps) {
  const {
    targetElement,
    analyser,
    isListening,
    isFinishing,
    mode,
    voiceError,
    micPermissionBlocked = false,
    onSendVoice,
    onCancel,
    onResetVoice,
    onSendText,
    onRetryVoice,
    onModeChange,
    onSelectMic,
    selectedMicId,
    onOpenSiteSettings,
    portalTarget,
  } = props;

  const [textValue, setTextValue] = useState("");
  const [shake, setShake] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const pillContentRef = useRef<HTMLDivElement>(null);
  const retryAttemptsRef = useRef(0);

  const { elapsedFormatted, phase } = useRecordingTimer(isListening, onSendVoice, timerResetKey);

  const handleResetVoice = useCallback(() => {
    setTimerResetKey((k) => k + 1);
    onResetVoice();
  }, [onResetVoice]);

  /** Track viewport so re-positioning happens on resize. */
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { width: 1024, height: 768 }
      : { width: window.innerWidth, height: window.innerHeight }
  );
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /**
   * Measure the actual size of the right tray + bottom controls from the live
   * DOM. Both are rendered into the page (not the shadow root) and have known
   * class names. If they aren't mounted (no host UI), the safe zone is just
   * the breathing room.
   */
  const safeZone = useMemo(() => {
    if (typeof document === "undefined") {
      return { rightTrayWidth: 0, bottomControlsHeight: 0 };
    }
    const tray = document.querySelector<HTMLElement>(".echly-sidebar-container");
    const bottom = document.querySelector<HTMLElement>(".echly-sc-root");
    let rightTrayWidth = 0;
    if (tray) {
      const r = tray.getBoundingClientRect();
      // Right-edge gap: how much horizontal real-estate the tray steals from the right edge.
      rightTrayWidth = Math.max(0, viewport.width - r.left);
    }
    let bottomControlsHeight = 0;
    if (bottom) {
      const r = bottom.getBoundingClientRect();
      bottomControlsHeight = Math.max(0, viewport.height - r.top);
    }
    return { rightTrayWidth, bottomControlsHeight };
  }, [viewport, targetElement]);

  /**
   * Synchronous positioning. The pill content has a CSS-fixed width (540px,
   * see `.echly-pill-content` in globals.css), so we know its dimensions
   * before mount — no measure-then-position dance required. Position is
   * computed via useMemo in the render path and written inline, so the very
   * first paint lands on the correct spot.
   *
   * Right-edge anchoring: instead of writing `left`, we compute the pill's
   * RIGHT edge in viewport coordinates and anchor via `right`. When the pill
   * widens (hover-revealed icons appear), it grows leftward — primary action
   * buttons (send, reset, trash) stay in their absolute viewport position.
   */
  const rootRef = useRef<HTMLDivElement>(null);

  const pillWidth = mode === "text" ? TEXT_PILL_WIDTH : VOICE_PILL_WIDTH;

  const pillPosition = useMemo(() => {
    const elementRect = targetElement?.getBoundingClientRect() ?? null;
    return computePillPosition({
      elementRect,
      viewport,
      pillSize: { width: pillWidth, height: PILL_HEIGHT },
      rightTrayWidth: safeZone.rightTrayWidth,
      bottomControlsHeight: safeZone.bottomControlsHeight,
    });
  }, [
    targetElement,
    viewport,
    safeZone,
    pillWidth,
  ]);

  /** Convert position output to right-edge anchor for grow-from-left behavior. */
  const pillStyle = useMemo<React.CSSProperties>(() => {
    const visibleRightPx = pillPosition.visibleLeftPx + pillWidth;
    return {
      position: "fixed",
      top: pillPosition.top,
      left: "auto",
      right: `${Math.max(0, viewport.width - visibleRightPx)}px`,
      transform: "none",
    };
  }, [pillPosition, viewport.width, pillWidth]);

  /** Escape always cancels. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  /** Shake after two consecutive retries — signals "this isn't going to work". */
  const handleRetry = useCallback(() => {
    retryAttemptsRef.current += 1;
    if (retryAttemptsRef.current >= 2) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
    onRetryVoice();
  }, [onRetryVoice]);

  useEffect(() => {
    if (!voiceError) retryAttemptsRef.current = 0;
  }, [voiceError]);

  const handleSwitchToText = useCallback(() => {
    onModeChange("text");
  }, [onModeChange]);

  const handleSwitchToVoice = useCallback(() => {
    setTextValue("");
    onModeChange("voice");
  }, [onModeChange]);

  const handleSendText = useCallback(() => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onSendText(trimmed);
  }, [textValue, onSendText]);

  /** Map (voiceError, micPermissionBlocked) → PillErrorType for richer UI. */
  const errorType: PillErrorType | null = useMemo(() => {
    if (!voiceError) return null;
    if (voiceError === "mic_permission") {
      return micPermissionBlocked ? "mic_permission_blocked" : "mic_permission_initial";
    }
    if (voiceError === "no_audio") return "no_audio";
    if (voiceError === "transcription_failed") return "transcription_failed";
    return null;
  }, [voiceError, micPermissionBlocked]);

  const hintState: PillHintState = voiceError
    ? "error"
    : mode === "text"
      ? "typing"
      : phase;

  const errorHintMessage = useMemo(() => {
    if (!voiceError) return undefined;
    if (errorType === "mic_permission_blocked") return "Microphone blocked — change it in browser settings.";
    if (errorType === "mic_permission_initial") return "Allow microphone access to record.";
    if (voiceError === "no_audio") return "We didn't detect any sound.";
    if (voiceError === "transcription_failed") return "Couldn't process that — try again.";
    return undefined;
  }, [voiceError, errorType]);

  if (!portalTarget) return null;

  const showError = errorType != null && mode === "voice";

  const content = (
    <>
      <SelectedElementOverlay targetElement={targetElement} />
      <div
        ref={rootRef}
        className="echly-pill-root"
        style={pillStyle}
        data-echly-ui="true"
      >
        {/* Suppress the hint pill when the inline blocked-permission error
            renders its own hint-below — otherwise we'd show two
            "Microphone blocked" messages stacked. */}
        {errorType !== "mic_permission_blocked" && (
          <PillHintText state={hintState} mode={mode} errorMessage={errorHintMessage} />
        )}
        <div
          ref={pillContentRef}
          className={shake ? "echly-pill-content--shake" : undefined}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          {showError && errorType && (
            <PillErrorContent
              type={errorType}
              onRetry={handleRetry}
              onCancel={onCancel}
              onOpenSettings={onOpenSiteSettings}
            />
          )}
          {!showError && mode === "voice" && (
            <VoicePillContent
              analyser={analyser}
              elapsedFormatted={elapsedFormatted}
              onCancel={onCancel}
              onReset={handleResetVoice}
              onSend={onSendVoice}
              onSwitchToTextMode={handleSwitchToText}
              onSelectMic={onSelectMic}
              selectedMicId={selectedMicId}
              isFinishing={isFinishing}
            />
          )}
          {!showError && mode === "text" && (
            <TextPillContent
              value={textValue}
              onChange={setTextValue}
              onCancel={onCancel}
              onSend={handleSendText}
              onSwitchToVoiceMode={handleSwitchToVoice}
            />
          )}
        </div>
      </div>
    </>
  );

  return createPortal(content, portalTarget);
}
