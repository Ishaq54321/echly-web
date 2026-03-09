"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackItem from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
import { ResumeSessionModal } from "./ResumeSessionModal";
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
  lastKnownSessionId = null,
  onResumeSessionSelect,
  loadSessionWithPointers,
  pointers: pointersProp,
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
}: CaptureWidgetProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  /** Extension: when true, show command screen (3 buttons only). False when viewing a session (e.g. after Open Previous or when paused). */
  const [showCommandScreen, setShowCommandScreen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
  const [visibleTickets, setVisibleTickets] = useState(10);
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
    globalSessionModeActive,
    globalSessionPaused,
    onSessionModeStart,
    onSessionModePause,
    onSessionModeResume,
    onSessionModeEnd,
  });

  const isControlled = expanded !== undefined;
  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
  const listScrollRef = useRef<HTMLDivElement>(null);

  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state) || state.pillExiting;
  const hasStoredSession = Boolean(sessionId);
  const showSidebar = !isInCaptureFlow && !state.sessionMode;
  const showPanelWhenPaused = state.sessionMode && state.sessionPaused;
  const showFloatingButton = !effectiveIsOpen && showSidebar && !showPanelWhenPaused;
  const showPanel = (effectiveIsOpen && showSidebar) || showPanelWhenPaused;

  const hasTickets = Boolean(state.pointers?.length);
  const showSessionButtons = !hasTickets && state.state === "idle";
  const showResumeButton = Boolean(lastKnownSessionId) || hasStoredSession;
  const showPreviousButton = Boolean(hasPreviousSessions);

  // Collapse the widget while recording (controlled mode via background)
  const didCollapseRef = useRef(false);
  useEffect(() => {
    if (!isInCaptureFlow) {
      didCollapseRef.current = false;
      return;
    }
    if (didCollapseRef.current) return;
    didCollapseRef.current = true;
    onCollapseRequest?.();
  }, [isInCaptureFlow, onCollapseRequest]);

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

  /** When session is loaded explicitly (user clicked Resume), transition to session view. Never from global state. */
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

  const handleResumeActiveSession = React.useCallback(() => {
    const sessionToResume = lastKnownSessionId ?? sessionId;
    if (!sessionToResume) return;
    onResumeSessionSelect?.(sessionToResume, { enterCaptureImmediately: true });
  }, [lastKnownSessionId, sessionId, onResumeSessionSelect]);

  return (
    <>
      {extensionMode && fetchSessions && onResumeSessionSelect && (
        <ResumeSessionModal
          open={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          fetchSessions={fetchSessions}
          onSelectSession={(sessionId) => {
            setShowCommandScreen(false);
            onResumeSessionSelect(sessionId);
            setResumeModalOpen(false);
          }}
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
            onSessionElementClicked={handlers.handleSessionElementClicked}
            onSessionPause={() => {
              handlers.pauseSession();
              onExpandRequest?.();
            }}
            onSessionResume={() => {
              handlers.resumeSession();
              onCollapseRequest?.();
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
            onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
            className="echly-floating-trigger"
          >
            {extensionMode ? "Echly" : "Capture feedback"}
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
            <div className="echly-sidebar-surface">
              <CaptureHeader
                onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
                showSessionTitle={hasTickets}
                sessionTitle={sessionTitle}
                onSessionTitleChange={setSessionTitle}
                openTicketCount={openTicketsCount}
                title={undefined}
                summary={summary}
                theme={theme}
                onThemeToggle={onThemeToggle}
                onShowCommandScreen={() => setShowCommandScreen(true)}
              />

              <div
                ref={listScrollRef}
                className="echly-sidebar-body"
                onScroll={handleListScroll}
                onWheel={(e) => e.stopPropagation()}
              >
                {hasTickets && (
                  <div className="echly-feedback-list">
                    {ticketsToShow.map((p) => (
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

                {state.errorMessage && (
                  <div className="echly-sidebar-error">
                    {state.errorMessage}
                  </div>
                )}
              </div>

              {showSessionButtons && (
                <WidgetFooter
                  isIdle={true}
                  onAddFeedback={handlers.handleAddFeedback}
                  extensionMode={extensionMode}
                  onStartSession={extensionMode ? handlers.startSession : undefined}
                  onResumeSession={
                    extensionMode && showResumeButton ? handleResumeActiveSession : undefined
                  }
                  onOpenPreviousSession={
                    extensionMode && showPreviousButton && fetchSessions && onResumeSessionSelect
                      ? () => setResumeModalOpen(true)
                      : undefined
                  }
                  hasActiveSession={hasStoredSession}
                  captureDisabled={captureDisabled}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
