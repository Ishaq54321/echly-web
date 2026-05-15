"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Mic, Pen, ChevronLeft, Loader2 } from "lucide-react";
import { useMicPermission } from "./hooks/useMicPermission";
import { useAudioLevels } from "./hooks/useAudioLevels";

const STORED_MIC_KEY = "echly:selectedMic";

function readStoredMicId(): string | null {
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(STORED_MIC_KEY)
      : null;
  } catch {
    return null;
  }
}

function persistMicId(id: string | null): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (id) {
      localStorage.setItem(STORED_MIC_KEY, id);
    } else {
      localStorage.removeItem(STORED_MIC_KEY);
    }
  } catch {
    /* noop */
  }
}

type ModeSelectionViewProps = {
  captureMode: "voice" | "text";
  onModeChange: (mode: "voice" | "text") => void;
  onBegin: () => void;
  onBack: () => void;
  onClose: () => void;
  pageUrl?: string;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
  isStarting?: boolean;
  logoUrl?: string;
};

export default function ModeSelectionView({
  captureMode,
  onModeChange,
  onBegin,
  onBack,
  onClose,
  pageUrl,
  isStarting = false,
  logoUrl,
}: ModeSelectionViewProps) {
  const rawUrl = pageUrl ?? (typeof window !== "undefined" ? window.location.href : "");
  let host = "";
  let path = "";
  try {
    if (rawUrl) {
      const u = new URL(rawUrl);
      host = u.hostname;
      path = u.pathname;
    }
  } catch {}
  const faviconInitial = host ? host.charAt(0).toUpperCase() : "W";

  const [storedMicId] = useState<string | null>(() => readStoredMicId());
  const handleValidatedDeviceId = useCallback((id: string | null) => {
    persistMicId(id);
  }, []);
  const {
    state: micPermissionState,
    requestPermission,
    openSiteSettings,
  } = useMicPermission({
    storedDeviceId: storedMicId,
    onValidatedDeviceId: handleValidatedDeviceId,
  });

  useEffect(() => {
    if (micPermissionState === "idle") {
      void requestPermission();
    }
  }, [micPermissionState, requestPermission]);

  /** Preview stream for the audio-reactive bars while on mode selection. */
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    if (micPermissionState !== "granted") return;
    let cancelled = false;
    let activeStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        activeStream = s;
        setPreviewStream(s);
      })
      .catch((err) => {
        console.warn("[ECHLY:MIC] preview stream failed", err);
      });

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((t) => t.stop());
      setPreviewStream(null);
    };
  }, [micPermissionState]);

  const { bars } = useAudioLevels(previewStream);
  const isDeniedRetryable = micPermissionState === "denied";
  const isDeniedPermanent = micPermissionState === "denied-permanent";
  const isVoiceDisabled =
    isDeniedRetryable || isDeniedPermanent || micPermissionState === "granting";

  return (
    <div className="pill pill-mode">
      {/* Page context strip */}
      <div className="page-context">
        <span className="page-context-favicon">{faviconInitial}</span>
        <span className="page-context-url">
          <span className="host">{host}</span>
          {path && path !== "/" ? path : ""}
        </span>
        <span className="page-context-badge">Recording ready</span>
      </div>

      {/* Header */}
      <div className="pill-head">
        <span className="pill-mark pill-mark-logo">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Annote"
              style={{ width: 24, height: 30, objectFit: "contain", display: "block" }}
            />
          ) : (
            "A"
          )}
        </span>
        <div className="pill-ws" />
        <div className="tl-icon-group">
          <button
            type="button"
            className="pill-icon-btn"
            onClick={() => onModeChange(captureMode === "voice" ? "text" : "voice")}
            aria-label="Toggle mode"
          >
            {captureMode === "voice" ? (
              <Mic size={13} strokeWidth={2.25} />
            ) : (
              <Pen size={13} strokeWidth={2.25} />
            )}
            <span className="echly-tooltip">{captureMode === "voice" ? "Text mode" : "Voice mode"}</span>
          </button>
          <button
            type="button"
            className="pill-icon-btn"
            onClick={onBack}
            aria-label="Back"
          >
            <ChevronLeft size={13} strokeWidth={2.25} />
            <span className="echly-tooltip">Back</span>
          </button>
          <button
            type="button"
            className="pill-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={13} strokeWidth={2.25} />
            <span className="echly-tooltip">Minimize</span>
          </button>
        </div>
      </div>

      <div className="pill-rule" />

      {/* Mode prompt */}
      <div className="mode-prompt">
        <span className="mode-prompt-eyebrow">
          <span className="ai-dot" aria-hidden />
          {" "}Annote AI
        </span>
        <div className="mode-prompt-title">How do you want to give feedback?</div>
        <div className="mode-prompt-sub">Describe what needs to change — AI structures it into tickets.</div>
      </div>

      {/* Mode cards */}
      <div className="mode-grid">
        <button
          type="button"
          className={`mode-card${captureMode === "voice" ? " active" : ""}${isVoiceDisabled ? " mode-card-disabled" : ""}`}
          onClick={() => {
            if (isVoiceDisabled) return;
            onModeChange("voice");
          }}
          aria-pressed={captureMode === "voice"}
          aria-disabled={isVoiceDisabled || undefined}
          disabled={isVoiceDisabled}
        >
          {isDeniedRetryable || isDeniedPermanent ? (
            <div className="mode-card-denied" onClick={(e) => e.stopPropagation()}>
              <div className="mode-card-denied-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                  <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="mode-card-denied-title">Microphone access blocked</p>
              <button
                type="button"
                className="mode-card-cta"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDeniedPermanent) {
                    openSiteSettings();
                  } else {
                    void requestPermission();
                  }
                }}
              >
                {isDeniedPermanent ? "Open mic settings" : "Give access"}
              </button>
              <p className="mode-card-denied-hint">
                You can also click the lock icon in your URL bar and allow microphone access.
              </p>
            </div>
          ) : (
            <>
              <span className="mode-card-check" aria-hidden="true">
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mode-card-glyph">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <div className="mode-card-title">Voice</div>
                <div className="mode-card-sub">
                  {micPermissionState === "granting"
                    ? "Requesting microphone…"
                    : "Speak the change. AI cleans and structures it."}
                </div>
              </div>
              <span className="voice-wave" aria-hidden="true">
                {bars.map((level, i) => (
                  <span
                    key={i}
                    style={{
                      transform: `scaleY(${Math.max(0.15, Math.min(1.6, level * 2.4))})`,
                      transformOrigin: "bottom",
                      transition: "transform 70ms ease-out",
                    }}
                  />
                ))}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`mode-card${captureMode === "text" ? " active" : ""}`}
          onClick={() => onModeChange("text")}
          aria-pressed={captureMode === "text"}
        >
          <span className="mode-card-check" aria-hidden="true">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mode-card-glyph">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 12.5l1-3 7-7 2 2-7 7-3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9.5 4l2 2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <div>
            <div className="mode-card-title">Write</div>
            <div className="mode-card-sub">Type in your words. AI structures it into tickets.</div>
          </div>
        </button>
      </div>

      {/* Confirm row */}
      <div className="mode-confirm">
        <div className="mode-confirm-info">
          {captureMode === "voice" && (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v4M8 11h.01M2.5 13h11a1 1 0 0 0 .87-1.5l-5.5-9.5a1 1 0 0 0-1.74 0l-5.5 9.5A1 1 0 0 0 2.5 13z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isDeniedRetryable || isDeniedPermanent
                ? "Mic access blocked — pick Write or allow mic"
                : micPermissionState === "granted"
                  ? "Mic ready"
                  : micPermissionState === "granting"
                    ? "Requesting microphone…"
                    : "Mic permission required"}
            </>
          )}
        </div>
        <button
          type="button"
          className="begin-btn"
          style={{ backgroundColor: "#5A49BF" }}
          onClick={onBegin}
          disabled={isStarting || (captureMode === "voice" && isVoiceDisabled)}
        >
          {isStarting ? (
            <>
              <Loader2 size={11} strokeWidth={2} className="animate-spin" />
              Starting...
            </>
          ) : (
            <>
              Begin
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
