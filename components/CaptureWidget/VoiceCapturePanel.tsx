"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MicOff } from "lucide-react";
import type { VoiceCaptureError } from "@/lib/capture-engine/core/types";

const BAR_WIDTH = 2;
/** Min interval between buffer samples (ms) — pairs with bar transition; avoids excessive re-renders */
const WAVEFORM_SAMPLE_MS = 50;
/** Linear RMS → 0–255 before normalize (tune if levels feel off) */
const RMS_TO_BYTE = 3;

/** Strip OS/browser noise from enumerateDevices labels; never show raw system strings in UI. */
function formatMicLabel(label: string): string {
  if (!label?.trim()) return "Unknown device";
  let s = label.trim();
  const wrapped = /^Microphone\s*\(\s*(.+?)\s*\)\s*$/i.exec(s);
  if (wrapped) {
    const inner = wrapped[1].trim();
    return inner || "Unknown device";
  }
  const numbered = /^Microphone\s+(\d+)$/i.exec(s);
  if (numbered) {
    return `Input ${numbered[1]}`;
  }
  s = s.replace(/^Microphone\s+/i, "").trim();
  return s || "Unknown device";
}

function getMicType(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("default")) return "System Default";
  if (lower.includes("webcam")) return "Webcam Mic";
  if (lower.includes("headset")) return "Headset";
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
  /** User picked a microphone from the failure UI */
  onSelectMicrophone?: (deviceId: string) => void;
  /** Currently selected input device (for picker highlight) */
  voiceMicDeviceId?: string;
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
  onSelectMicrophone,
  voiceMicDeviceId = "",
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

  const [bars, setBars] = useState<number[]>([]);
  const [barCount, setBarCount] = useState(48);
  const waveformRef = useRef<HTMLDivElement>(null);
  const barCountRef = useRef(48);
  const waveformRafRef = useRef<number>(0);
  const lastWaveformSampleRef = useRef(0);

  useEffect(() => {
    barCountRef.current = barCount;
  }, [barCount]);

  useLayoutEffect(() => {
    const el = waveformRef.current;
    if (!el) return;

    const updateBarCount = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      const n = Math.max(1, Math.floor(w / BAR_WIDTH));
      setBarCount((prev) => (prev === n ? prev : n));
    };

    updateBarCount();
    const ro = new ResizeObserver(() => {
      updateBarCount();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isListening, isFinishing]);

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

  /** Keep buffer length === barCount (newest at index 0; oldest at end — paired with row-reverse so new appears on the right). */
  useEffect(() => {
    setBars((prev) => {
      const cap = barCount;
      if (cap <= 0) return [];
      if (prev.length === cap) return prev;
      if (prev.length < cap) {
        return [...prev, ...Array(cap - prev.length).fill(0)];
      }
      return prev.slice(0, cap);
    });
  }, [barCount]);

  useEffect(() => {
    if (!analyser || !isListening || isFinishing) {
      setBars([]);
      lastWaveformSampleRef.current = 0;
      return;
    }

    const bufferLen = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLen);

    const tick = (t: number) => {
      waveformRafRef.current = requestAnimationFrame(tick);
      if (t - lastWaveformSampleRef.current < WAVEFORM_SAMPLE_MS) return;
      lastWaveformSampleRef.current = t;

      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLen; i++) {
        const v = (dataArray[i]! - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / bufferLen);
      const value = Math.min(255, Math.max(0, rms * 255 * RMS_TO_BYTE));
      const normalized = value / 255;
      const finalAmplitude = Math.min(normalized * 1.25, 1);

      const cap = barCountRef.current;
      if (cap < 1) return;

      setBars((prev) => {
        const next = [finalAmplitude, ...prev];
        while (next.length > cap) next.pop();
        while (next.length < cap) next.push(0);
        return next;
      });
    };

    waveformRafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(waveformRafRef.current);
    };
  }, [analyser, isListening, isFinishing]);

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
                  }, 2000);
                }}
              >
                <div className="echly-mic-text">
                  <div className="echly-mic-title">{cleanLabel}</div>
                  <div className="echly-mic-sub">{micType}</div>
                </div>
                {isActive && (
                  <div className="echly-mic-check" aria-hidden>
                    ✓
                  </div>
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

  const failureBody = showFailure && (
    <div className="echly-voice-failure-body">
      <div className="echly-voice-failure-icon-wrap" aria-hidden>
        <MicOff size={40} strokeWidth={1.5} />
      </div>
      <div className="echly-capture-header echly-voice-failure-header">
        <h2 className="echly-capture-title">{failureCopy.title}</h2>
        <p className="echly-capture-instruction">{failureCopy.description}</p>
      </div>
      <div className="echly-voice-failure-actions">
        <button
          type="button"
          className="echly-finish-btn"
          onClick={() => onRetryVoice?.()}
        >
          Try Again
        </button>
        <div className="echly-voice-failure-secondary-wrap">
          <button
            ref={micTriggerRef}
            type="button"
            className="echly-voice-failure-secondary"
            onClick={() => void openMicPicker()}
            aria-expanded={micPickerOpen}
            aria-haspopup="listbox"
          >
            Select Microphone
          </button>
        </div>
      </div>
    </div>
  );

  const normalBody = !showFailure && (
    <>
      <div className="echly-voice-header">
        <div className="echly-voice-status">
          {!isFinishing && isListening ? (
            <>
              <span className="echly-dot" aria-hidden />
              Capturing feedback…
            </>
          ) : (
            <>
              <span className="echly-dot echly-dot--idle" aria-hidden />
              Wrapping up…
            </>
          )}
        </div>
        <div className="echly-voice-cancel">{isFinishing ? "Finishing…" : "Press Esc to cancel"}</div>
      </div>

      <div className="echly-capture-header">
        <h2 className="echly-capture-title">Voice feedback</h2>
        <p className="echly-capture-instruction">Describe what you noticed—Echly structures it for your team.</p>
      </div>

      {isListening && !isFinishing ? (
        <div className="echly-capture-visualizer">
          <div className="echly-waveform-container">
            <div ref={waveformRef} className="echly-waveform" aria-hidden>
              {bars.map((value, i) => {
                const n = bars.length;
                const fade =
                  n <= 1 ? 1 : 0.4 + 0.6 * (1 - i / (n - 1));
                return (
                  <div
                    key={i}
                    className="echly-bar"
                    style={{
                      height: `${value * 100}%`,
                      opacity: fade,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="echly-finish-btn"
        onClick={onFinish}
        disabled={isFinishing}
      >
        {isFinishing ? "Finishing..." : "Finish"}
      </button>
    </>
  );

  const card = (
    <div
      className={`echly-capture-card panel ${cardVisible ? "echly-capture-card--visible" : ""}`}
      data-echly-ui="true"
    >
      <div className="echly-capture-card-blur-bg panel-bg" aria-hidden />
      <div className="echly-capture-card-content panel-content">
        {screenshot && (
          <div className="echly-capture-screenshot-preview">
            <img src={screenshot} alt="Capture" />
          </div>
        )}
        {failureBody}
        {normalBody}
      </div>
    </div>
  );

  return (
    <>
      {captureRoot ? (
        createPortal(
          <>
            {dimLayer}
            {card}
          </>,
          captureRoot
        )
      ) : (
        card
      )}
      {micDropdownMenu}
    </>
  );
}
