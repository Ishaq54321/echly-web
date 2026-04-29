"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
import { ResumeSessionModal } from "./ResumeSessionModal";
import { MicrophonePanel } from "./MicrophonePanel";
import { SessionLimitUpgradeView } from "./SessionLimitUpgradeView";
import ModeSelectionView from "./ModeSelectionView";
import PreviousFeedbackView from "./PreviousFeedbackView";
import { KeepRecordingPill } from "@/components/CaptureWidget/KeepRecordingPill";
import type { CaptureWidgetProps, CaptureState } from "./types";
import { ECHLY_DEBUG } from "@/lib/utils/logger";

const CAPTURE_FLOW_STATES: CaptureState[] = ["focus_mode", "region_selecting", "voice_listening", "processing"];

export default function CaptureWidget({
  sessionId,
  userId,
  extensionMode = false,
  initialPointers,
  onComplete,
  onDelete,
  onUpdate,
  widgetToggleRef,
  onRecordingChange,
  expanded,
  onExpandRequest,
  onCollapseRequest,
  captureDisabled = false,
  theme = "dark",
  onThemeToggle,
  fetchSessions,
  hasPreviousSessions = false,
  onPreviousSessionSelect,
  loadSessionWithPointers,
  pointers: pointersProp,
  totalCount,
  openCount,
  resolvedCount,
  highPriorityOpenCount,
  sessionLoading = false,
  feedbackRecovering = false,
  feedbackRecoveryAttempts = 0,
  feedbackFetchFailed = false,
  onSessionLoaded,
  onSessionEnd: onSessionEndCallback,
  onCreateSession,
  onActiveSessionChange,
  ensureAuthenticated,
  globalSessionModeActive,
  globalSessionPaused,
  onSessionModeStart,
  onSessionModePause,
  onSessionModeResume,
  onSessionModeEnd,
  onSessionActivity,
  captureMode = "voice",
  onCaptureModeChange,
  captureRootParent,
  isProcessingFeedback = false,
  feedbackJobs,
  launcherLogoUrl,
  sessionTitleProp,
  onSessionTitleChange: onSessionTitleChangeProp,
  openResumeModal: openResumeModalProp,
  onResumeModalClose,
  verifySessionBeforeSessions,
  onTriggerLogin,
  sessionLimitReached,
  sessionStartErrorBanner,
  onSessionStartErrorDismiss,
  environment,
  assertIdentityBeforeWorkspaceMutations,
  onPreviousSessions,
  onSetCaptureMode,
  onOpenBilling,
  onOpenDashboard,
  getAssetUrl,
  __extensionSavingState,
  onExtensionSavingSignalsChange,
}: CaptureWidgetProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const showResumeModal = resumeModalOpen || (openResumeModalProp ?? false);
  /** V2: when true, show Previous Feedback view instead of home screen. */
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);
  /** Extension: when true, show command screen (mode cards + footer). False when viewing a session (e.g. after Open Previous or when paused). */
  const [showCommandScreen, setShowCommandScreen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [micDropdownOpen, setMicDropdownOpen] = useState(false);
  /** V2: when true, show mode selection screen instead of home screen. */
  const [showModeSelection, setShowModeSelection] = useState(false);
  /** S9: Keep Recording pill — shown once per session on first processing trigger. */
  const [keepRecordingVisible, setKeepRecordingVisible] = useState(false);
  const keepRecordingShownRef = useRef(false);

  const {
    state,
    handlers,
    refs,
    captureRootEl,
  } = useCaptureWidget({
    sessionId,
    userId,
    extensionMode,
    initialPointers,
    onComplete,
    onDelete,
    onUpdate,
    onRecordingChange,
    loadSessionWithPointers,
    pointers: pointersProp,
    onSessionLoaded,
    onCreateSession,
    onActiveSessionChange,
    ensureAuthenticated,
    onSessionViewRequested: extensionMode
      ? () => {
          if (ECHLY_DEBUG) console.debug("[ECHLY] UI entering session mode", performance.now());
          setShowCommandScreen(false);
        }
      : undefined,
    globalSessionModeActive,
    globalSessionPaused,
    onSessionModeStart,
    onSessionModePause,
    onSessionModeResume,
    onSessionModeEnd,
    onSessionActivity,
    captureMode,
    selectedMicrophoneId: selectedMicrophone || undefined,
    onDevicesEnumerated: extensionMode
      ? (devices) => {
          setMicrophones(devices);
          if (devices.length && !selectedMicrophone) setSelectedMicrophone(devices[0].deviceId || "");
        }
      : undefined,
    onVoiceMicrophoneSelect: (deviceId) => {
      setSelectedMicrophone(deviceId);
    },
    captureRootParent,
    environment,
    assertIdentityBeforeWorkspaceMutations,
  });

  /** Session limit: prop (from parent e.g. extension) takes precedence; otherwise use hook state (set when startSession returns limitReached). */
  const effectiveSessionLimitReached = sessionLimitReached ?? state.sessionLimitReached;

  useEffect(() => {
    onExtensionSavingSignalsChange?.({
      sessionFeedbackSaving: state.sessionFeedbackSaving,
      pausePending: state.pausePending,
      endPending: state.endPending,
    });
  }, [
    onExtensionSavingSignalsChange,
    state.sessionFeedbackSaving,
    state.pausePending,
    state.endPending,
  ]);

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  /** Bumps when the scroll list DOM mounts so the scroll listener effect reattaches after tray minimize/reopen or conditional remount. */
  const [scrollListMountEpoch, setScrollListMountEpoch] = useState(0);
  const isFetchingRef = useRef(false);

  const listScrollRefCallback = useCallback((node: HTMLDivElement | null) => {
    listScrollRef.current = node;
    if (node) {
      setScrollListMountEpoch((e) => e + 1);
    }
  }, []);

  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state) || state.pillExiting;
  const optimisticSessionActive = state.sessionStatus === "starting" || state.sessionStatus === "active";
  const hasStoredSession = Boolean(sessionId) || optimisticSessionActive;
  const showSidebar = !isInCaptureFlow && !state.sessionMode;
  /** Session sidebar visible when session is active or paused; hide only when session ends. */
  const shouldShowTray = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
  const showSessionSidebar = extensionMode && shouldShowTray;
  const showFloatingButton = !effectiveIsOpen && (showSidebar || showSessionSidebar);
  const showPanel = effectiveIsOpen && (showSidebar || showSessionSidebar);

  const hasTickets = typeof totalCount === "number" && totalCount > 0;
  /** When true, we are in an active or paused session; always render session layout (ticket list or empty state), never home. */
  const sessionModeActive = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
  /** Home screen only when not in a session. */
  const showHomeScreen = !sessionModeActive;
  const isStartingSession = state.sessionStatus === "starting";

  const openTicketsCount = typeof openCount === "number" ? openCount : 0;
  const resolvedTicketsCount = typeof resolvedCount === "number" ? resolvedCount : 0;
  const sessionHeaderCount =
    extensionMode && typeof totalCount === "number"
      ? totalCount
      : openTicketsCount;

  const summary = extensionMode
    ? `${typeof totalCount === "number" ? totalCount : 0} total · ${openTicketsCount} open · ${resolvedTicketsCount} resolved`
    : openTicketsCount > 0 &&
        typeof highPriorityOpenCount === "number" &&
        highPriorityOpenCount > 0
      ? `${highPriorityOpenCount} need attention`
      : null;

  useEffect(() => {
    if (state.highlightTicketId && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.highlightTicketId]);

  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) {
      return;
    }

    if (ECHLY_DEBUG) console.debug("[ECHLY UI] scroll listener attached");

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const { scrollTop, clientHeight, scrollHeight } = el;
        const threshold = 200;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

        if (
          extensionMode &&
          isNearBottom &&
          !isFetchingRef.current &&
          typeof chrome !== "undefined" &&
          chrome.runtime?.sendMessage
        ) {
          isFetchingRef.current = true;
          chrome.runtime.sendMessage({ type: "ECHLY_LOAD_MORE" }, () => {
            isFetchingRef.current = false;
          });
        }
      }, 50);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (ECHLY_DEBUG) console.debug("[ECHLY UI] scroll listener removed");
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      el.removeEventListener("scroll", handleScroll);
    };
  }, [
    extensionMode,
    hasTickets,
    isProcessingFeedback,
    feedbackJobs?.length,
    sessionModeActive,
    sessionLoading,
    showPanel,
    scrollListMountEpoch,
  ]);

  /** When session is loaded explicitly (user selected from Previous Sessions), transition to session view. */
  useEffect(() => {
    if (loadSessionWithPointers?.sessionId) {
      setShowCommandScreen(false);
    }
  }, [loadSessionWithPointers?.sessionId]);

  /** When a session becomes active, dismiss mode selection and previous feedback view. */
  useEffect(() => {
    if (sessionModeActive) {
      setShowModeSelection(false);
      setShowPreviousFeedback(false);
    }
  }, [sessionModeActive]);

  /** Sync external openResumeModal prop into the in-widget previous feedback view. */
  useEffect(() => {
    if (openResumeModalProp) {
      setShowPreviousFeedback(true);
    }
  }, [openResumeModalProp]);

  /** S9: Show KeepRecordingPill on the first processing job of a session. */
  useEffect(() => {
    if (
      sessionModeActive &&
      !keepRecordingShownRef.current &&
      (isProcessingFeedback || feedbackJobs?.some((j) => j.status === "processing"))
    ) {
      keepRecordingShownRef.current = true;
      setKeepRecordingVisible(true);
    }
  }, [isProcessingFeedback, feedbackJobs, sessionModeActive]);

  /** S9: Auto-dismiss KeepRecordingPill after 8 seconds. */
  useEffect(() => {
    if (!keepRecordingVisible) return;
    const t = setTimeout(() => setKeepRecordingVisible(false), 8000);
    return () => clearTimeout(t);
  }, [keepRecordingVisible]);

  /** S9: Reset KeepRecordingPill state when session ends. */
  useEffect(() => {
    if (!sessionModeActive) {
      keepRecordingShownRef.current = false;
      setKeepRecordingVisible(false);
    }
  }, [sessionModeActive]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  const handlePreviousSessions = React.useCallback(() => {
    onPreviousSessions?.();
    setShowPreviousFeedback(true);
  }, [onPreviousSessions]);

  function setMode(mode: "voice" | "text") {
    if (onSetCaptureMode) {
      onSetCaptureMode(mode);
    } else {
      onCaptureModeChange?.(mode);
    }
  }

  const handleClose = () => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false));

  return (
    <>
      {extensionMode && fetchSessions && onPreviousSessionSelect && (
        <ResumeSessionModal
          open={showResumeModal}
          onClose={() => {
            setResumeModalOpen(false);
            onResumeModalClose?.();
          }}
          fetchSessions={fetchSessions}
          onSelectSession={(sessionId) => {
            setShowCommandScreen(false);
            onPreviousSessionSelect(sessionId);
            setResumeModalOpen(false);
          }}
          theme={theme}
          checkAuth={verifySessionBeforeSessions}
          onOpenLogin={onTriggerLogin}
        />
      )}
      {/* Capture layer: portaled into #echly-capture-root. Never inside sidebar. */}
      {captureRootEl && (
        <CaptureLayer
          captureRoot={captureRootEl}
          captureRootParent={captureRootParent ?? undefined}
          extensionMode={extensionMode}
          state={state.state}
          getFullTabImage={handlers.getFullTabImage}
          onRegionCaptured={handlers.handleRegionCaptured}
          onRegionSelectStart={handlers.handleRegionSelectStart}
          onCancelCapture={handlers.handleCancelCapture}
          sessionMode={state.sessionMode || isStartingSession}
          optimisticSessionStarting={isStartingSession}
          globalSessionModeActive={globalSessionModeActive}
          sessionId={sessionId}
          sessionPaused={state.sessionPaused}
          pausePending={state.pausePending}
          endPending={state.endPending}
          isFinishing={state.isFinishing}
          sessionFeedbackPending={state.sessionFeedbackPending}
          captureMode={captureMode}
          listeningAudioLevel={state.listeningAudioLevel ?? 0}
          audioAnalyser={state.audioAnalyser ?? null}
          voiceError={state.voiceError}
          onRetryVoice={handlers.retryVoiceCapture}
          onSelectMicrophone={handlers.selectVoiceMicrophone}
          voiceMicDeviceId={state.voiceMicDeviceId}
          onSessionElementClicked={handlers.handleSessionElementClicked}
          onSessionPause={() => {
            handlers.pauseSession();
            onExpandRequest?.();
          }}
          onSessionResume={() => {
            handlers.resumeSession();
          }}
          onSessionEnd={() => {
            const saving = Boolean(__extensionSavingState);
            if (
              saving &&
              typeof window !== "undefined" &&
              !window.confirm("Changes are still saving. Are you sure you want to end the session?")
            ) {
              return;
            }
            handlers.endSession(() => {
              setShowCommandScreen(true);
              onSessionEndCallback?.();
            });
          }}
          __extensionSavingState={__extensionSavingState}
          onSessionRecordVoice={handlers.handleSessionStartVoice}
          onSessionDoneVoice={handlers.finishListening}
          onSessionSaveText={handlers.handleSessionFeedbackSubmit}
          onSessionFeedbackCancel={handlers.handleSessionFeedbackCancel}
          theme={theme}
        />
      )}

      {showFloatingButton && (
        <div className="echly-floating-trigger-wrapper">
          <button
            type="button"
            id={extensionMode && launcherLogoUrl ? "launcher_container" : undefined}
            onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
            className={`echly-floating-trigger${extensionMode && launcherLogoUrl ? " echly-launcher" : ""}`}
            aria-label="Open Echly"
          >
            {extensionMode && launcherLogoUrl ? (
              <img
                src={launcherLogoUrl}
                className="echly-launcher-logo"
                alt="Echly"
              />
            ) : (
              extensionMode ? "Echly" : "Capture feedback"
            )}
          </button>
        </div>
      )}

      {showPanel && (
        <>
          {!extensionMode && (
            <div
              className="echly-backdrop"
              style={{ position: "fixed", inset: 0, zIndex: 2147483646, background: "rgba(0,0,0,0.06)", pointerEvents: "auto" }}
              aria-hidden
            />
          )}
          <div
            ref={refs.widgetRef}
            className="echly-sidebar-container"
            style={
              extensionMode
                ? {
                    position: "fixed",
                    ...(state.position
                      ? { left: state.position.x, top: state.position.y }
                      : { bottom: "24px", right: "24px" }),
                    zIndex: 2147483647,
                    pointerEvents: "auto",
                  }
                : undefined
            }
          >
            {extensionMode && captureMode === "voice" && micDropdownOpen && (
              <MicrophonePanel
                devices={microphones}
                selectedDeviceId={selectedMicrophone}
                onSelect={setSelectedMicrophone}
                onClose={() => setMicDropdownOpen(false)}
              />
            )}

            <div className="echly-sidebar-surface" data-theme={theme}>
              {/* ── Case 1: Session limit upgrade view ── */}
              {effectiveSessionLimitReached && !sessionId ? (
                <>
                  <CaptureHeader
                    onClose={handleClose}
                    showOnlyClose
                    theme={theme}
                  />
                  <div className="echly-sidebar-body echly-upgrade-card-body">
                    <SessionLimitUpgradeView
                      limitMessage={effectiveSessionLimitReached.message ?? ""}
                      upgradePlan={effectiveSessionLimitReached.upgradePlan}
                      onUpgrade={() => {
                        onOpenBilling?.();
                        handlers.setSessionLimitReached(null);
                      }}
                      getAssetUrl={getAssetUrl}
                    />
                  </div>
                </>
              ) : extensionMode && showHomeScreen ? (
                /* ── Case 2: Extension home screen → V2 design ── */
                <div className="echly-v2">
                  {showPreviousFeedback ? (
                    <PreviousFeedbackView
                      onBack={() => {
                        setShowPreviousFeedback(false);
                        if (openResumeModalProp) onResumeModalClose?.();
                      }}
                      onClose={handleClose}
                      onResumeSession={(sid) => {
                        setShowCommandScreen(false);
                        setShowPreviousFeedback(false);
                        onPreviousSessionSelect?.(sid);
                        onResumeModalClose?.();
                      }}
                      fetchSessions={fetchSessions}
                      onOpenLogin={onTriggerLogin}
                    />
                  ) : showModeSelection ? (
                    <ModeSelectionView
                      captureMode={captureMode}
                      onModeChange={setMode}
                      onBegin={() => {
                        handlers.startSession();
                        setShowModeSelection(false);
                      }}
                      onBack={() => setShowModeSelection(false)}
                      onClose={handleClose}
                    />
                  ) : (
                    /* V2 Home Screen */
                    <div className="pill pill-default">
                      {sessionStartErrorBanner && (
                        <div
                          className="echly-feedback-failed echly-recovery-failed-banner"
                          role="alert"
                          style={{ margin: 0, borderRadius: 0 }}
                        >
                          <span className="echly-failed-text">{sessionStartErrorBanner}</span>
                          {onSessionStartErrorDismiss && (
                            <button
                              type="button"
                              onClick={onSessionStartErrorDismiss}
                              style={{
                                marginLeft: 8,
                                background: "transparent",
                                border: "none",
                                color: "inherit",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      )}

                      {/* Header */}
                      <div className="pill-head">
                        <span className="pill-mark">E</span>
                        <div className="pill-ws">
                          <span className="pill-ws-name">Echly</span>
                          {sessionTitleProp && (
                            <>
                              <span className="pill-ws-sep">·</span>
                              <span className="pill-ws-page">{sessionTitleProp}</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          className="pill-icon-btn"
                          onClick={onThemeToggle}
                          aria-label="Settings"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M8 1.7v1.4M8 12.9v1.4M14.3 8h-1.4M3.1 8H1.7M12.5 3.5l-1 1M4.5 11.5l-1 1M12.5 12.5l-1-1M4.5 4.5l-1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="pill-icon-btn"
                          onClick={handleClose}
                          aria-label="Close"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <div className="pill-rule" />

                      {/* Body */}
                      <div className="pill-body">
                        <button
                          type="button"
                          className="start-btn"
                          style={{ backgroundColor: "#1775E0" }}
                          onClick={async () => {
                            if (isStartingSession) return;

                            if (extensionMode && typeof chrome !== "undefined" && chrome?.runtime?.sendMessage) {
                              try {
                                const authState = await chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" });
                                if (!authState?.authenticated) {
                                  chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" });
                                  return;
                                }
                              } catch {
                                // If message fails, let it through — startSession will catch it
                              }
                            } else if (ensureAuthenticated && !(await ensureAuthenticated())) {
                              return;
                            }

                            setShowModeSelection(true);
                          }}
                          disabled={isStartingSession}
                        >
                          <span className="start-glyph">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
                              <circle cx="8" cy="8" r="3" fill="currentColor" />
                            </svg>
                          </span>
                          <span>Start Session</span>
                          <span className="start-meta">
                            <span className="kbd">⌘</span>
                            <span className="kbd">⇧</span>
                            <span className="kbd">E</span>
                          </span>
                        </button>

                        <div className="secondary-row">
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={handlePreviousSessions}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Previous Feedback
                            <span className="count">14</span>
                          </button>
                          <div className="mode-seg-mini" role="tablist" aria-label="Feedback mode">
                            <button
                              type="button"
                              className={captureMode === "voice" ? "active" : ""}
                              onClick={() => setMode("voice")}
                              aria-label="Voice mode"
                              role="tab"
                              aria-selected={captureMode === "voice"}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                <rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={captureMode === "text" ? "active" : ""}
                              onClick={() => setMode("text")}
                              aria-label="Write mode"
                              role="tab"
                              aria-selected={captureMode === "text"}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                <path d="M2.5 12.5l1-3 7-7 2 2-7 7-3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M9.5 4l2 2" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pill-foot">
                        <span className="pill-foot-left">
                          <span className="ai-dot" aria-hidden />
                          AI ready · {captureMode === "voice" ? "Voice" : "Write"} mode
                        </span>
                        <span className="pill-foot-right">v1.4.2</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : extensionMode && sessionModeActive ? (
                /* ── Case 3a: Extension V2 session view (Phase 4) ── */
                <div className="echly-v2">
                  <div className="pill pill-tickets">

                    {/* ── Session header ── */}
                    <div className="tl-head">
                      <span className="pill-mark">E</span>
                      <div className="tl-title-block">
                        <div className="tl-eyebrow">
                          <span className="live-dot" aria-hidden />
                          {globalSessionPaused ? "Paused" : "Active session"}
                        </div>
                        <div className="tl-title">
                          {sessionTitleProp ?? sessionTitle ?? "Feedback Session"}
                        </div>
                      </div>
                      <span className="tl-count">
                        {sessionHeaderCount > 0
                          ? `${sessionHeaderCount} ${sessionHeaderCount === 1 ? "ticket" : "tickets"}`
                          : "0"}
                      </span>
                      <button
                        type="button"
                        className="pill-icon-btn"
                        onClick={handleClose}
                        aria-label="Close"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="pill-rule" />

                    {/* ── Session starting ── */}
                    {isStartingSession && (
                      <div className="tl-session-starting" aria-live="polite" aria-busy="true">
                        <span className="echly-spinner" aria-hidden />
                        <span>Starting session...</span>
                      </div>
                    )}

                    {/* ── Recovery / failed banners ── */}
                    {sessionModeActive && !sessionLoading && feedbackRecovering && (
                      <div className="echly-feedback-failed echly-recovery-failed-banner" role="alert" style={{ margin: 0, borderRadius: 0 }}>
                        <span className="echly-failed-text">
                          Retrying feedback sync... (attempt {Math.max(1, feedbackRecoveryAttempts)}/5)
                        </span>
                      </div>
                    )}
                    {sessionModeActive && !sessionLoading && !feedbackRecovering && feedbackFetchFailed && (
                      <div className="echly-feedback-failed echly-recovery-failed-banner" role="alert" style={{ margin: 0, borderRadius: 0 }}>
                        <span className="echly-failed-text">
                          Temporary sync issue. We will retry on your next scroll or refresh.
                        </span>
                      </div>
                    )}

                    {/* ── Scrollable ticket list ── */}
                    <div
                      ref={listScrollRefCallback}
                      className="tl-list"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {/* Loading state */}
                      {sessionLoading && (
                        <div className="tl-loading-state" aria-live="polite" aria-busy="true">
                          <div className="tl-loading-icon" aria-hidden>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <path d="M4 4h10l4 4v12H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                              <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                              <path d="M8 11h8M8 14h6M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <span className="tl-loading-text">Loading session...</span>
                        </div>
                      )}

                      {/* Processing skeleton card */}
                      {!sessionLoading && (
                        feedbackJobs?.some((j) => j.status === "processing") ||
                        (!feedbackJobs?.length && isProcessingFeedback)
                      ) && (
                        <div className="ticket processing" aria-live="polite">
                          <span className="ticket-thumb" aria-hidden />
                          <div className="ticket-main">
                            <div className="skel-line w-70" aria-hidden />
                            <div className="skel-line w-45" aria-hidden />
                          </div>
                          <span className="ticket-process-status">
                            Processing
                            <span className="dots">
                              <span />
                              <span />
                              <span />
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Failed job cards */}
                      {!sessionLoading && feedbackJobs?.filter((j) => j.status === "failed").map((job) => (
                        <div key={job.id} className="tl-failed-card" role="alert">
                          {job.errorMessage ?? "AI processing failed."}
                        </div>
                      ))}

                      {/* Ticket cards */}
                      {!sessionLoading && hasTickets && state.pointers.map((p) => (
                        <FeedbackItem
                          key={p.id}
                          item={p}
                          onUpdate={onUpdate ?? handlers.updatePointer}
                          onDelete={handlers.deletePointer}
                          highlightTicketId={state.highlightTicketId}
                          onExpandChange={handlers.setExpandedId}
                        />
                      ))}

                      {/* Empty state */}
                      {!sessionLoading &&
                        !hasTickets &&
                        !isProcessingFeedback &&
                        !(feedbackJobs && feedbackJobs.length > 0) && (
                          <div className="tl-empty" aria-live="polite">
                            <div className="tl-empty-icon" aria-hidden>
                              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                <path
                                  d="M2.5 4.5L8 1.5l5.5 3v7L8 14.5 2.5 11.5v-7zM2.5 4.5L8 7.5l5.5-3M8 7.5V14.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div className="tl-empty-title">No feedback yet</div>
                            <div className="tl-empty-sub">
                              Click any element on the page to capture it — Echly will turn what you say into a ticket.
                            </div>
                          </div>
                        )}
                    </div>

                    {/* ── Pinned footer ── */}
                    <div className="tl-foot">
                      <span className="tl-foot-left">
                        <span className="ai-dot" aria-hidden />
                        AI · {hasTickets ? "auto-structured" : "ready"}
                      </span>
                      <span className="tl-foot-kbd">⌘⇧E to capture</span>
                    </div>

                  </div>
                </div>
              ) : (
                /* ── Case 3b: Non-extension or legacy session view ── */
                <>
                  <CaptureHeader
                    onClose={handleClose}
                    showSessionTitle={!(effectiveSessionLimitReached && !sessionId) && (hasTickets || sessionModeActive || sessionLoading)}
                    sessionTitle={sessionTitleProp ?? sessionTitle ?? "Untitled Session"}
                    onSessionTitleChange={onSessionTitleChangeProp ?? setSessionTitle}
                    openTicketCount={sessionHeaderCount}
                    title={undefined}
                    summary={summary}
                    showHomeButton={extensionMode && !(effectiveSessionLimitReached && !sessionId)}
                    theme={theme}
                    onThemeToggle={isStartingSession ? undefined : onThemeToggle}
                    captureMode={captureMode}
                    onCaptureModeToggle={isStartingSession ? undefined : (extensionMode ? () => setMode(captureMode === "voice" ? "text" : "voice") : undefined)}
                    onShowCommandScreen={() => setShowCommandScreen(true)}
                    showOnlyClose={false}
                    onOpenDashboard={onOpenDashboard}
                  />

                  <div
                    className="echly-sidebar-body"
                    style={isStartingSession ? { pointerEvents: "none", opacity: 0.85 } : undefined}
                  >
                    {isStartingSession && (
                      <div className="echly-session-loading-state" aria-live="polite" aria-busy="true">
                        <span className="echly-spinner" aria-hidden />
                        <span className="echly-session-loading-text">Starting session...</span>
                      </div>
                    )}
                    {sessionModeActive && sessionLoading && (
                      <div className="echly-session-loading-state" aria-live="polite" aria-busy="true">
                        <span className="echly-spinner" aria-hidden />
                        <span className="echly-session-loading-text">Loading session...</span>
                      </div>
                    )}
                    {sessionModeActive && !sessionLoading && feedbackRecovering && (
                      <div className="echly-session-loading-state echly-recovery-loading-state" aria-live="polite" aria-busy="true">
                        <span className="echly-spinner" aria-hidden />
                        <span className="echly-session-loading-text">
                          Retrying feedback sync... (attempt {Math.max(1, feedbackRecoveryAttempts)}/5)
                        </span>
                      </div>
                    )}
                    {sessionModeActive && !sessionLoading && !feedbackRecovering && feedbackFetchFailed && (
                      <div className="echly-feedback-failed echly-recovery-failed-banner" aria-live="polite">
                        <span className="echly-failed-text">
                          Temporary sync issue. We will retry on your next scroll or refresh.
                        </span>
                      </div>
                    )}
                    {((hasTickets || isProcessingFeedback || (feedbackJobs && feedbackJobs.length > 0)) && (sessionModeActive || !extensionMode) && !sessionLoading) && (
                      <div
                        ref={listScrollRefCallback}
                        className="echly-feedback-list-scroll"
                        style={{ overflowY: "auto", maxHeight: "100%" }}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="echly-feedback-list">
                          {feedbackJobs?.filter((j) => j.status === "processing").map((job) => (
                            <div key={job.id} id="processing_card_markup" className="echly-feedback-card echly-feedback-processing" aria-live="polite">
                              <span className="echly-spinner" aria-hidden />
                              <span className="echly-processing-text">
                                Processing feedback...
                              </span>
                            </div>
                          ))}
                          {feedbackJobs?.filter((j) => j.status === "failed").map((job) => (
                            <div key={job.id} className="echly-feedback-card echly-feedback-failed" aria-live="polite">
                              <span className="echly-failed-text">{job.errorMessage ?? "AI processing failed."}</span>
                            </div>
                          ))}
                          {!feedbackJobs?.length && isProcessingFeedback && (
                            <div id="processing_card_markup" className="echly-feedback-card echly-feedback-processing">
                              <span className="echly-spinner" aria-hidden />
                              <span className="echly-processing-text">
                                Processing feedback...
                              </span>
                            </div>
                          )}
                          {hasTickets &&
                            state.pointers.map((p) => (
                              <FeedbackItem
                                key={p.id}
                                item={p}
                                onUpdate={onUpdate ?? handlers.updatePointer}
                                onDelete={handlers.deletePointer}
                                highlightTicketId={state.highlightTicketId}
                                onExpandChange={handlers.setExpandedId}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                    {sessionModeActive && !hasTickets && !isProcessingFeedback && !(feedbackJobs && feedbackJobs.length > 0) && !sessionLoading && (
                      <div className="echly-empty-session-state" aria-live="polite">
                        <span className="echly-empty-session-text">No feedback yet. Add feedback from the page.</span>
                      </div>
                    )}
                    {state.errorMessage && (
                      <div className="echly-sidebar-error">
                        {state.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Non-extension home screen footer */}
                  {!extensionMode && showHomeScreen && (
                    <>
                      <div className="echly-command-divider" aria-hidden />
                      <WidgetFooter
                        isIdle={!isStartingSession}
                        onAddFeedback={handlers.handleAddFeedback}
                        startCapture={handlers.startCapture}
                        extensionMode={false}
                        onStartSession={handlers.startSession}
                        onOpenPreviousSession={handlePreviousSessions}
                        openingPrevious={false}
                        hasActiveSession={hasStoredSession}
                        captureDisabled={captureDisabled}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* S9: Keep Recording hint pill — portaled into capture root so it floats above the page */}
      {keepRecordingVisible && captureRootEl && createPortal(
        <KeepRecordingPill onDismiss={() => setKeepRecordingVisible(false)} />,
        captureRootEl
      )}
    </>
  );
}
