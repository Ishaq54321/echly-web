"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { attachElementHighlighter, detachElementHighlighter } from "./session/elementHighlighter";
import { attachClickCapture, detachClickCapture } from "./session/clickCapture";
import { SessionControlPanel } from "./SessionControlPanel";
import { VoiceCapturePanel } from "./VoiceCapturePanel";
import { TextFeedbackPanel } from "./TextFeedbackPanel";
import type { CaptureContext, SessionFeedbackPending, VoiceCaptureError } from "@/lib/capture-engine/core/types";

function createCommentCursor() {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">`,
    `<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
    `</svg>`,
  ].join("");
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 6 6, auto`;
}

const COMMENT_CURSOR = createCommentCursor();

/** Derive a short readable selector from a full domPath (e.g. "div#hero > button.cta" → "#cta"). */
function shortSelector(domPath: string | null | undefined): string | undefined {
  if (!domPath) return undefined;
  const parts = domPath.split(" > ");
  const last = parts[parts.length - 1] || "";
  const idMatch = last.match(/#[a-zA-Z0-9_-]+/);
  if (idMatch) return idMatch[0];
  const classMatch = last.match(/\.[a-zA-Z0-9_-]+/);
  if (classMatch) return classMatch[0];
  const tagMatch = last.match(/^[a-zA-Z0-9]+/);
  return tagMatch ? tagMatch[0] : undefined;
}

export type SessionOverlayProps = {
  captureRoot: HTMLDivElement;
  sessionMode: boolean;
  sessionPaused: boolean;
  pausePending?: boolean;
  endPending?: boolean;
  isFinishing?: boolean;
  sessionFeedbackPending: SessionFeedbackPending | null;
  state: string;
  onElementClicked: (element: Element) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onRecordVoice: () => void;
  onDoneVoice: () => void;
  onSaveText: (transcript: string) => void;
  onCancel?: () => void;
  captureMode?: "voice" | "text";
  listeningAudioLevel?: number;
  audioAnalyser?: AnalyserNode | null;
  voiceError?: VoiceCaptureError;
  onRetryVoice?: () => void;
  onResetVoice?: () => void;
  onSelectMicrophone?: (deviceId: string) => void;
  voiceMicDeviceId?: string;
  theme?: "light" | "dark";
  __extensionSavingState?: boolean;
  onModeChange?: (mode: "voice" | "text") => void;
};

/**
 * Renders session UI into capture root and attaches highlighter + click capture.
 * When sessionMode and !sessionPaused, hover and click are active; when sessionFeedbackPending
 * is set, click capture is effectively disabled (popup is on top and has data-echly-ui).
 */
export function SessionOverlay({
  captureRoot,
  sessionMode,
  sessionPaused,
  pausePending = false,
  endPending = false,
  isFinishing = false,
  sessionFeedbackPending,
  state,
  onElementClicked,
  onPause,
  onResume,
  onEnd,
  onRecordVoice,
  onDoneVoice,
  onSaveText,
  onCancel,
  captureMode = "voice",
  listeningAudioLevel = 0,
  audioAnalyser = null,
  voiceError = null,
  onRetryVoice,
  onResetVoice,
  onSelectMicrophone,
  voiceMicDeviceId = "",
  theme = "dark",
  __extensionSavingState,
  onModeChange,
}: SessionOverlayProps) {
  const cleanupRef = useRef<(() => void)[]>([]);
  const voiceStartedForPendingRef = useRef(false);
  const sessionActionPending = pausePending || endPending;
  const sessionCursorActive = sessionMode && !sessionPaused && !sessionActionPending;

  /**
   * Local captureMode override: when the user switches from text → voice inside the panel,
   * we flip to "voice" locally without needing to change the external captureMode prop.
   * Resets whenever sessionFeedbackPending clears.
   */
  const [overrideCaptureMode, setOverrideCaptureMode] = useState<"voice" | "text" | null>(null);
  const effectiveCaptureMode = overrideCaptureMode ?? captureMode;

  useEffect(() => {
    if (!sessionFeedbackPending) setOverrideCaptureMode(null);
  }, [sessionFeedbackPending]);

  /** Switch from text panel to voice panel while keeping the same pending feedback. */
  const handleSwitchToVoice = useCallback(() => {
    setOverrideCaptureMode("voice");
    onModeChange?.("voice");
    if (!voiceStartedForPendingRef.current) {
      voiceStartedForPendingRef.current = true;
      onRecordVoice();
    }
  }, [onRecordVoice, onModeChange]);

  /** Switch from voice panel to text panel while keeping the same pending feedback. */
  const handleSwitchToText = useCallback(() => {
    setOverrideCaptureMode("text");
    onModeChange?.("text");
  }, [onModeChange]);

  useEffect(() => {
    if (!sessionMode || !captureRoot) return;
    const getActive = () =>
      sessionMode &&
      !sessionPaused &&
      !sessionActionPending &&
      sessionFeedbackPending == null;
    cleanupRef.current.push(
      attachElementHighlighter(captureRoot, { getActive })
    );
    cleanupRef.current.push(
      attachClickCapture(captureRoot, {
        enabled: getActive,
        onElementClicked,
      })
    );
    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
      detachElementHighlighter();
      detachClickCapture();
    };
  }, [
    sessionMode,
    captureRoot,
    sessionPaused,
    sessionActionPending,
    sessionFeedbackPending,
    onElementClicked,
  ]);

  /* Keep feedback cursor scoped to active session capture mode. */
  useEffect(() => {
    if (!captureRoot?.isConnected) return;
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = sessionCursorActive ? COMMENT_CURSOR : "";
    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [sessionCursorActive, captureRoot]);

  /* When captureMode is voice and we have pending feedback, start voice recording immediately (once). */
  useEffect(() => {
    if (!sessionFeedbackPending || captureMode !== "voice" || voiceStartedForPendingRef.current) return;
    voiceStartedForPendingRef.current = true;
    onRecordVoice();
  }, [sessionFeedbackPending, captureMode, onRecordVoice]);

  useEffect(() => {
    if (!sessionFeedbackPending) voiceStartedForPendingRef.current = false;
  }, [sessionFeedbackPending]);

  if (!sessionMode || !captureRoot) return null;

  const saving = Boolean(__extensionSavingState);

  /* Derive element selector + dimensions for the screenshot badge. */
  const elemSelector = sessionFeedbackPending
    ? shortSelector(sessionFeedbackPending.context?.domPath)
    : undefined;
  const elemWidth = sessionFeedbackPending?.elementRect?.width
    ? Math.round(sessionFeedbackPending.elementRect.width)
    : undefined;
  const elemHeight = sessionFeedbackPending?.elementRect?.height
    ? Math.round(sessionFeedbackPending.elementRect.height)
    : undefined;

  const content = (
    <>
      {sessionFeedbackPending && (
        <div
          className="echly-dim-layer echly-dim-layer--visible"
          aria-hidden
        />
      )}
      <div
        aria-hidden
        className="echly-session-overlay-cursor"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2147483645,
          cursor: sessionCursorActive ? COMMENT_CURSOR : "default",
        }}
      />
      <SessionControlPanel
        sessionPaused={sessionPaused}
        pausePending={pausePending}
        endPending={endPending}
        __extensionSavingState={saving}
        onPause={onPause}
        onResume={onResume}
        onEnd={onEnd}
      />
      {sessionFeedbackPending && effectiveCaptureMode === "voice" && (
        <VoiceCapturePanel
          captureRoot={captureRoot}
          screenshot={sessionFeedbackPending.screenshot ?? undefined}
          audioLevel={listeningAudioLevel}
          isListening={state === "voice_listening" && !isFinishing && !voiceError}
          isFinishing={isFinishing}
          onFinish={onDoneVoice}
          onCancel={onCancel}
          analyser={!isFinishing && !voiceError ? (audioAnalyser ?? null) : null}
          voiceError={voiceError}
          onRetryVoice={onRetryVoice}
          onResetVoice={onResetVoice}
          onSelectMicrophone={onSelectMicrophone}
          voiceMicDeviceId={voiceMicDeviceId}
          elementSelector={elemSelector}
          elementWidth={elemWidth}
          elementHeight={elemHeight}
          onSwitchToText={handleSwitchToText}
        />
      )}
      {sessionFeedbackPending && effectiveCaptureMode === "text" && (
        <TextFeedbackPanel
          screenshot={sessionFeedbackPending.screenshot ?? undefined}
          onSubmit={onSaveText}
          onCancel={onCancel}
          theme={theme}
          onSwitchToVoice={handleSwitchToVoice}
          elementSelector={elemSelector}
          elementWidth={elemWidth}
          elementHeight={elemHeight}
        />
      )}
    </>
  );

  return createPortal(content, captureRoot);
}
