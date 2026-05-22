"use client";

/**
 * Forklifted from: lib/capture-engine/pill/CapturePill.tsx
 *
 * Visual code is byte-faithful to the source — JSX, className strings, inline
 * style objects, and animation timings are unchanged. Marketing-demo adaptations:
 *
 * Modifications (only):
 * - Removed imports of `computePillPosition`, `useRecordingTimer`, and
 *   `VoiceCaptureError` (positioning is supplied via `pillStyle` prop; the
 *   timer string comes from the demo orchestrator as `elapsedFormatted`).
 * - Removed `safeZone`, `viewport`, `pillPosition`, and `pillStyle` `useMemo`s
 *   (positioning logic is replaced with a single `pillStyle` prop).
 * - Removed the Escape-key `useEffect` (no global keyboard handlers in demo).
 * - Removed `createPortal` (the demo renders the pill inline inside the stage,
 *   not portaled to a capture root).
 * - `onSendVoice`, `onCancel`, `onResetVoice`, `onSendText`, `onRetryVoice`,
 *   `onModeChange`, `onSelectMic` are stubbed (no-op via optional props).
 * - `errorType` short-circuits to null in the demo loop (no voice errors).
 * - `targetElement` becomes a `targetRect` prop consumed by SelectedElementOverlay.
 *
 * Everything visible (JSX tree, className composition, inline styles, the
 * shake class application, the showError branching, child component
 * composition) is unchanged from the source.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VoicePillContent } from "./VoicePillContent";
import { PillErrorContent, type PillErrorType } from "./PillErrorContent";
import { PillHintText, type PillHintState } from "./PillHintText";
import { SelectedElementOverlay } from "./SelectedElementOverlay";

type VoiceCaptureError =
  | null
  | "mic_permission"
  | "site_blocked"
  | "no_audio"
  | "transcription_failed";

const PILL_HEIGHT = 52;
const VOICE_PILL_WIDTH = 360;
const TEXT_PILL_WIDTH = 346;

export interface CapturePillProps {
  /** Static rect for the selected element overlay (demo: anchored to the faux site CTA). */
  targetRect: { top: number; left: number; width: number; height: number } | null;
  /** True while the demo orchestrator is in the "recording" beat. */
  isListening: boolean;
  /** True during the brief send/spinner morph beat. */
  isFinishing: boolean;
  /** Current capture mode — demo loop only uses "voice". */
  mode: "voice" | "text";
  /** Static "00:03" style timer string supplied by the demo orchestrator. */
  elapsedFormatted: string;
  /** Mock bar levels for the forklifted Waveform (sine wave from orchestrator). */
  waveformLevels: number[];
  /** Hint phase passed through to PillHintText. */
  hintPhase?: "listening" | "warning" | "limit_reached";
  /** Voice failure state — demo always null. */
  voiceError?: VoiceCaptureError;
  /** True when the mic permission appears to be permanently blocked. */
  micPermissionBlocked?: boolean;
  /** Inline style for the pill root — drives demo positioning. */
  pillStyle?: React.CSSProperties;
  /** Optional callbacks — wired up but unused in demo. */
  onSendVoice?: () => void;
  onCancel?: () => void;
  onResetVoice?: () => void;
  onSendText?: (text: string) => void;
  onRetryVoice?: () => void;
  onModeChange?: (mode: "voice" | "text") => void;
  onSelectMic?: (deviceId: string) => void;
  selectedMicId?: string;
}

export function CapturePill(props: CapturePillProps) {
  const {
    targetRect,
    isListening: _isListening,
    isFinishing,
    mode,
    elapsedFormatted,
    waveformLevels,
    hintPhase = "listening",
    voiceError = null,
    micPermissionBlocked = false,
    pillStyle: pillStyleProp,
    onSendVoice,
    onCancel,
    onResetVoice,
    onSendText,
    onRetryVoice,
    onModeChange,
    onSelectMic,
    selectedMicId,
  } = props;

  const [textValue, setTextValue] = useState("");
  const [shake, setShake] = useState(false);
  const pillContentRef = useRef<HTMLDivElement>(null);
  const retryAttemptsRef = useRef(0);

  const handleResetVoice = useCallback(() => {
    onResetVoice?.();
  }, [onResetVoice]);

  const rootRef = useRef<HTMLDivElement>(null);

  const pillWidth = mode === "text" ? TEXT_PILL_WIDTH : VOICE_PILL_WIDTH;

  const pillStyle = useMemo<React.CSSProperties>(() => {
    return (
      pillStyleProp ?? {
        position: "absolute",
        top: 0,
        left: 0,
        width: pillWidth,
        height: PILL_HEIGHT,
      }
    );
  }, [pillStyleProp, pillWidth]);

  const handleRetry = useCallback(() => {
    retryAttemptsRef.current += 1;
    if (retryAttemptsRef.current >= 2) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
    }
    onRetryVoice?.();
  }, [onRetryVoice]);

  useEffect(() => {
    if (!voiceError) retryAttemptsRef.current = 0;
  }, [voiceError]);

  const handleSwitchToText = useCallback(() => {
    onModeChange?.("text");
  }, [onModeChange]);

  const handleSwitchToVoice = useCallback(() => {
    setTextValue("");
    onModeChange?.("voice");
  }, [onModeChange]);

  const handleSendText = useCallback(() => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onSendText?.(trimmed);
  }, [textValue, onSendText]);

  /** Map (voiceError, micPermissionBlocked) → PillErrorType for richer UI. */
  const errorType: PillErrorType | null = useMemo(() => {
    if (!voiceError) return null;
    if (voiceError === "site_blocked") return "mic_permission_site_blocked";
    if (voiceError === "mic_permission") {
      return micPermissionBlocked ? "mic_permission_blocked" : "mic_permission_initial";
    }
    if (voiceError === "no_audio") return "no_audio";
    if (voiceError === "transcription_failed") return "transcription_failed";
    return null;
  }, [voiceError, micPermissionBlocked]);

  const hostnameForDisplay = "example.com";

  const hintState: PillHintState = voiceError
    ? "error"
    : mode === "text"
      ? "typing"
      : hintPhase;

  const errorHintMessage = useMemo(() => {
    if (!voiceError) return undefined;
    if (errorType === "mic_permission_site_blocked") return "This site blocks microphone access.";
    if (errorType === "mic_permission_blocked") return "Microphone blocked — change it in browser settings.";
    if (errorType === "mic_permission_initial") return "Allow microphone access to record.";
    if (voiceError === "no_audio") return "We didn't catch any audio — try switching mics or check that your microphone isn't muted.";
    if (voiceError === "transcription_failed") return "Couldn't process that — try again.";
    return undefined;
  }, [voiceError, errorType]);

  const showError = errorType != null && mode === "voice";

  return (
    <>
      <SelectedElementOverlay targetRect={targetRect} />
      <div
        ref={rootRef}
        className="echly-pill-root"
        style={pillStyle}
        data-annote-ui="true"
      >
        {/* Suppress the hint pill when the inline error panel renders its own
            hint/instructions card — otherwise we'd stack two messages. Both
            the blocked-permission and site-blocked panels are self-contained. */}
        {errorType !== "mic_permission_blocked" &&
          errorType !== "mic_permission_site_blocked" && (
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
              onCancel={onCancel ?? (() => {})}
              onSwitchToWrite={handleSwitchToText}
              hostnameForDisplay={hostnameForDisplay}
              onSelectMic={onSelectMic}
              selectedMicId={selectedMicId}
            />
          )}
          {!showError && mode === "voice" && (
            <VoicePillContent
              waveformLevels={waveformLevels}
              elapsedFormatted={elapsedFormatted}
              onCancel={onCancel ?? (() => {})}
              onReset={handleResetVoice}
              onSend={onSendVoice ?? (() => {})}
              onSwitchToTextMode={handleSwitchToText}
              onSelectMic={onSelectMic}
              selectedMicId={selectedMicId}
              isFinishing={isFinishing}
            />
          )}
          {!showError && mode === "text" && (
            <TextPillContentStub
              value={textValue}
              onChange={setTextValue}
              onCancel={onCancel ?? (() => {})}
              onSend={handleSendText}
              onSwitchToVoiceMode={handleSwitchToVoice}
            />
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Minimal text-mode stub — the demo loop never enters text mode so this only
 * needs to satisfy the type system. The real `TextPillContent` requires more
 * forklift work for a code path the loop never visits.
 */
function TextPillContentStub(_props: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
  onSwitchToVoiceMode: () => void;
}) {
  return <div className="echly-pill-content echly-pill-content--text" data-annote-ui="true" />;
}
