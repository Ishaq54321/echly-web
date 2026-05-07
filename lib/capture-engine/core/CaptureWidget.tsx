"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCaptureWidget } from "./hooks/useCaptureWidget";
import CaptureHeader from "./CaptureHeader";
import FeedbackItem, { TicketEditorOverlay } from "./FeedbackItem";
import WidgetFooter from "./WidgetFooter";
import { CaptureLayer } from "./CaptureLayer";
import { ResumeSessionModal } from "./ResumeSessionModal";
import { MicrophonePanel } from "./MicrophonePanel";
import { SessionLimitUpgradeView } from "./SessionLimitUpgradeView";
import ModeSelectionView from "./ModeSelectionView";
import PreviousFeedbackView from "./PreviousFeedbackView";
import { KeepRecordingPill } from "@/components/CaptureWidget/KeepRecordingPill";
import { PencilLine, Check, Link as LinkIcon, Loader2, X, Mic, Pen, Sun, Moon } from "lucide-react";
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
  onSessionModeEndSoft,
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
  feedbackLimitReached,
  feedbackUsage,
  feedbackLimit,
}: CaptureWidgetProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const showResumeModal = resumeModalOpen || (openResumeModalProp ?? false);
  /** V2: when true, show Previous Feedback view instead of home screen. */
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false);
  /** Ticket editor overlay: ID of the ticket currently being edited, or null. */
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  /** Extension: when true, show command screen (mode cards + footer). False when viewing a session (e.g. after Open Previous or when paused). */
  const [showCommandScreen, setShowCommandScreen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>(() => {
    if (typeof localStorage === "undefined") return "";
    try { return localStorage.getItem("echly:selectedMic") ?? ""; } catch { return ""; }
  });
  const [micDropdownOpen, setMicDropdownOpen] = useState(false);
  /** V2: when true, show mode selection screen instead of home screen. */
  const [showModeSelection, setShowModeSelection] = useState(false);
  /** Feedback ticket limit: when true, show full upgrade screen (pre-session proactive check). */
  const [showUpgradeScreen, setShowUpgradeScreen] = useState(false);
  /** S9: Keep Recording pill — shown once per session on first processing trigger. */
  const [keepRecordingVisible, setKeepRecordingVisible] = useState(false);
  const [keepRecordingFading, setKeepRecordingFading] = useState(false);
  const keepRecordingShownRef = useRef(false);
  const upgradeInlineRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localEditTitle, setLocalEditTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPrevFeedbackLoading, setIsPrevFeedbackLoading] = useState(false);
  const [editPauseTooltipVisible, setEditPauseTooltipVisible] = useState(false);

  const triggerUpgradeShake = useCallback(() => {
    const el = upgradeInlineRef.current;
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  }, []);

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
          const stillValid = selectedMicrophone && devices.some((d) => d.deviceId === selectedMicrophone);
          if (devices.length && !stillValid) {
            const preferred =
              devices.find((d) => d.deviceId === "default")?.deviceId ??
              devices[0].deviceId ??
              "";
            if (preferred) {
              setSelectedMicrophone(preferred);
              try { localStorage.setItem("echly:selectedMic", preferred); } catch {}
            }
          }
        }
      : undefined,
    onVoiceMicrophoneSelect: (deviceId) => {
      setSelectedMicrophone(deviceId);
      try { localStorage.setItem("echly:selectedMic", deviceId); } catch {}
    },
    captureRootParent,
    environment,
    assertIdentityBeforeWorkspaceMutations,
    feedbackLimitReached,
    triggerUpgradeShake,
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
  const dataReceivedRef = useRef(false);

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

  const hasProcessingJobs = feedbackJobs && feedbackJobs.length > 0;
  const hasTickets = (typeof totalCount === "number" && totalCount > 0) || hasProcessingJobs;
  /** When true, we are in an active or paused session; always render session layout (ticket list or empty state), never home. */
  const sessionModeActive = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
  /** Home screen only when not in a session. */
  const showHomeScreen = !sessionModeActive;
  const isStartingSession = state.sessionStatus === "starting";
  const showSessionLoading = sessionLoading || isStartingSession || (sessionModeActive && !hasTickets && !dataReceivedRef.current);

  const openTicketsCount = typeof openCount === "number" ? openCount : 0;
  const resolvedTicketsCount = typeof resolvedCount === "number" ? resolvedCount : 0;
  const sessionHeaderCount =
    extensionMode && typeof totalCount === "number"
      ? totalCount
      : openTicketsCount;

  const displayTitle = sessionTitleProp ?? sessionTitle ?? "Untitled Session";

  const summary = extensionMode
    ? `${typeof totalCount === "number" ? totalCount : 0} total · ${openTicketsCount} open · ${resolvedTicketsCount} resolved`
    : openTicketsCount > 0 &&
        typeof highPriorityOpenCount === "number" &&
        highPriorityOpenCount > 0
      ? `${highPriorityOpenCount} need attention`
      : null;

  useEffect(() => {
    if (!sessionLoading && sessionModeActive) {
      dataReceivedRef.current = true;
    }
    if (!sessionModeActive) {
      dataReceivedRef.current = false;
    }
  }, [sessionLoading, sessionModeActive]);

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

  /** S9: Auto-dismiss KeepRecordingPill after 20 seconds with fade-out. */
  useEffect(() => {
    if (!keepRecordingVisible || keepRecordingFading) return;
    const t = setTimeout(() => {
      setKeepRecordingFading(true);
      setTimeout(() => {
        setKeepRecordingVisible(false);
        setKeepRecordingFading(false);
      }, 500);
    }, 20000);
    return () => clearTimeout(t);
  }, [keepRecordingVisible, keepRecordingFading]);

  /** S9: Reset KeepRecordingPill state when session ends. */
  useEffect(() => {
    if (!sessionModeActive) {
      keepRecordingShownRef.current = false;
      setKeepRecordingVisible(false);
      setKeepRecordingFading(false);
    }
  }, [sessionModeActive]);

  React.useEffect(() => {
    if (!widgetToggleRef) return;
    widgetToggleRef.current = handlers.toggleOpen;
    return () => {
      widgetToggleRef.current = null;
    };
  }, [handlers, widgetToggleRef]);

  const checkAuthBeforeAction = React.useCallback(async (): Promise<boolean> => {
    if (extensionMode && chrome?.runtime?.sendMessage) {
      try {
        const response = await new Promise<any>((resolve) => {
          chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" }, resolve);
        });
        if (!response?.authenticated) {
          chrome.runtime.sendMessage({ type: "ECHLY_TRIGGER_LOGIN" });
          return false;
        }
      } catch {
        // If message fails, let it through — downstream will catch
      }
    } else if (ensureAuthenticated && !(await ensureAuthenticated())) {
      return false;
    }
    return true;
  }, [extensionMode, ensureAuthenticated]);

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

  /** Drag handle: starts drag when pressing on a header background but never on inner buttons/inputs. */
  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!extensionMode) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, input, textarea, select, [role='button']")) return;
      handlers.startDrag(e);
    },
    [extensionMode, handlers]
  );

  const handleCopySessionLink = useCallback(async () => {
    if (copyState === "copying") return;
    if (!sessionId) return;
    setCopyState("copying");

    const envBase = (typeof process !== "undefined" ? process.env.ECHLY_WEB_APP_URL : "") || "";
    const fallbackOrigin = extensionMode
      ? ""
      : (typeof window !== "undefined" ? window.location.origin : "");
    const appOrigin = envBase || fallbackOrigin || "http://localhost:3000";

    const finalize = async (url: string) => {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopyState("idle");
      }, 2000);
    };

    try {
      const url = `${appOrigin}/session/${encodeURIComponent(sessionId)}`;
      await finalize(url);
    } catch {
      setCopyState("idle");
    }
  }, [copyState, sessionId, extensionMode]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleEditTicket = useCallback((id: string) => {
    if (globalSessionModeActive && !globalSessionPaused) {
      handlers.pauseSession();
      setEditPauseTooltipVisible(true);
    }
    setEditingTicketId(id);
    handlers.setExpandedId(id);
  }, [handlers, globalSessionModeActive, globalSessionPaused]);

  useEffect(() => {
    if (!globalSessionPaused) setEditPauseTooltipVisible(false);
  }, [globalSessionPaused]);

  const handleCloseEditor = useCallback(() => {
    setEditingTicketId(null);
    handlers.setExpandedId(null);
  }, [handlers]);

  const handleTitleSave = useCallback(() => {
    const trimmed = localEditTitle.trim() || "Untitled Session";
    setIsEditingTitle(false);
    if (trimmed !== displayTitle) {
      onSessionTitleChangeProp?.(trimmed);
    }
  }, [localEditTitle, displayTitle, onSessionTitleChangeProp]);

  const handleTitleCancel = useCallback(() => {
    setIsEditingTitle(false);
    setLocalEditTitle(displayTitle || "");
  }, [displayTitle]);

  const handleTitleClick = useCallback(() => {
    if (displayTitle === "Untitled Session") return;
    setLocalEditTitle(displayTitle || "");
    setIsEditingTitle(true);
  }, [displayTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSessionEnd = () => {
    handlers.endSession(() => {
      setShowCommandScreen(true);
      onSessionEndCallback?.();
    });
  };

  const handleSessionEndSoft = () => {
    handlers.endSession(() => {
      setShowCommandScreen(true);
      onSessionModeEndSoft?.();
    }, { soft: true });
  };

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
          onResetVoice={handlers.resetVoiceRecording}
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
          onSessionEnd={handleSessionEnd}
          __extensionSavingState={__extensionSavingState}
          onSessionRecordVoice={handlers.handleSessionStartVoice}
          onSessionDoneVoice={handlers.finishListening}
          onSessionSaveText={handlers.handleSessionFeedbackSubmit}
          onSessionFeedbackCancel={handlers.handleSessionFeedbackCancel}
          theme={theme}
          onModeChange={(mode) => setMode(mode)}
        />
      )}

      {showFloatingButton && (
        <div
          ref={extensionMode ? refs.widgetRef : undefined}
          className="echly-floating-trigger-wrapper"
          onMouseDown={handleHeaderMouseDown}
          style={
            extensionMode
              ? state.position
                ? {
                    position: "fixed",
                    left: state.position.x,
                    top: state.position.y,
                    bottom: "auto",
                    right: "auto",
                    transition: state.isSnapping ? "left 0.2s ease, top 0.2s ease" : undefined,
                    cursor: state.isDragging ? "grabbing" : "grab",
                    pointerEvents: "auto",
                  }
                : {
                    position: "relative",
                    cursor: state.isDragging ? "grabbing" : "grab",
                    pointerEvents: "auto",
                  }
              : undefined
          }
        >
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
                ? state.position
                  ? {
                      position: "fixed",
                      left: state.position.x,
                      top: state.position.y,
                      zIndex: 2147483647,
                      pointerEvents: "auto",
                      transition: state.isSnapping ? "left 0.2s ease, top 0.2s ease" : undefined,
                    }
                  : {
                      position: "relative",
                      pointerEvents: "auto",
                    }
                : undefined
            }
          >
            {extensionMode && captureMode === "voice" && micDropdownOpen && (
              <MicrophonePanel
                devices={microphones}
                selectedDeviceId={selectedMicrophone}
                onSelect={(id) => {
                  setSelectedMicrophone(id);
                  try { localStorage.setItem("echly:selectedMic", id); } catch {}
                }}
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
              ) : extensionMode && showHomeScreen && showUpgradeScreen ? (
                /* ── Case 2a: Full ticket-limit upgrade screen (Screen 1) ── */
                <div
                  className="echly-v2"
                  data-tooltip-placement={
                    state.trayCorner === "tl" || state.trayCorner === "tr" ? "bottom" : "top"
                  }
                >
                  <div className="pill upgrade-full">
                    <div className="upgrade-full-head">
                      <div className="upgrade-full-head-left">
                        <div className="upgrade-full-mark">
                          <svg viewBox="0 0 18 18" fill="none" width="14" height="14">
                            <text x="4" y="13.5" fontSize="12" fontWeight="700" fill="#fff" fontFamily="DM Sans, sans-serif">E</text>
                          </svg>
                        </div>
                      </div>
                      <div className="tl-icon-group">
                        <button
                          type="button"
                          className="pill-icon-btn"
                          onClick={() => setShowUpgradeScreen(false)}
                        >
                          <X size={13} strokeWidth={2.25} />
                          <span className="echly-tooltip">Close</span>
                        </button>
                      </div>
                    </div>
                    <div className="upgrade-full-body">
                      <div className="upgrade-icon-wrap">
                        <div className="upgrade-sparkles">
                          <span className="upgrade-sparkle" />
                          <span className="upgrade-sparkle" />
                          <span className="upgrade-sparkle" />
                          <span className="upgrade-sparkle" />
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 20h20"/>
                          <path d="M4 20V10l4 4 4-8 4 8 4-4v10"/>
                          <circle cx="4" cy="10" r="1" fill="currentColor" stroke="none"/>
                          <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
                          <circle cx="20" cy="10" r="1" fill="currentColor" stroke="none"/>
                        </svg>
                      </div>
                      {feedbackUsage != null && feedbackLimit != null && (
                        <span className="upgrade-counter">
                          <span className="upgrade-counter-dot" />
                          {feedbackUsage} of {feedbackLimit} tickets used this month
                        </span>
                      )}
                      <h2 className="upgrade-title">You've reached your monthly limit</h2>
                      <p className="upgrade-desc">
                        Upgrade to Business for unlimited feedback tickets, unlimited team members, and priority support.
                      </p>
                      <button
                        type="button"
                        className="upgrade-cta"
                        onClick={() => onOpenBilling?.()}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        Upgrade to Business
                      </button>
                    </div>
                  </div>
                </div>
              ) : extensionMode && showHomeScreen ? (
                /* ── Case 2b: Extension home screen → V2 design ── */
                <div
                  className="echly-v2"
                  data-tooltip-placement={
                    state.trayCorner === "tl" || state.trayCorner === "tr" ? "bottom" : "top"
                  }
                >
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
                      captureMode={captureMode}
                      onModeChange={(mode) => setMode(mode)}
                      theme={theme}
                      onThemeToggle={onThemeToggle}
                      onHeaderMouseDown={handleHeaderMouseDown}
                    />
                  ) : showModeSelection ? (
                    <ModeSelectionView
                      captureMode={captureMode}
                      onModeChange={setMode}
                      onBegin={() => {
                        if (isStartingSession) return;
                        handlers.startSession();
                        setShowModeSelection(false);
                      }}
                      onBack={() => setShowModeSelection(false)}
                      onClose={handleClose}
                      theme={theme}
                      onThemeToggle={onThemeToggle}
                      isStarting={isStartingSession}
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
                      <div
                        className="pill-head"
                        onMouseDown={handleHeaderMouseDown}
                        style={extensionMode ? { cursor: state.isDragging ? "grabbing" : "grab" } : undefined}
                      >
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
                        <div className="tl-icon-group">
                          <button
                            type="button"
                            className="pill-icon-btn"
                            onClick={onThemeToggle}
                            aria-label="Toggle theme"
                          >
                            {theme === "dark" ? (
                              <Sun size={13} strokeWidth={2.25} />
                            ) : (
                              <Moon size={13} strokeWidth={2.25} />
                            )}
                            <span className="echly-tooltip">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                          </button>
                          <button
                            type="button"
                            className="pill-icon-btn"
                            onClick={() => setMode(captureMode === "voice" ? "text" : "voice")}
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
                            onClick={handleClose}
                            aria-label="Close"
                          >
                            <X size={13} strokeWidth={2.25} />
                            <span className="echly-tooltip">Minimize</span>
                          </button>
                        </div>
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
                            if (!(await checkAuthBeforeAction())) return;
                            const limitHit = feedbackLimitReached != null ||
                              (feedbackUsage != null && feedbackLimit != null && feedbackUsage >= feedbackLimit);
                            if (limitHit) { setShowUpgradeScreen(true); return; }
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
                        </button>

                        <div className="secondary-row">
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={async () => {
                              if (isPrevFeedbackLoading) return;
                              setIsPrevFeedbackLoading(true);
                              try {
                                if (!(await checkAuthBeforeAction())) return;
                                const limitHit = feedbackLimitReached != null ||
                                  (feedbackUsage != null && feedbackLimit != null && feedbackUsage >= feedbackLimit);
                                if (limitHit) { setShowUpgradeScreen(true); return; }
                                setShowPreviousFeedback(true);
                              } finally {
                                setIsPrevFeedbackLoading(false);
                              }
                            }}
                            disabled={isPrevFeedbackLoading}
                          >
                            {isPrevFeedbackLoading ? (
                              <>
                                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                  <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Previous Feedback
                              </>
                            )}
                          </button>
                          <div className="mode-seg-mini" role="tablist" aria-label="Feedback mode">
                            <button
                              type="button"
                              className={captureMode === "voice" ? "active" : ""}
                              aria-label="Voice mode"
                              onClick={() => setMode("voice")}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="6" y="2" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              <span className="echly-tooltip">Voice mode</span>
                            </button>
                            <button
                              type="button"
                              className={captureMode === "text" ? "active" : ""}
                              aria-label="Write mode"
                              onClick={() => setMode("text")}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2.5 12.5l1-3 7-7 2 2-7 7-3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9.5 4l2 2" stroke="currentColor" strokeWidth="1.5"/></svg>
                              <span className="echly-tooltip">Text mode</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pill-foot">
                        <span className="pill-foot-left">
                          <span className="ai-dot" aria-hidden />
                          AI ready
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : extensionMode && sessionModeActive ? (
                /* ── Case 3a: Extension V2 session view (Phase 4) ── */
                <div
                  className="echly-v2"
                  data-tooltip-placement={
                    state.trayCorner === "tl" || state.trayCorner === "tr" ? "bottom" : "top"
                  }
                >
                  {keepRecordingVisible && (
                    <KeepRecordingPill
                      fading={keepRecordingFading}
                      placement={state.trayCorner === "tl" || state.trayCorner === "tr" ? "bottom" : "top"}
                      onDismiss={() => {
                        setKeepRecordingFading(true);
                        setTimeout(() => {
                          setKeepRecordingVisible(false);
                          setKeepRecordingFading(false);
                        }, 500);
                      }}
                    />
                  )}
                  <div className="pill pill-tickets">

                    {/* ── Session header ── */}
                    <div
                      className={`tl-head ${isEditingTitle ? "tl-head--editing" : ""}`}
                      onMouseDown={handleHeaderMouseDown}
                      style={extensionMode && !isEditingTitle ? { cursor: state.isDragging ? "grabbing" : "grab" } : undefined}
                    >
                      <span className="pill-mark">E</span>
                      {!showSessionLoading && (
                        <>
                          <div className={`tl-title-block ${isEditingTitle ? "tl-editing" : ""}`}>
                            <div className="tl-eyebrow">
                              <span className="live-dot" aria-hidden />
                              {globalSessionPaused ? "Paused" : "Active session"}
                            </div>
                            {displayTitle === "Untitled Session" ? (
                              <span className="tl-title-skeleton" />
                            ) : isEditingTitle ? (
                              <div className="tl-title-edit-row">
                                <input
                                  ref={titleInputRef}
                                  className="tl-title-input"
                                  value={localEditTitle}
                                  onChange={(e) => setLocalEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); handleTitleSave(); }
                                    if (e.key === "Escape") { e.preventDefault(); handleTitleCancel(); }
                                  }}
                                  onBlur={handleTitleSave}
                                />
                                <button
                                  type="button"
                                  className="tl-save-btn"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleTitleSave}
                                >
                                  <Check size={14} strokeWidth={2} />
                                  <span className="echly-tooltip">Save</span>
                                </button>
                              </div>
                            ) : (
                              <div className="tl-title-hover-row" onClick={handleTitleClick}>
                                <PencilLine size={14} strokeWidth={1.5} className="tl-edit-icon" />
                                <div className="tl-title">{displayTitle}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {showSessionLoading && <span style={{ flex: 1 }} />}
                      <div className="tl-icon-group">
                        {!showSessionLoading && (
                          <button
                            type="button"
                            className="pill-icon-btn tl-share-btn"
                            onClick={handleCopySessionLink}
                            aria-label={copyState === "copied" ? "Link copied" : "Copy session link"}
                          >
                            {copyState === "copying" ? (
                              <Loader2 size={13} strokeWidth={2.25} className="tl-share-spinner" />
                            ) : copyState === "copied" ? (
                              <Check size={13} strokeWidth={2.25} />
                            ) : (
                              <LinkIcon size={13} strokeWidth={2.25} />
                            )}
                            <span className={`echly-tooltip ${copyState === "copied" ? "tl-share-tooltip--visible" : ""}`}>
                              {copyState === "copied" ? "Link copied!" : "Copy link"}
                            </span>
                          </button>
                        )}
                        {!showSessionLoading && (
                          <button
                            type="button"
                            className="pill-icon-btn"
                            onClick={() => setMode(captureMode === "voice" ? "text" : "voice")}
                            aria-label="Toggle mode"
                          >
                            {captureMode === "voice" ? (
                              <Mic size={13} strokeWidth={2.25} />
                            ) : (
                              <Pen size={13} strokeWidth={2.25} />
                            )}
                            <span className="echly-tooltip">{captureMode === "voice" ? "Text mode" : "Voice mode"}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="pill-icon-btn"
                          onClick={handleClose}
                          aria-label="Close"
                        >
                          <X size={13} strokeWidth={2.25} />
                          <span className="echly-tooltip">Minimize</span>
                        </button>
                      </div>
                    </div>

                    <div className="pill-rule" />

                    {editPauseTooltipVisible && (
                      <div className="tl-edit-pause-tooltip" role="status">
                        <span className="tl-edit-pause-text">
                          Session paused. Resume from the controls below when you&apos;re ready.
                        </span>
                        <button
                          type="button"
                          className="tl-edit-pause-dismiss"
                          onClick={() => setEditPauseTooltipVisible(false)}
                          aria-label="Dismiss"
                        >
                          <X size={11} strokeWidth={2.5} />
                        </button>
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
                      {showSessionLoading && (
                        <div className="tl-loading-state" aria-live="polite" aria-busy="true">
                          <div className="loading-icon-wrap" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="9" y1="13" x2="15" y2="13"/>
                              <line x1="9" y1="17" x2="12" y2="17"/>
                            </svg>
                          </div>
                          <span className="loading-sub">Loading your feedback tickets and getting everything ready</span>
                          <div className="loading-dots">
                            <span /><span /><span />
                          </div>
                        </div>
                      )}

                      {/* Per-job processing skeleton cards */}
                      {!showSessionLoading && feedbackJobs?.filter((j) => j.status === "processing").map((job) => (
                        <div key={job.id} className="ticket processing" aria-live="polite">
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
                      ))}

                      {/* Legacy fallback — single skeleton when no jobs array exists */}
                      {!showSessionLoading && !feedbackJobs?.length && isProcessingFeedback && (
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

                      {/* Inline ticket-limit upgrade card (Screen 2) */}
                      {!showSessionLoading && feedbackLimitReached && (
                        <div ref={upgradeInlineRef} className="upgrade-inline" role="alert">
                          <div className="upgrade-inline-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 20h20"/>
                              <path d="M4 20V10l4 4 4-8 4 8 4-4v10"/>
                            </svg>
                          </div>
                          <div className="upgrade-inline-content">
                            <div className="upgrade-inline-title">Monthly ticket limit reached</div>
                            <div className="upgrade-inline-desc">Upgrade to keep capturing feedback without interruption.</div>
                            <button
                              type="button"
                              className="upgrade-inline-btn"
                              onClick={() => onOpenBilling?.()}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                              </svg>
                              Upgrade
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Failed job cards */}
                      {!showSessionLoading && feedbackJobs?.filter((j) => j.status === "failed").map((job) => (
                        <div key={job.id} className="tl-failed-card" role="alert">
                          {job.errorMessage ?? "AI processing failed."}
                        </div>
                      ))}

                      {/* Ticket cards */}
                      {!showSessionLoading && hasTickets && state.pointers.map((p) => (
                        <FeedbackItem
                          key={p.id}
                          item={p}
                          onEditRequest={handleEditTicket}
                          onDelete={handlers.deletePointer}
                          highlightTicketId={state.highlightTicketId}
                        />
                      ))}

                      {/* Empty state */}
                      {!showSessionLoading &&
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
                        AI · {showSessionLoading ? "preparing" : hasTickets ? "auto-structured" : "ready"}
                      </span>
                      <button type="button" className="tl-foot-home" onClick={handleSessionEndSoft}>Exit session</button>
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
                                onEditRequest={handleEditTicket}
                                onDelete={handlers.deletePointer}
                                highlightTicketId={state.highlightTicketId}
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


      {/* Ticket editor overlay — centered modal portaled into capture root */}
      {editingTicketId && captureRootEl && (() => {
        const editingTicket = state.pointers.find((p) => p.id === editingTicketId);
        if (!editingTicket) return null;
        return createPortal(
          <TicketEditorOverlay
            ticket={editingTicket}
            sessionId={sessionId}
            onUpdate={onUpdate ?? handlers.updatePointer}
            onClose={handleCloseEditor}
          />,
          captureRootEl
        );
      })()}
    </>
  );
}
