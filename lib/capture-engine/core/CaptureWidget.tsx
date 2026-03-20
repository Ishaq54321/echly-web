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
import { SessionLimitUpgradeView } from "./SessionLimitUpgradeView";
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
  totalCount,
  openCount,
  skippedCount,
  resolvedCount,
  sessionLoading = false,
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
  environment,
  onPreviousSessions,
  onSetCaptureMode,
  onOpenBilling,
  onOpenDashboard,
  getAssetUrl,
}: CaptureWidgetProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const showResumeModal = resumeModalOpen || (openResumeModalProp ?? false);
  /** Extension: when true, show command screen (mode cards + footer). False when viewing a session (e.g. after Open Previous or when paused). */
  const [showCommandScreen, setShowCommandScreen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
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
    ensureAuthenticated,
    onSessionViewRequested: extensionMode
      ? () => {
          console.log("[ECHLY DEBUG] UI entering session mode", performance.now());
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
    captureRootParent,
    environment,
  });

  /** Session limit: prop (from parent e.g. extension) takes precedence; otherwise use hook state (set when startSession returns limitReached). */
  const effectiveSessionLimitReached = sessionLimitReached ?? state.sessionLimitReached;

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
  const listScrollRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state) || state.pillExiting;
  const optimisticSessionActive = state.sessionStatus === "starting" || state.sessionStatus === "active";
  const hasStoredSession = Boolean(sessionId) || optimisticSessionActive;
  const showSidebar = !isInCaptureFlow && !state.sessionMode;
  /** Session sidebar visible when session is active or paused; hide only when session ends. */
  const shouldShowTray = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
  const showSessionSidebar = extensionMode && shouldShowTray;
  const showFloatingButton = !effectiveIsOpen && (showSidebar || showSessionSidebar);
  const showPanel = effectiveIsOpen && (showSidebar || showSessionSidebar);

  const hasTickets = Boolean(state.pointers?.length);
  /** When true, we are in an active or paused session; always render session layout (ticket list or empty state), never home. */
  const sessionModeActive = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
  /** Home screen (mode tiles + Start Session / Previous Sessions footer) only when not in a session. */
  const showHomeScreen = !sessionModeActive;
  const isStartingSession = state.sessionStatus === "starting";

  const openTicketsCount = extensionMode
    ? (typeof openCount === "number" ? openCount : 0)
    : state.pointers.filter((p) => {
        const status = (p as { status?: string }).status;
        const isResolved = (p as { isResolved?: boolean }).isResolved;
        if (status === "resolved" || isResolved === true) return false;
        return true;
      }).length;
  const skippedTicketsCount = extensionMode
    ? (typeof skippedCount === "number" ? skippedCount : 0)
    : state.pointers.filter((p) => (p as { status?: string }).status === "skipped").length;
  const resolvedTicketsCount = extensionMode
    ? (typeof resolvedCount === "number" ? resolvedCount : 0)
    : state.pointers.filter((p) => {
        const status = (p as { status?: string }).status;
        const isResolved = (p as { isResolved?: boolean }).isResolved;
        return status === "resolved" || isResolved === true;
      }).length;
  const sessionHeaderCount =
    extensionMode && typeof totalCount === "number"
      ? totalCount
      : openTicketsCount;

  const highPriorityCount = state.pointers.filter((p) =>
    /critical|bug|high|urgent/i.test(p.type || "")
  ).length;
  const summary = extensionMode
    ? `${typeof totalCount === "number" ? totalCount : 0} total · ${openTicketsCount} open · ${skippedTicketsCount} skipped · ${resolvedTicketsCount} resolved`
    : openTicketsCount > 0
      ? highPriorityCount > 0
        ? `${highPriorityCount} need attention`
        : null
      : null;

  useEffect(() => {
    if (state.highlightTicketId && listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.highlightTicketId]);

  useEffect(() => {
    const el = listScrollRef.current;
    if (!el) {
      console.debug("[ECHLY UI] scrollRef not ready yet");
      return;
    }

    console.log("✅ React scroll container ready", el);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const { scrollTop, clientHeight, scrollHeight } = el;
        const threshold = 200;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

        console.log("SCROLL CHECK", {
          scrollTop,
          clientHeight,
          scrollHeight,
          isNearBottom,
        });

        if (
          extensionMode &&
          isNearBottom &&
          !isFetchingRef.current &&
          typeof chrome !== "undefined" &&
          chrome.runtime?.sendMessage
        ) {
          isFetchingRef.current = true;
          console.log("🔥 LOAD MORE (REACT)");
          chrome.runtime.sendMessage({ type: "ECHLY_LOAD_MORE" }, () => {
            isFetchingRef.current = false;
          });
        }
      }, 50);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
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
  ]);

  /** When session is loaded explicitly (user selected from Previous Sessions), transition to session view. */
  useEffect(() => {
    if (loadSessionWithPointers?.sessionId) {
      setShowCommandScreen(false);
    }
  }, [loadSessionWithPointers?.sessionId]);

  /** Safety log when rendering SessionLimitUpgradeView (session limit reached). */
  useEffect(() => {
    if (effectiveSessionLimitReached && !sessionId) {
      console.log("[ECHLY DEBUG] Rendering SessionLimitUpgradeView");
    }
  }, [effectiveSessionLimitReached, sessionId]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  const handlePreviousSessions = React.useCallback(() => {
    console.log("[ECHLY UX] Opening modal instantly");
    onPreviousSessions?.();
    setResumeModalOpen(true);
  }, [onPreviousSessions]);

  function setMode(mode: "voice" | "text") {
    if (onSetCaptureMode) {
      onSetCaptureMode(mode);
    } else {
      onCaptureModeChange?.(mode);
    }
  }

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
                showSessionTitle={!(effectiveSessionLimitReached && !sessionId) && (hasTickets || sessionModeActive || sessionLoading)}
                sessionTitle={sessionTitleProp ?? sessionTitle ?? "Untitled Session"}
                onSessionTitleChange={onSessionTitleChangeProp ?? setSessionTitle}
                openTicketCount={sessionHeaderCount}
                title={undefined}
                summary={summary}
                showHomeButton={extensionMode && !(effectiveSessionLimitReached && !sessionId)}
                theme={theme}
                onThemeToggle={effectiveSessionLimitReached && !sessionId ? undefined : isStartingSession ? undefined : onThemeToggle}
                captureMode={captureMode}
                onCaptureModeToggle={effectiveSessionLimitReached && !sessionId ? undefined : isStartingSession ? undefined : (extensionMode ? () => setMode(captureMode === "voice" ? "text" : "voice") : undefined)}
                onShowCommandScreen={() => setShowCommandScreen(true)}
                showOnlyClose={Boolean(effectiveSessionLimitReached && !sessionId)}
                onOpenDashboard={onOpenDashboard}
              />

              {effectiveSessionLimitReached && !sessionId ? (
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
              ) : (
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
                {((hasTickets || isProcessingFeedback || (feedbackJobs && feedbackJobs.length > 0)) && (sessionModeActive || !extensionMode) && !sessionLoading) && (
                  <div
                    ref={listScrollRef}
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
                        if (isStartingSession) return;
                        if (captureMode !== "voice") {
                          setMode("voice");
                        } else {
                          setMicDropdownOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isStartingSession) return;
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
                      onClick={() => {
                        if (isStartingSession) return;
                        setMode("text");
                      }}
                      onKeyDown={(e) => {
                        if (isStartingSession) return;
                        if (e.key === "Enter") setMode("text");
                      }}
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
              )}

              {!(effectiveSessionLimitReached && !sessionId) && showHomeScreen && (
                <>
                  <div className="echly-command-divider" aria-hidden />
                  <WidgetFooter
                  isIdle={!isStartingSession}
                  onAddFeedback={handlers.handleAddFeedback}
                  startCapture={handlers.startCapture}
                  extensionMode={extensionMode}
                  onStartSession={handlers.startSession}
                  onOpenPreviousSession={handlePreviousSessions}
                  openingPrevious={false}
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
