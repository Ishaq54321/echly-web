"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  X,
  Mic,
  Pen,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Check,
  Shield,
  Lightbulb,
  Edit3,
} from "lucide-react";
import { useMicPermission } from "./hooks/useMicPermission";
import { detectBrowser } from "./detectBrowser";
import { ChromeSlidersIcon, EdgeLockIcon } from "./BrowserAddressBarIcon";

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
  // Human-readable host for the site-blocked copy. Reuses the already-parsed
  // host (from pageUrl ?? window.location), strips a leading www., and falls
  // back to "This site" for chrome-extension:// / about: / parse failures.
  const hostnameForDisplay = host
    ? host.replace(/^www\./, "")
    : "This site";

  const [storedMicId] = useState<string | null>(() => readStoredMicId());
  const handleValidatedDeviceId = useCallback((id: string | null) => {
    persistMicId(id);
  }, []);

  /**
   * Set when the user clicks Begin while mic is blocked. If the permission
   * then auto-recovers (user flipped it in browser settings), this lets us
   * resume the begin-recording flow they originally intended.
   */
  const pendingBeginRef = useRef(false);

  const handleAutoRecover = useCallback(() => {
    if (pendingBeginRef.current) {
      pendingBeginRef.current = false;
      onBegin();
    }
  }, [onBegin]);

  const { state: micPermissionState, requestPermission } = useMicPermission({
    storedDeviceId: storedMicId,
    onValidatedDeviceId: handleValidatedDeviceId,
    onAutoRecover: handleAutoRecover,
  });

  // NOTE: No auto-request on mount. The permission request must happen only
  // inside a user gesture (the Begin click). The hook's Permissions API
  // listener already learns the initial state for UI display without firing
  // getUserMedia.

  const isGranting = micPermissionState === "granting";
  const isDeniedRetryable = micPermissionState === "denied";
  const isDeniedPermanent = micPermissionState === "denied-permanent";
  const isGrantedJustNow = micPermissionState === "granted-just-now";
  const isSiteBlocked = micPermissionState === "site-blocked";

  /**
   * Show the dedicated full-width permission panel (in place of the mode grid)
   * whenever Voice is the selected mode AND we're mid-request, blocked, or
   * mid auto-recovery celebration.
   */
  const showPermissionPanel =
    captureMode === "voice" &&
    (isGranting ||
      isDeniedRetryable ||
      isDeniedPermanent ||
      isGrantedJustNow ||
      isSiteBlocked);

  const browser = detectBrowser();
  const BrowserIcon =
    browser === "chrome"
      ? ChromeSlidersIcon
      : browser === "edge"
        ? EdgeLockIcon
        : null;

  const switchToWriteMode = useCallback(() => {
    onModeChange("text");
  }, [onModeChange]);

  /**
   * Begin click — getUserMedia MUST run synchronously inside this handler so
   * Chrome treats it as gesture-initiated. No setTimeout / useEffect deferral.
   */
  const handleBegin = useCallback(() => {
    if (isStarting) return;

    if (captureMode === "voice" && micPermissionState !== "granted") {
      // Mark intent so an out-of-band permission grant (user flips it in
      // browser settings) can auto-resume this exact flow.
      pendingBeginRef.current = true;
      // Request inside the gesture chain, then branch on the result.
      void requestPermission().then((result) => {
        if (result === "granted") {
          pendingBeginRef.current = false;
          onBegin();
        }
        // denied / denied-permanent → panel shows the inline instructions;
        // auto-recovery (or "Try again") resumes from there.
      });
      return;
    }

    // Write mode (no mic) or already granted → proceed immediately.
    onBegin();
  }, [isStarting, captureMode, micPermissionState, requestPermission, onBegin]);

  const grantingTitle = "Requesting microphone…";
  const grantingSub = "Allow access in the browser prompt to continue.";
  const retryableTitle = "Annote needs your microphone";
  const retryableSub =
    "To capture voice feedback, allow microphone access when your browser asks.";

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

      {showPermissionPanel ? (
        <div className="echly-mic-permission-panel">
          <div className="echly-mic-permission-eyebrow">
            <span className="echly-mic-permission-dot" aria-hidden />
            <span>Annote AI</span>
          </div>

          {isGrantedJustNow ? (
            <div className="echly-mic-permission-header">
              <div className="echly-mic-permission-icon-circle echly-mic-permission-icon-circle--success">
                <Check size={22} />
              </div>
              <p className="echly-mic-permission-title">Microphone allowed</p>
              <p className="echly-mic-permission-sub">Starting your session…</p>
            </div>
          ) : isGranting ? (
            <div className="echly-mic-permission-header">
              <div className="echly-mic-permission-icon-circle">
                <Loader2 className="echly-mic-permission-spinner" size={22} />
              </div>
              <p className="echly-mic-permission-title">{grantingTitle}</p>
              <p className="echly-mic-permission-sub">{grantingSub}</p>
            </div>
          ) : isSiteBlocked ? (
            <>
              <div className="echly-mic-permission-header">
                <div className="echly-mic-permission-icon-circle">
                  <Shield size={22} />
                </div>
                <p className="echly-mic-permission-title">
                  This site doesn&apos;t allow voice recording
                </p>
                <p className="echly-mic-permission-sub">
                  {hostnameForDisplay} has disabled microphone access for
                  security reasons — this isn&apos;t something we can change.
                </p>
              </div>

              <div className="echly-mic-permission-hint">
                <Lightbulb size={14} />
                <span>
                  You can still use <strong>Write mode</strong> to capture
                  text feedback on this site.
                </span>
              </div>

              <button
                type="button"
                className="echly-mic-permission-primary"
                onClick={switchToWriteMode}
              >
                <Edit3 size={14} />
                Switch to Write mode
              </button>
            </>
          ) : isDeniedPermanent ? (
            <>
              <div className="echly-mic-permission-header">
                <div className="echly-mic-permission-icon-circle echly-mic-permission-icon-circle--blocked">
                  <Mic size={22} />
                  <span
                    className="echly-mic-permission-slash"
                    aria-hidden="true"
                  />
                </div>
                <p className="echly-mic-permission-title">
                  Microphone is blocked
                </p>
                <p className="echly-mic-permission-sub">
                  Allow it in a couple of clicks — we&apos;ll detect it
                  automatically.
                </p>
              </div>

              <div className="echly-mic-permission-instructions">
                <div className="echly-mic-permission-step">
                  <span className="echly-mic-permission-step-num">1</span>
                  <span className="echly-mic-permission-step-text">
                    Click the
                    {BrowserIcon ? (
                      <>
                        {" "}
                        <span className="echly-mic-permission-icon-chip">
                          <BrowserIcon size={13} color="var(--muted)" />
                        </span>{" "}
                        icon
                      </>
                    ) : (
                      <>
                        {" "}
                        <strong>icon</strong>
                      </>
                    )}{" "}
                    in the address bar
                  </span>
                </div>

                <div className="echly-mic-permission-step">
                  <span className="echly-mic-permission-step-num">2</span>
                  <span className="echly-mic-permission-step-text">
                    Find <strong>Microphone</strong> and toggle it to{" "}
                    <strong>Allow</strong>
                  </span>
                </div>

                <div className="echly-mic-permission-step">
                  <span className="echly-mic-permission-step-num">3</span>
                  <span className="echly-mic-permission-step-text">
                    Come back here — we&apos;ll start recording automatically
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="echly-mic-permission-primary"
                onClick={() => {
                  pendingBeginRef.current = true;
                  void requestPermission();
                }}
              >
                <RefreshCw size={14} />
                Try again
              </button>
              <button
                type="button"
                className="echly-mic-permission-secondary"
                onClick={switchToWriteMode}
              >
                Use Write instead
              </button>
            </>
          ) : (
            <>
              <div className="echly-mic-permission-header">
                <div className="echly-mic-permission-icon-circle">
                  <Mic size={22} />
                </div>
                <p className="echly-mic-permission-title">{retryableTitle}</p>
                <p className="echly-mic-permission-sub">{retryableSub}</p>
              </div>

              <button
                type="button"
                className="echly-mic-permission-primary"
                onClick={() => {
                  pendingBeginRef.current = true;
                  void requestPermission().then((result) => {
                    if (result === "granted") {
                      pendingBeginRef.current = false;
                      onBegin();
                    }
                  });
                }}
              >
                <RefreshCw size={14} />
                Try again
              </button>
              <button
                type="button"
                className="echly-mic-permission-secondary"
                onClick={switchToWriteMode}
              >
                Use Write instead
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Mode prompt */}
          <div className="mode-prompt">
            <span className="mode-prompt-eyebrow">
              <span className="ai-dot" aria-hidden />
              {" "}Annote AI
            </span>
            <div className="mode-prompt-title">How do you want to give feedback?</div>
            <div className="mode-prompt-sub">AI structures whichever you choose into tickets.</div>
          </div>

          {/* Mode cards */}
          <div className="mode-grid">
            <button
              type="button"
              className={`mode-card${captureMode === "voice" ? " active" : ""}`}
              onClick={() => onModeChange("voice")}
              aria-pressed={captureMode === "voice"}
            >
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
                  Faster.
                  <br />
                  Speak naturally
                </div>
              </div>
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
                <div className="mode-card-sub">
                  Quieter.
                  <br />
                  Type your thoughts.
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Confirm row — omitted while the permission panel is shown; the panel
          is self-contained (Try again / Use Write instead), so the Begin row
          would only add an empty ~50px strip below it. Reappears on
          Voice/Write mode selection. */}
      {!showPermissionPanel && (
      <div className="mode-confirm">
        <div className="mode-confirm-info">
          {captureMode === "voice" && !showPermissionPanel && (
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
              {micPermissionState === "granted"
                ? "Mic ready"
                : "Mic permission requested on Begin"}
            </>
          )}
        </div>
        <button
          type="button"
          className="begin-btn"
          style={{ backgroundColor: "var(--brand)" }}
          onClick={handleBegin}
          disabled={isStarting}
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
      )}
    </div>
  );
}
