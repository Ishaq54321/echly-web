"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, PenLine, Zap } from "lucide-react";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
import { ResumeSessionModal } from "./ResumeSessionModal";
import { MicrophonePanel } from "./MicrophonePanel";
import type { CaptureWidgetProps, CaptureState } from "./types";

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
  sessionLoading = false,
  onSessionLoaded,
  onSessionEnd: onSessionEndCallback,
  onCreateSession,
  onActiveSessionChange,
  globalSessionModeActive,
  globalSessionPaused,
  onSessionModeStart,
  onSessionModePause,
  onSessionModeResume,
  onSessionModeEnd,
  onSessionActivity,
  captureMode = "voice",
  captureRootParent,
  isProcessingFeedback = false,
  feedbackJobs,
  launcherLogoUrl,
  sessionTitleProp,
  onSessionTitleChange: onSessionTitleChangeProp,
}: CaptureWidgetProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  /** Extension: when true, show command screen (mode cards + footer). False when viewing a session (e.g. after Open Previous or when paused). */
  const [showCommandScreen, setShowCommandScreen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
  const [visibleTickets, setVisibleTickets] = useState(10);
  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [micDropdownOpen, setMicDropdownOpen] = useState(false);
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
  onSessionViewRequested: extensionMode ? () => setShowCommandScreen(false) : undefined,
  globalSessionModeActive,
    globalSessionPaused,
    onSessionModeStart,
    onSessionModePause,
    onSessionModeResume,
    onSessionModeEnd,
    onSessionActivity,
    captureMode,
    selectedMicrophoneId: selectedMicrophone || undefined,
    captureRootParent,
  });

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
  const listScrollRef = useRef<HTMLDivElement>(null);

  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state) || state.pillExiting;
  const hasStoredSession = Boolean(sessionId);
  const showSidebar = !isInCaptureFlow && !state.sessionMode;
  /** Session sidebar visible when session is active or paused; hide only when session ends. */
  const shouldShowTray = globalSessionModeActive === true || globalSessionPaused === true;
  const showSessionSidebar = extensionMode && shouldShowTray;
  const showFloatingButton = !effectiveIsOpen && (showSidebar || showSessionSidebar);
  const showPanel = effectiveIsOpen && (showSidebar || showSessionSidebar);

  const hasTickets = Boolean(state.pointers?.length);
  /** When true, we are in an active or paused session; always render session layout (ticket list or empty state), never home. */
  const sessionModeActive = globalSessionModeActive === true || globalSessionPaused === true;
  /** Home screen (mode tiles + Start Session / Previous Sessions footer) only when not in a session. */
  const showHomeScreen = !sessionModeActive;
  const showPreviousButton = Boolean(hasPreviousSessions);

  const openTicketsCount = state.pointers.filter((p) => {
    const status = (p as { status?: string }).status;
    const isResolved = (p as { isResolved?: boolean }).isResolved;
    if (status === "resolved" || isResolved === true) return false;
    return true;
  }).length;

  // Lazy-load: reset when list shrinks, cap visible to actual length
  const ticketsToShow = state.pointers.slice(0, Math.min(visibleTickets, state.pointers.length));
  const handleListScroll = React.useCallback(() => {
    const el = listScrollRef.current;
    if (!el || state.pointers.length <= visibleTickets) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollRatio = (scrollTop + clientHeight) / scrollHeight;
    if (scrollRatio > 0.8) {
      setVisibleTickets((prev) => Math.min(prev + 10, state.pointers.length));
    }
  }, [state.pointers.length, visibleTickets]);
  useEffect(() => {
    if (state.pointers.length < visibleTickets) {
      setVisibleTickets((prev) => Math.min(prev, Math.max(10, state.pointers.length)));
    }
  }, [state.pointers.length, visibleTickets]);
  const highPriorityCount = state.pointers.filter((p) =>
    /critical|bug|high|urgent/i.test(p.type || "")
  ).length;
  const summary =
    openTicketsCount > 0
      ? highPriorityCount > 0
        ? `${highPriorityCount} need attention`
        : null
      : null;

  useEffect(() => {
    if (state.highlightTicketId && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.highlightTicketId]);

  /** When session is loaded explicitly (user selected from Previous Sessions), transition to session view. */
  useEffect(() => {
    if (loadSessionWithPointers?.sessionId) {
      setShowCommandScreen(false);
    }
  }, [loadSessionWithPointers?.sessionId]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  const handlePreviousSessions = React.useCallback(() => {
    setResumeModalOpen(true);
  }, []);

  function setMode(mode: "voice" | "text") {
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: "ECHLY_SET_CAPTURE_MODE", mode });
    }
  }

  useEffect(() => {
    if (!extensionMode) return;
    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (cancelled) return;
        const inputs = devices.filter((d) => d.kind === "audioinput");
        setMicrophones(inputs.map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${inputs.indexOf(d) + 1}` })));
        if (inputs.length && !selectedMicrophone) setSelectedMicrophone(inputs[0].deviceId || "");
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [extensionMode]);


  return (
    <>
      {extensionMode && fetchSessions && onPreviousSessionSelect && (
        <ResumeSessionModal
          open={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          fetchSessions={fetchSessions}
          onSelectSession={(sessionId) => {
            setShowCommandScreen(false);
            onPreviousSessionSelect(sessionId);
            setResumeModalOpen(false);
          }}
          theme={theme}
        />
      )}
      {/* Capture layer: portaled into #echly-capture-root. Never inside sidebar. */}
      {captureRootEl && (
          <CaptureLayer
            captureRoot={captureRootEl}
            extensionMode={extensionMode}
            state={state.state}
            getFullTabImage={handlers.getFullTabImage}
            onRegionCaptured={handlers.handleRegionCaptured}
            onRegionSelectStart={handlers.handleRegionSelectStart}
            onCancelCapture={handlers.handleCancelCapture}
            sessionMode={state.sessionMode}
            globalSessionModeActive={globalSessionModeActive}
            sessionId={sessionId}
            sessionPaused={state.sessionPaused}
            pausePending={state.pausePending}
            endPending={state.endPending}
            sessionFeedbackPending={state.sessionFeedbackPending}
            captureMode={captureMode}
            listeningAudioLevel={state.listeningAudioLevel ?? 0}
            audioAnalyser={state.audioAnalyser ?? null}
            onSessionElementClicked={handlers.handleSessionElementClicked}
            onSessionPause={() => {
              handlers.pauseSession();
              onExpandRequest?.();
            }}
            onSessionResume={() => {
              handlers.resumeSession();
            }}
            onSessionEnd={() => {
              handlers.endSession(() => {
                setShowCommandScreen(true);
                onSessionEndCallback?.();
              });
            }}
            onSessionRecordVoice={handlers.handleSessionStartVoice}
            onSessionDoneVoice={handlers.finishListening}
            onSessionSaveText={handlers.handleSessionFeedbackSubmit}
            onSessionFeedbackCancel={handlers.handleSessionFeedbackCancel}
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
              <CaptureHeader
                onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
                showSessionTitle={hasTickets || sessionModeActive || sessionLoading}
                sessionTitle={sessionTitleProp ?? sessionTitle ?? "Untitled Session"}
                onSessionTitleChange={onSessionTitleChangeProp ?? setSessionTitle}
                openTicketCount={openTicketsCount}
                title={undefined}
                summary={summary}
                showHomeButton={extensionMode}
                theme={theme}
                onThemeToggle={onThemeToggle}
                captureMode={captureMode}
                onCaptureModeToggle={extensionMode ? () => setMode(captureMode === "voice" ? "text" : "voice") : undefined}
                onShowCommandScreen={() => setShowCommandScreen(true)}
              />

              <div
                ref={listScrollRef}
                className="echly-sidebar-body"
                onScroll={handleListScroll}
                onWheel={(e) => e.stopPropagation()}
              >
                {sessionModeActive && sessionLoading && (
                  <div className="echly-session-loading-state" aria-live="polite" aria-busy="true">
                    <span className="echly-spinner" aria-hidden />
                    <span className="echly-session-loading-text">Loading session...</span>
                  </div>
                )}
                {((hasTickets || isProcessingFeedback || (feedbackJobs && feedbackJobs.length > 0)) && (sessionModeActive || !extensionMode) && !sessionLoading) && (
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
                      ticketsToShow.map((p) => (
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
                )}
                {sessionModeActive && !hasTickets && !isProcessingFeedback && !(feedbackJobs && feedbackJobs.length > 0) && !sessionLoading && (
                  <div className="echly-empty-session-state" aria-live="polite">
                    <span className="echly-empty-session-text">No feedback yet. Add feedback from the page.</span>
                  </div>
                )}
                {extensionMode && showHomeScreen && (
                  <div className="echly-mode-container">
                    <div className="echly-mode-header-block">
                      <div className="echly-ai-powered" aria-hidden>
                        <Zap size={12} strokeWidth={2} aria-hidden />
                        <span>Powered by GPT-4 + Whisper</span>
                      </div>
                      <div className="echly-mode-header">Select feedback mode</div>
                    </div>
                    <div
                      className={`echly-mode-tile echly-mode-card voice-mode ${captureMode === "voice" ? "selected" : ""}`}
                      onClick={() => {
                        if (captureMode !== "voice") {
                          setMode("voice");
                        } else {
                          setMicDropdownOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (captureMode !== "voice") {
                            setMode("voice");
                          } else {
                            setMicDropdownOpen(true);
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={captureMode === "voice"}
                      aria-label={captureMode === "voice" ? "Voice (Recommended). Click to select microphone." : "Voice (Recommended)"}
                    >
                      <span className="echly-mode-card-icon echly-mic-trigger" aria-hidden>
                        <Mic size={18} strokeWidth={2} />
                      </span>
                      <span className="echly-mode-card-title">Voice (Recommended)</span>
                    </div>
                    <div
                      className={`echly-mode-tile echly-mode-card text-mode ${captureMode === "text" ? "selected" : ""}`}
                      onClick={() => setMode("text")}
                      onKeyDown={(e) => e.key === "Enter" && setMode("text")}
                      role="button"
                      tabIndex={0}
                      aria-pressed={captureMode === "text"}
                    >
                      <span className="echly-mode-card-icon">
                        <PenLine className="mode-icon" size={18} strokeWidth={2} />
                      </span>
                      <span className="echly-mode-card-title">Write</span>
                    </div>
                  </div>
                )}

                {state.errorMessage && (
                  <div className="echly-sidebar-error">
                    {state.errorMessage}
                  </div>
                )}
              </div>

              {showHomeScreen && (
                <>
                  <div className="echly-command-divider" aria-hidden />
                  <WidgetFooter
                  isIdle={true}
                  onAddFeedback={handlers.handleAddFeedback}
                  extensionMode={extensionMode}
                  onStartSession={extensionMode ? handlers.startSession : undefined}
                  onOpenPreviousSession={
                    extensionMode && showPreviousButton && fetchSessions && onPreviousSessionSelect
                      ? handlePreviousSessions
                      : undefined
                  }
                  hasActiveSession={hasStoredSession}
                  captureDisabled={captureDisabled}
                />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
