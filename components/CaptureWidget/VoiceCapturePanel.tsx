"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw } from "lucide-react";
import ChatGPTWaveform from "@/components/ChatGPTWaveform";
import type { VoiceCaptureError } from "@/lib/capture-engine/core/types";

/** Strip OS/browser noise from enumerateDevices labels; never show raw system strings in UI. */
function formatMicLabel(label: string): string {
  if (!label?.trim()) return "Unknown device";
  let s = label.trim();
  // Remove device IDs like "(352f:0104)" or "(0c45:6362)"
  s = s.replace(/\s*\([0-9a-fA-F]{4}:[0-9a-fA-F]{4}\)\s*/g, "").trim();
  // Remove trailing device ID patterns like "352f:0104"
  s = s.replace(/\s+[0-9a-fA-F]{4}:[0-9a-fA-F]{4}\s*$/, "").trim();
  // "Default - Microphone (2- PD200X Podcast Mi...)" → "PD200X Podcast Microphone"
  const defaultWrapped = /^Default\s*[-–]\s*Microphone\s*\(\s*\d+[-–]\s*(.+?)\s*\)\s*$/i.exec(s);
  if (defaultWrapped) return defaultWrapped[1].trim() || "Default Microphone";
  // "Microphone (Realtek Audio)" → "Realtek Audio"
  const wrapped = /^Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (wrapped) return wrapped[1].trim() || "Microphone";
  // "2- PD200X Podcast Microphone)" → "PD200X Podcast Microphone"
  s = s.replace(/^\d+[-–]\s*/, "").trim();
  // Remove trailing ")" if unmatched
  s = s.replace(/\)+$/, "").trim();
  // "Microphone 2" → "Input 2"
  const numbered = /^Microphone\s+(\d+)$/i.exec(s);
  if (numbered) return `Input ${numbered[1]}`;
  // "Microphone USB Headset" → "USB Headset"
  s = s.replace(/^Microphone\s+/i, "").trim();
  // "Communications - Headset Microphone (HyperX...)" → "HyperX Headset"
  const commWrapped = /^Communications\s*[-–]\s*(?:Headset\s+)?Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (commWrapped) return commWrapped[1].trim();
  // "Headset Microphone (HyperX Virtual Surround...)" → "HyperX Virtual Surround"
  const headsetWrapped = /^Headset\s+Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (headsetWrapped) return headsetWrapped[1].trim();
  return s || "Unknown device";
}

function getMicType(label: string): string {
  const l = (label || "").toLowerCase();
  if (l.includes("default")) return "System Default";
  if (l.includes("communications")) return "Communications";
  if (l.includes("webcam") || l.includes("camera")) return "Webcam";
  if (l.includes("headset") || l.includes("headphone")) return "Headset";
  if (l.includes("bluetooth") || l.includes("airpod") || l.includes("bt ")) return "Bluetooth";
  if (l.includes("usb") || l.includes("podcast") || l.includes("yeti") || l.includes("rode") || l.includes("shure") || l.includes("maono") || l.includes("fifine")) return "USB Microphone";
  if (l.includes("built-in") || l.includes("macbook") || l.includes("internal") || l.includes("realtek")) return "Built-in";
  if (l.includes("virtual") || l.includes("droidcam") || l.includes("obs") || l.includes("voicemod") || l.includes("krisp")) return "Virtual";
  if (l.includes("iriun")) return "Virtual Webcam";
  return "Microphone";
}

export type VoiceCapturePanelProps = {
  /** 0–1 normalized microphone level (legacy, visualizer uses analyser when provided) */
  audioLevel: number;
  onFinish: () => void;
  /** Called when user cancels (e.g. Escape). Discards the capture session. */
  onCancel?: () => void;
  /** Optional screenshot for context (session element capture) */
  screenshot?: string;
  isListening?: boolean;
  isFinishing?: boolean;
  /** AnalyserNode for real-time horizontal bar visualizer */
  analyser?: AnalyserNode | null;
  /** DOM node to portal into (#echly-capture-root). Required for correct viewport positioning. */
  captureRoot?: HTMLDivElement | null;
  /** Voice capture failure — alternative recoverable UI */
  voiceError?: VoiceCaptureError;
  /** Retry after failure (restarts recording / MediaRecorder) */
  onRetryVoice?: () => void;
  /** Reset mid-recording: discard current audio buffer and restart fresh on the same mic. */
  onResetVoice?: () => void;
  /** User picked a microphone from the failure UI */
  onSelectMicrophone?: (deviceId: string) => void;
  /** Currently selected input device (for picker highlight) */
  voiceMicDeviceId?: string;
  /** Element selector badge (e.g. "#pricing-cta") */
  elementSelector?: string;
  /** Element width in px for badge */
  elementWidth?: number;
  /** Element height in px for badge */
  elementHeight?: number;
  /** When provided, renders a "Switch to text mode" link below the action buttons. */
  onSwitchToText?: () => void;
};

export function VoiceCapturePanel({
  audioLevel: _audioLevel,
  onFinish,
  onCancel,
  screenshot,
  isListening = true,
  isFinishing = false,
  analyser = null,
  captureRoot = null,
  voiceError = null,
  onRetryVoice,
  onResetVoice,
  onSelectMicrophone,
  voiceMicDeviceId = "",
  elementSelector,
  elementWidth,
  elementHeight,
  onSwitchToText,
}: VoiceCapturePanelProps) {
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [micPickerOpen, setMicPickerOpen] = useState(false);
  const [micDevices, setMicDevices] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [micDropdownRect, setMicDropdownRect] = useState<{
    top: number;
    anchorX: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [micSelecting, setMicSelecting] = useState(false);
  const micPickerRef = useRef<HTMLDivElement>(null);
  const micTriggerRef = useRef<HTMLButtonElement>(null);
  const micClosingRef = useRef(false);
  const micCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMicCloseTimer = useCallback(() => {
    if (micCloseTimerRef.current != null) {
      clearTimeout(micCloseTimerRef.current);
      micCloseTimerRef.current = null;
    }
    micClosingRef.current = false;
    setMicSelecting(false);
  }, []);

  const showFailure = Boolean(voiceError);
  const cardVisible = recordingStarted || showFailure;

  useEffect(() => {
    if (analyser && !recordingStarted && !showFailure) {
      setRecordingStarted(true);
    }
  }, [analyser, recordingStarted, showFailure]);

  useEffect(() => {
    if (showFailure) {
      setRecordingStarted(true);
    }
  }, [showFailure]);

  /** Pre-load mic devices on mount so the label is available immediately. */
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (cancelled) return;
        const inputs = devices.filter((d) => d.kind === "audioinput");
        setMicDevices(
          inputs.map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label?.trim() || `Microphone ${i + 1}`,
          }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** Current mic label derived from devices list + selected deviceId. */
  const currentMicLabel = useMemo(() => {
    if (!micDevices.length) return "Select microphone";
    if (!voiceMicDeviceId) {
      const first = micDevices[0];
      return first ? formatMicLabel(first.label) : "Select microphone";
    }
    const found = micDevices.find((d) => d.deviceId === voiceMicDeviceId);
    return found ? formatMicLabel(found.label) : "Select microphone";
  }, [micDevices, voiceMicDeviceId]);

  const updateMicDropdownPosition = useCallback(() => {
    const btn = micTriggerRef.current;
    if (!btn || !micPickerOpen) return;
    const rect = btn.getBoundingClientRect();
    const margin = 8;
    const maxScroll = 260;
    const spaceAbove = rect.top - margin;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    /** Prefer drop-up when there is enough room for the menu above the button, or more space above than below. */
    const canFitFullMenuUp = spaceAbove >= maxScroll + margin;
    const preferUp =
      canFitFullMenuUp || (spaceAbove >= spaceBelow && spaceAbove >= Math.min(maxScroll, 80));

    let top: number;
    let maxHeight: number;
    let width = rect.width;

    if (preferUp) {
      maxHeight = Math.min(maxScroll, Math.max(margin * 2, spaceAbove));
      top = rect.top - margin - maxHeight;
      if (top < margin) {
        maxHeight = Math.max(margin * 2, rect.top - margin * 2);
        top = margin;
      }
    } else {
      maxHeight = Math.min(maxScroll, Math.max(margin * 2, spaceBelow));
      top = rect.bottom + margin;
      if (top + maxHeight > window.innerHeight - margin) {
        maxHeight = Math.max(margin * 2, window.innerHeight - margin - top);
      }
    }

    /* ~5% wider than trigger (includes prior +1% feel); floor 320px; cap to viewport */
    width = Math.min(Math.max(width * 1.05, 320), window.innerWidth - 2 * margin);
    const half = width / 2;
    let anchorX = rect.left + rect.width / 2;
    anchorX = Math.max(margin + half, Math.min(anchorX, window.innerWidth - margin - half));

    setMicDropdownRect({ top, anchorX, width, maxHeight });
  }, [micPickerOpen]);

  useLayoutEffect(() => {
    if (!micPickerOpen || micDevices.length === 0) {
      setMicDropdownRect(null);
      return;
    }
    updateMicDropdownPosition();
    const onResizeOrScroll = () => updateMicDropdownPosition();
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [micPickerOpen, micDevices.length, updateMicDropdownPosition]);

  useEffect(() => {
    if (!onCancel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (micPickerOpen) {
          e.preventDefault();
          e.stopPropagation();
          clearMicCloseTimer();
          setMicPickerOpen(false);
          return;
        }
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, micPickerOpen, clearMicCloseTimer]);

  useEffect(() => {
    if (!micPickerOpen) return;
    const onPointerDownOutside = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (micClosingRef.current) return;
      const root = micPickerRef.current;
      const trigger = micTriggerRef.current;
      const path = e.composedPath();
      if (root && path.includes(root)) return;
      if (trigger && path.includes(trigger)) return;
      setMicPickerOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDownOutside, true);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside, true);
  }, [micPickerOpen]);

  useEffect(() => {
    if (!micPickerOpen) {
      clearMicCloseTimer();
    }
  }, [micPickerOpen, clearMicCloseTimer]);

  useEffect(() => () => clearMicCloseTimer(), [clearMicCloseTimer]);

  const openMicPicker = useCallback(async () => {
    clearMicCloseTimer();
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const inputs = list.filter((d) => d.kind === "audioinput");
      setMicDevices(
        inputs.map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label?.trim() || `Microphone ${i + 1}`,
        }))
      );
      setMicPickerOpen(true);
    } catch {
      setMicDevices([]);
    }
  }, [clearMicCloseTimer]);

  /** Same root as dim + card (#echly-capture-root): extension UI + theme inheritance; fixed coords stay viewport-relative. */
  const micDropdownPortalTarget = useMemo(() => {
    if (typeof document === "undefined") return null;
    return captureRoot ?? document.getElementById("echly-root");
  }, [captureRoot]);

  const micDropdownMenu =
    micPickerOpen &&
    micDevices.length > 0 &&
    micDropdownRect &&
    micDropdownPortalTarget ? (
      createPortal(
        <div
          ref={micPickerRef}
          className={`echly-voice-mic-dropdown${micSelecting ? " echly-voice-mic-dropdown--selecting" : ""}`}
          style={{
            position: "fixed",
            top: micDropdownRect.top,
            left: micDropdownRect.anchorX,
            width: micDropdownRect.width,
            maxHeight: micDropdownRect.maxHeight,
            transform: "translateX(-50%)",
          }}
          role="listbox"
          aria-label="Microphones"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {micDevices.map((d) => {
            const isActive = d.deviceId === voiceMicDeviceId;
            const cleanLabel = formatMicLabel(d.label);
            const micType = getMicType(d.label);
            return (
              <button
                key={d.deviceId}
                type="button"
                role="option"
                aria-selected={isActive}
                aria-label={`${cleanLabel}, ${micType}`}
                className={`echly-mic-item ${isActive ? "is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!d.deviceId || micClosingRef.current) return;
                  onSelectMicrophone?.(d.deviceId);
                  setMicSelecting(true);
                  micClosingRef.current = true;
                  micCloseTimerRef.current = setTimeout(() => {
                    micCloseTimerRef.current = null;
                    micClosingRef.current = false;
                    setMicSelecting(false);
                    setMicPickerOpen(false);
                  }, 500);
                }}
              >
                <span className="echly-mic-item-icon">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <div className="echly-mic-text">
                  <div className="echly-mic-title">{cleanLabel}</div>
                  <div className="echly-mic-sub">{micType}</div>
                </div>
                {isActive && (
                  <div className="echly-mic-check" aria-hidden><svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                )}
              </button>
            );
          })}
        </div>,
        micDropdownPortalTarget
      )
    ) : null;

  const failureCopy = (() => {
    if (voiceError === "mic_permission") {
      return {
        title: "Microphone access is required",
        description: "Allow microphone access in your browser settings to record voice feedback.",
      };
    }
    if (voiceError === "transcription_failed") {
      return {
        title: "Couldn't transcribe that",
        description: "Something went wrong while processing audio. Try speaking again or check your connection.",
      };
    }
    return {
      title: "Couldn't hear anything",
      description: "We didn't detect clear audio. Check your microphone and try again.",
    };
  })();

  const dimLayer = (
    <div
      className={`echly-dim-layer ${cardVisible ? "echly-dim-layer--visible" : ""}`}
      aria-hidden
    />
  );

  const shotBadge =
    elementSelector ? (
      <span className="ovl-shot-tag">
        {elementSelector}
        {elementWidth && elementHeight ? ` · ${elementWidth} × ${elementHeight}` : ""}
      </span>
    ) : null;

  const failureCard = (
    <div className="echly-v2 echly-v2-overlay-anchor" data-echly-ui="true">
      <div className="center-card" data-echly-ui="true">
        {screenshot && (
          <div className="ovl-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Capture" />
            {shotBadge}
          </div>
        )}
        <div className="err-body">
          <div className="err-icon" aria-hidden>
            {/* mic-off icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div className="err-title">{failureCopy.title}</div>
          <div className="err-sub">{failureCopy.description}</div>
          <div className="err-actions">
            <button
              type="button"
              className="err-primary"
              onClick={() => onRetryVoice?.()}
            >
              Try Again
            </button>
            <button
              ref={micTriggerRef}
              type="button"
              className="err-secondary"
              onClick={() => void openMicPicker()}
              aria-expanded={micPickerOpen}
              aria-haspopup="listbox"
            >
              Select Microphone
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const recordingActive = isListening && !isFinishing;

  const normalCard = (
    <div className="echly-v2 echly-v2-overlay-anchor" data-echly-ui="true">
      <div className="vc-card" data-echly-ui="true">
        {screenshot && (
          <div className="vc-screenshot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Capture" />
            <div className="vc-top-controls">
              <button
                type="button"
                className="vc-glass-pill"
                onClick={() => void openMicPicker()}
                ref={micTriggerRef}
                aria-expanded={micPickerOpen}
                aria-haspopup="listbox"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                <span className="pill-label">{currentMicLabel}</span>
                <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {onSwitchToText && (
                <button type="button" className="vc-glass-pill" onClick={onSwitchToText}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                  <span>Text mode</span>
                </button>
              )}
            </div>
            {elementSelector && (
              <span className="vc-selector">
                {elementSelector}
                {elementWidth && elementHeight ? ` · ${elementWidth} × ${elementHeight}` : ""}
              </span>
            )}
          </div>
        )}

        <div className="vc-body">
          <div className="vc-helper">
            <div className="vc-helper-main">
              {isFinishing ? "Wrapping up…" : "Speak naturally about what you'd change"}
            </div>
            <div className="vc-helper-sub">
              We&apos;ll break it down into clear, actionable steps.
            </div>
          </div>

          <div className="vc-visualizer">
            <div className={`vc-rec-orb${recordingActive ? "" : " vc-rec-orb--idle"}`} aria-hidden>
              <div className="vc-rec-dot-inner" />
            </div>

            <div className="vc-wave-track" aria-hidden>
              <ChatGPTWaveform analyser={analyser ?? null} />
            </div>

            <button
              type="button"
              className="vc-reset-btn"
              aria-label="Reset recording"
              onClick={() => onResetVoice?.()}
              disabled={!onResetVoice || isFinishing}
            >
              <RotateCcw size={16} strokeWidth={1.75} />
              <span className="echly-tooltip">Reset</span>
            </button>
          </div>

          <div className="vc-actions">
            <button type="button" className="vc-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="vc-done-btn"
              onClick={onFinish}
              disabled={isFinishing}
            >
              {isFinishing ? "Finishing…" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const cardContent = showFailure ? failureCard : cardVisible ? normalCard : null;

  return (
    <>
      {captureRoot ? (
        createPortal(
          <>
            {dimLayer}
            {cardContent}
          </>,
          captureRoot
        )
      ) : (
        cardContent
      )}
      {micDropdownMenu}
    </>
  );
}
