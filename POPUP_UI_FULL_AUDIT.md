# POPUP_UI_FULL_AUDIT

Generated: 2026-03-24
Scope: popup UI layering/portals/z-index/rendering flow for Echly extension overlay capture UI.

> Note on code blocks: The extracted file dumps in this report are copied from the repository using Cursor’s `ReadFile` tooling, which prefixes each line with `L###:`. Those prefixes are metadata for the extraction and are not part of the original source.

## 1. Root Rendering

### Root entry: where popup UI starts rendering

`echly-extension/src/content.tsx`

Key mounting flow:
- Shadow host (`#echly-shadow-host`) is created with `position: fixed`, `bottom: 24px`, `right: 24px`, `zIndex: 2147483647`, and hidden (`display: none`, `pointerEvents: none`, `visibility: hidden`) until state changes.
- `mountReactApp(host)` creates a shadow root, injects `popup.css` into the shadow root, creates a container (`ROOT_ID`, `data-echly-ui="true"`), and mounts React via `createRoot(container)`.
- Inside the React render tree, `CaptureWidget` is rendered in `ContentApp` when not crashed.

Relevant code locations:
- React mount: `createRoot(container)` and `reactRoot.render(<ContentApp ... />)` in `echly-extension/src/content.tsx`
- CaptureWidget render: `<CaptureWidget ... captureRootParent={widgetRoot} ... />` in `echly-extension/src/content.tsx`

### CaptureWidget.tsx (FULL component)

```tsx
L1:"use client";
L2:
L3:import React, { useEffect, useRef, useState } from "react";
L4:import { Mic, PenLine, Zap } from "lucide-react";
L5:import { useCaptureWidget } from "./hooks/useCaptureWidget";
L6:import CaptureHeader from "./CaptureHeader";
L7:import FeedbackItem from "./FeedbackItem";
L8:import WidgetFooter from "./WidgetFooter";
L9:import { CaptureLayer } from "./CaptureLayer";
L10:import { ResumeSessionModal } from "./ResumeSessionModal";
L11:import { MicrophonePanel } from "./MicrophonePanel";
L12:import { SessionLimitUpgradeView } from "./SessionLimitUpgradeView";
L13:import type { CaptureWidgetProps, CaptureState } from "./types";
L14:
L15:const CAPTURE_FLOW_STATES: CaptureState[] = ["focus_mode", "region_selecting", "voice_listening", "processing"];
L16:
L17:export default function CaptureWidget({
L18:  sessionId,
L19:  userId,
L20:  extensionMode = false,
L21:  initialPointers,
L22:  onComplete,
L23:  onDelete,
L24:  onUpdate,
L25:  widgetToggleRef,
L26:  onRecordingChange,
L27:  expanded,
L28:  onExpandRequest,
L29:  onCollapseRequest,
L30:  captureDisabled = false,
L31:  theme = "dark",
L32:  onThemeToggle,
L33:  fetchSessions,
L34:  hasPreviousSessions = false,
L35:  onPreviousSessionSelect,
L36:  loadSessionWithPointers,
L37:  pointers: pointersProp,
L38:  totalCount,
L39:  openCount,
L40:  skippedCount,
L41:  resolvedCount,
L42:  sessionLoading = false,
L43:  onSessionLoaded,
L44:  onSessionEnd: onSessionEndCallback,
L45:  onCreateSession,
L46:  onActiveSessionChange,
L47:  ensureAuthenticated,
L48:  globalSessionModeActive,
L49:  globalSessionPaused,
L50:  onSessionModeStart,
L51:  onSessionModePause,
L52:  onSessionModeResume,
L53:  onSessionModeEnd,
L54:  onSessionActivity,
L55:  captureMode = "voice",
L56:  onCaptureModeChange,
L57:  captureRootParent,
L58:  isProcessingFeedback = false,
L59:  feedbackJobs,
L60:  launcherLogoUrl,
L61:  sessionTitleProp,
L62:  onSessionTitleChange: onSessionTitleChangeProp,
L63:  openResumeModal: openResumeModalProp,
L64:  onResumeModalClose,
L65:  verifySessionBeforeSessions,
L66:  onTriggerLogin,
L67:  sessionLimitReached,
L68:  environment,
L69:  onPreviousSessions,
L70:  onSetCaptureMode,
L71:  onOpenBilling,
L72:  onOpenDashboard,
L73:  getAssetUrl,
L74:}: CaptureWidgetProps) {
L75:  const [resumeModalOpen, setResumeModalOpen] = useState(false);
L76:  const showResumeModal = resumeModalOpen || (openResumeModalProp ?? false);
L77:  /** Extension: when true, show command screen (mode cards + footer). False when viewing a session (e.g. after Open Previous or when paused). */
L78:  const [showCommandScreen, setShowCommandScreen] = useState(true);
L79:  const [sessionTitle, setSessionTitle] = useState("Untitled Session");
L80:  const [microphones, setMicrophones] = useState<Array<{ deviceId: string; label: string }>>([]);
L81:  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
L82:  const [micDropdownOpen, setMicDropdownOpen] = useState(false);
L83:  const {
L84:    state,
L85:    handlers,
L86:    refs,
L87:    captureRootEl,
L88:  } = useCaptureWidget({
L89:    sessionId,
L90:    userId,
L91:    extensionMode,
L92:    initialPointers,
L93:    onComplete,
L94:    onDelete,
L95:    onUpdate,
L96:    onRecordingChange,
L97:    loadSessionWithPointers,
L98:    pointers: pointersProp,
L99:    onSessionLoaded,
L100:    onCreateSession,
L101:    onActiveSessionChange,
L102:    ensureAuthenticated,
L103:    onSessionViewRequested: extensionMode
L104:      ? () => {
L105:          console.log("[ECHLY DEBUG] UI entering session mode", performance.now());
L106:          setShowCommandScreen(false);
L107:        }
L108:      : undefined,
L109:    globalSessionModeActive,
L110:    globalSessionPaused,
L111:    onSessionModeStart,
L112:    onSessionModePause,
L113:    onSessionModeResume,
L114:    onSessionModeEnd,
L115:    onSessionActivity,
L116:    captureMode,
L117:    selectedMicrophoneId: selectedMicrophone || undefined,
L118:    onDevicesEnumerated: extensionMode
L119:      ? (devices) => {
L120:          setMicrophones(devices);
L121:          if (devices.length && !selectedMicrophone) setSelectedMicrophone(devices[0].deviceId || "");
L122:        }
L123:      : undefined,
L124:    onVoiceMicrophoneSelect: extensionMode
L125:      ? (deviceId) => {
L126:          setSelectedMicrophone(deviceId);
L127:        }
L128:      : undefined,
L129:    captureRootParent,
L130:    environment,
L131:  });
L132:
L133:  /** Session limit: prop (from parent e.g. extension) takes precedence; otherwise use hook state (set when startSession returns limitReached). */
L134:  const effectiveSessionLimitReached = sessionLimitReached ?? state.sessionLimitReached;
L135:
L136:  const isControlled = expanded !== undefined;
L137:  const effectiveIsOpen = isControlled ? expanded : state.isOpen;
L138:  const listScrollRef = useRef<HTMLDivElement>(null);
L139:  const isFetchingRef = useRef(false);
L140:
L141:  const isInCaptureFlow = CAPTURE_FLOW_STATES.includes(state.state) || state.pillExiting;
L142:  const optimisticSessionActive = state.sessionStatus === "starting" || state.sessionStatus === "active";
L143:  const hasStoredSession = Boolean(sessionId) || optimisticSessionActive;
L144:  const showSidebar = !isInCaptureFlow && !state.sessionMode;
L145:  /** Session sidebar visible when session is active or paused; hide only when session ends. */
L146:  const shouldShowTray = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
L147:  const showSessionSidebar = extensionMode && shouldShowTray;
L148:  const showFloatingButton = !effectiveIsOpen && (showSidebar || showSessionSidebar);
L149:  const showPanel = effectiveIsOpen && (showSidebar || showSessionSidebar);
L150:
L151:  const hasTickets = Boolean(state.pointers?.length);
L152:  /** When true, we are in an active or paused session; always render session layout (ticket list or empty state), never home. */
L153:  const sessionModeActive = globalSessionModeActive === true || globalSessionPaused === true || optimisticSessionActive;
L154:  /** Home screen (mode tiles + Start Session / Previous Sessions footer) only when not in a session. */
L155:  const showHomeScreen = !sessionModeActive;
L156:  const isStartingSession = state.sessionStatus === "starting";
L157:
L158:  const openTicketsCount = extensionMode
L159:    ? (typeof openCount === "number" ? openCount : 0)
L160:    : state.pointers.filter((p) => {
L161:        const status = (p as { status?: string }).status;
L162:        const isResolved = (p as { isResolved?: boolean }).isResolved;
L163:        if (status === "resolved" || isResolved === true) return false;
L164:        return true;
L165:      }).length;
L166:  const skippedTicketsCount = extensionMode
L167:    ? (typeof skippedCount === "number" ? skippedCount : 0)
L168:    : state.pointers.filter((p) => (p as { status?: string }).status === "skipped").length;
L169:  const resolvedTicketsCount = extensionMode
L170:    ? (typeof resolvedCount === "number" ? resolvedCount : 0)
L171:    : state.pointers.filter((p) => {
L172:        const status = (p as { status?: string }).status;
L173:        const isResolved = (p as { isResolved?: boolean }).isResolved;
L174:        return status === "resolved" || isResolved === true;
L175:      }).length;
L176:  const sessionHeaderCount =
L177:    extensionMode && typeof totalCount === "number"
L178:      ? totalCount
L179:      : openTicketsCount;
L180:
L181:  const highPriorityCount = state.pointers.filter((p) =>
L182:    /critical|bug|high|urgent/i.test(p.type || "")
L183:  ).length;
L184:  const summary = extensionMode
L185:    ? `${typeof totalCount === "number" ? totalCount : 0} total · ${openTicketsCount} open · ${skippedTicketsCount} skipped · ${resolvedTicketsCount} resolved`
L186:    : openTicketsCount > 0
L187:      ? highPriorityCount > 0
L188:        ? `${highPriorityCount} need attention`
L189:        : null
L190:      : null;
L191:
L192:  useEffect(() => {
L193:    if (state.highlightTicketId && listScrollRef.current) {
L194:      listScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
L195:    }
L196:  }, [state.highlightTicketId]);
L197:
L198:  useEffect(() => {
L199:    const el = listScrollRef.current;
L200:    if (!el) {
L201:      console.debug("[ECHLY UI] scrollRef not ready yet");
L202:      return;
L203:    }
L204:
L205:    console.log("✅ React scroll container ready", el);
L206:
L207:    let timeoutId: ReturnType<typeof setTimeout> | null = null;
L208:
L209:    const handleScroll = () => {
L210:      if (timeoutId != null) {
L211:        clearTimeout(timeoutId);
L212:      }
L213:      timeoutId = setTimeout(() => {
L214:        const { scrollTop, clientHeight, scrollHeight } = el;
L215:        const threshold = 200;
L216:        const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
L217:
L218:        console.log("SCROLL CHECK", {
L219:          scrollTop,
L220:          clientHeight,
L221:          scrollHeight,
L222:          isNearBottom,
L223:        });
L224:
L225:        if (
L226:          extensionMode &&
L227:          isNearBottom &&
L228:          !isFetchingRef.current &&
L229:          typeof chrome !== "undefined" &&
L230:          chrome.runtime?.sendMessage
L231:        ) {
L232:          isFetchingRef.current = true;
L233:          console.log("🔥 LOAD MORE (REACT)");
L234:          chrome.runtime.sendMessage({ type: "ECHLY_LOAD_MORE" }, () => {
L235:            isFetchingRef.current = false;
L236:          });
L237:        }
L238:      }, 50);
L239:    };
L240:
L241:    el.addEventListener("scroll", handleScroll, { passive: true });
L242:
L243:    return () => {
L244:      if (timeoutId != null) {
L245:        clearTimeout(timeoutId);
L246:      }
L247:      el.removeEventListener("scroll", handleScroll);
L248:    };
L249:  }, [
L250:    extensionMode,
L251:    hasTickets,
L252:    isProcessingFeedback,
L253:    feedbackJobs?.length,
L254:    sessionModeActive,
L255:    sessionLoading,
L256:  ]);
L257:
L258:  /** When session is loaded explicitly (user selected from Previous Sessions), transition to session view. */
L259:  useEffect(() => {
L260:    if (loadSessionWithPointers?.sessionId) {
L261:      setShowCommandScreen(false);
L262:    }
L263:  }, [loadSessionWithPointers?.sessionId]);
L264:
L265:  /** Safety log when rendering SessionLimitUpgradeView (session limit reached). */
L266:  useEffect(() => {
L267:    if (effectiveSessionLimitReached && !sessionId) {
L268:      console.log("[ECHLY DEBUG] Rendering SessionLimitUpgradeView");
L269:    }
L270:  }, [effectiveSessionLimitReached, sessionId]);
L271:
L272:  React.useEffect(() => {
L273:    if (!widgetToggleRef) return;
L274:    widgetToggleRef.current = handlers.toggleOpen;
L275:    return () => {
L276:      widgetToggleRef.current = null;
L277:    };
L278:  }, [handlers, widgetToggleRef]);
L279:
L280:  const handlePreviousSessions = React.useCallback(() => {
L281:    console.log("[ECHLY UX] Opening modal instantly");
L282:    onPreviousSessions?.();
L283:    setResumeModalOpen(true);
L284:  }, [onPreviousSessions]);
L285:
L286:  function setMode(mode: "voice" | "text") {
L287:    if (onSetCaptureMode) {
L288:      onSetCaptureMode(mode);
L289:    } else {
L290:      onCaptureModeChange?.(mode);
L291:    }
L292:  }
L293:
L294:  return (
L295:    <>
L296:      {extensionMode && fetchSessions && onPreviousSessionSelect && (
L297:        <ResumeSessionModal
L298:          open={showResumeModal}
L299:          onClose={() => {
L300:            setResumeModalOpen(false);
L301:            onResumeModalClose?.();
L302:          }}
L303:          fetchSessions={fetchSessions}
L304:          onSelectSession={(sessionId) => {
L305:            setShowCommandScreen(false);
L306:            onPreviousSessionSelect(sessionId);
L307:            setResumeModalOpen(false);
L308:          }}
L309:          theme={theme}
L310:          checkAuth={verifySessionBeforeSessions}
L311:          onOpenLogin={onTriggerLogin}
L312:        />
L313:      )}
L314:      {/* Capture layer: portaled into #echly-capture-root. Never inside sidebar. */}
L315:      {captureRootEl && (
L316:          <CaptureLayer
L317:            captureRoot={captureRootEl}
L318:            captureRootParent={captureRootParent ?? undefined}
L319:            extensionMode={extensionMode}
L320:            state={state.state}
L321:            getFullTabImage={handlers.getFullTabImage}
L322:            onRegionCaptured={handlers.handleRegionCaptured}
L323:            onRegionSelectStart={handlers.handleRegionSelectStart}
L324:            onCancelCapture={handlers.handleCancelCapture}
L325:            sessionMode={state.sessionMode || isStartingSession}
L326:            optimisticSessionStarting={isStartingSession}
L327:            globalSessionModeActive={globalSessionModeActive}
L328:            sessionId={sessionId}
L329:            sessionPaused={state.sessionPaused}
L330:            pausePending={state.pausePending}
L331:            endPending={state.endPending}
L332:            isFinishing={state.isFinishing}
L333:            sessionFeedbackPending={state.sessionFeedbackPending}
L334:            captureMode={captureMode}
L335:            listeningAudioLevel={state.listeningAudioLevel ?? 0}
L336:            audioAnalyser={state.audioAnalyser ?? null}
L337:            voiceError={state.voiceError}
L338:            onRetryVoice={handlers.retryVoiceCapture}
L339:            onSelectMicrophone={handlers.selectVoiceMicrophone}
L340:            voiceMicDeviceId={state.voiceMicDeviceId}
L341:            onSessionElementClicked={handlers.handleSessionElementClicked}
L342:            onSessionPause={() => {
L343:              handlers.pauseSession();
L344:              onExpandRequest?.();
L345:            }}
L346:            onSessionResume={() => {
L347:              handlers.resumeSession();
L348:            }}
L349:            onSessionEnd={() => {
L350:              handlers.endSession(() => {
L351:                setShowCommandScreen(true);
L352:                onSessionEndCallback?.();
L353:              });
L354:            }}
L355:            onSessionRecordVoice={handlers.handleSessionStartVoice}
L356:            onSessionDoneVoice={handlers.finishListening}
L357:            onSessionSaveText={handlers.handleSessionFeedbackSubmit}
L358:            onSessionFeedbackCancel={handlers.handleSessionFeedbackCancel}
L359:          />
L360:        )}
L361:
L362:      {showFloatingButton && (
L363:        <div className="echly-floating-trigger-wrapper">
L364:          <button
L365:            type="button"
L366:            id={extensionMode && launcherLogoUrl ? "launcher_container" : undefined}
L367:            onClick={() => (onExpandRequest ? onExpandRequest() : handlers.setIsOpen(true))}
L368:            className={`echly-floating-trigger${extensionMode && launcherLogoUrl ? " echly-launcher" : ""}`}
L369:            aria-label="Open Echly"
L370:          >
L371:            {extensionMode && launcherLogoUrl ? (
L372:              <img
L373:                src={launcherLogoUrl}
L374:                className="echly-launcher-logo"
L375:                alt="Echly"
L376:              />
L377:            ) : (
L378:              extensionMode ? "Echly" : "Capture feedback"
L379:            )}
L380:          </button>
L381:        </div>
L382:      )}
L383:
L384:      {showPanel && (
L385:        <>
L386:          {!extensionMode && (
L387:            <div
L388:              className="echly-backdrop"
L389:              style={{ position: "fixed", inset: 0, zIndex: 2147483646, background: "rgba(0,0,0,0.06)", pointerEvents: "auto" }}
L390:              aria-hidden
L391:            />
L392:          )}
L393:          <div
L394:            ref={refs.widgetRef}
L395:            className="echly-sidebar-container"
L396:            style={
L397:              extensionMode
L398:                ? {
L399:                    position: "fixed",
L400:                    ...(state.position
L401:                      ? { left: state.position.x, top: state.position.y }
L402:                      : { bottom: "24px", right: "24px" }),
L403:                    zIndex: 2147483647,
L404:                    pointerEvents: "auto",
L405:                  }
L406:                : undefined
L407:            }
L408:          >
L409:            {extensionMode && captureMode === "voice" && micDropdownOpen && (
L410:              <MicrophonePanel
L411:                devices={microphones}
L412:                selectedDeviceId={selectedMicrophone}
L413:                onSelect={setSelectedMicrophone}
L414:                onClose={() => setMicDropdownOpen(false)}
L415:              />
L416:            )}
L417:            <div className="echly-sidebar-surface" data-theme={theme}>
L418:              <CaptureHeader
L419:                onClose={() => (onCollapseRequest ? onCollapseRequest() : handlers.setIsOpen(false))}
L420:                showSessionTitle={!(effectiveSessionLimitReached && !sessionId) && (hasTickets || sessionModeActive || sessionLoading)}
L421:                sessionTitle={sessionTitleProp ?? sessionTitle ?? "Untitled Session"}
L422:                onSessionTitleChange={onSessionTitleChangeProp ?? setSessionTitle}
L423:                openTicketCount={sessionHeaderCount}
L424:                title={undefined}
L425:                summary={summary}
L426:                showHomeButton={extensionMode && !(effectiveSessionLimitReached && !sessionId)}
L427:                theme={theme}
L428:                onThemeToggle={effectiveSessionLimitReached && !sessionId ? undefined : isStartingSession ? undefined : onThemeToggle}
L429:                captureMode={captureMode}
L430:                onCaptureModeToggle={effectiveSessionLimitReached && !sessionId ? undefined : isStartingSession ? undefined : (extensionMode ? () => setMode(captureMode === "voice" ? "text" : "voice") : undefined)}
L431:                onShowCommandScreen={() => setShowCommandScreen(true)}
L432:                showOnlyClose={Boolean(effectiveSessionLimitReached && !sessionId)}
L433:                onOpenDashboard={onOpenDashboard}
L434:              />
L435:
L436:              {effectiveSessionLimitReached && !sessionId ? (
L437:                <div className="echly-sidebar-body echly-upgrade-card-body">
L438:                  <SessionLimitUpgradeView
L439:                    limitMessage={effectiveSessionLimitReached.message ?? ""}
L440:                    upgradePlan={effectiveSessionLimitReached.upgradePlan}
L441:                    onUpgrade={() => {
L442:                      onOpenBilling?.();
L443:                      handlers.setSessionLimitReached(null);
L444:                    }}
L445:                    getAssetUrl={getAssetUrl}
L446:                  />
L447:                </div>
L448:              ) : (
L449:              <div
L450:                className="echly-sidebar-body"
L451:                style={isStartingSession ? { pointerEvents: "none", opacity: 0.85 } : undefined}
L452:              >
L453:                {isStartingSession && (
L454:                  <div className="echly-session-loading-state" aria-live="polite" aria-busy="true">
L455:                    <span className="echly-spinner" aria-hidden />
L456:                    <span className="echly-session-loading-text">Starting session...</span>
L457:                  </div>
L458:                )}
L459:                {sessionModeActive && sessionLoading && (
L460:                  <div className="echly-session-loading-state" aria-live="polite" aria-busy="true">
L461:                    <span className="echly-spinner" aria-hidden />
L462:                    <span className="echly-session-loading-text">Loading session...</span>
L463:                  </div>
L464:                )}
L465:                {((hasTickets || isProcessingFeedback || (feedbackJobs && feedbackJobs.length > 0)) && (sessionModeActive || !extensionMode) && !sessionLoading) && (
L466:                  <div
L467:                    ref={listScrollRef}
L468:                    className="echly-feedback-list-scroll"
L469:                    style={{ overflowY: "auto", maxHeight: "100%" }}
L470:                    onWheel={(e) => e.stopPropagation()}
L471:                  >
L472:                    <div className="echly-feedback-list">
L473:                      {feedbackJobs?.filter((j) => j.status === "processing").map((job) => (
L474:                        <div key={job.id} id="processing_card_markup" className="echly-feedback-card echly-feedback-processing" aria-live="polite">
L475:                          <span className="echly-spinner" aria-hidden />
L476:                          <span className="echly-processing-text">
L477:                            Processing feedback...
L478:                          </span>
L479:                        </div>
L480:                      ))}
L481:                      {feedbackJobs?.filter((j) => j.status === "failed").map((job) => (
L482:                        <div key={job.id} className="echly-feedback-card echly-feedback-failed" aria-live="polite">
L483:                          <span className="echly-failed-text">{job.errorMessage ?? "AI processing failed."}</span>
L484:                        </div>
L485:                      ))}
L486:                      {!feedbackJobs?.length && isProcessingFeedback && (
L487:                        <div id="processing_card_markup" className="echly-feedback-card echly-feedback-processing">
L488:                          <span className="echly-spinner" aria-hidden />
L489:                          <span className="echly-processing-text">
L490:                            Processing feedback...
L491:                          </span>
L492:                        </div>
L493:                      )}
L494:                      {hasTickets &&
L495:                        state.pointers.map((p) => (
L496:                          <FeedbackItem
L497:                            key={p.id}
L498:                            item={p}
L499:                            onUpdate={onUpdate ?? handlers.updatePointer}
L500:                            onDelete={handlers.deletePointer}
L501:                            highlightTicketId={state.highlightTicketId}
L502:                            onExpandChange={handlers.setExpandedId}
L503:                          />
L504:                        ))}
L505:                    </div>
L506:                  </div>
L507:                )}
L508:                {sessionModeActive && !hasTickets && !isProcessingFeedback && !(feedbackJobs && feedbackJobs.length > 0) && !sessionLoading && (
L509:                  <div className="echly-empty-session-state" aria-live="polite">
L510:                    <span className="echly-empty-session-text">No feedback yet. Add feedback from the page.</span>
L511:                  </div>
L512:                )}
L513:                {extensionMode && showHomeScreen && (
L514:                  <div className="echly-mode-container">
L515:                    <div className="echly-mode-header-block">
L516:                      <div className="echly-ai-powered" aria-hidden>
L517:                        <Zap size={12} strokeWidth={2} aria-hidden />
L518:                        <span>Powered by GPT-4 + Whisper</span>
L519:                      </div>
L520:                      <div className="echly-mode-header">Select feedback mode</div>
L521:                    </div>
L522:                    <div
L523:                      className={`echly-mode-tile echly-mode-card voice-mode ${captureMode === "voice" ? "selected" : ""}`}
L524:                      onClick={() => {
L525:                        if (isStartingSession) return;
L526:                        if (captureMode !== "voice") {
L527:                          setMode("voice");
L528:                        } else {
L529:                          setMicDropdownOpen(true);
L530:                        }
L531:                      }}
L532:                      onKeyDown={(e) => {
L533:                        if (isStartingSession) return;
L534:                        if (e.key === "Enter") {
L535:                          if (captureMode !== "voice") {
L536:                            setMode("voice");
L537:                          } else {
L538:                            setMicDropdownOpen(true);
L539:                          }
L540:                        }
L541:                      }}
L542:                      role="button"
L543:                      tabIndex={0}
L544:                      aria-pressed={captureMode === "voice"}
L545:                      aria-label={captureMode === "voice" ? "Voice (Recommended). Click to select microphone." : "Voice (Recommended)"}
L546:                    >
L547:                      <span className="echly-mode-card-icon echly-mic-trigger" aria-hidden>
L548:                        <Mic size={18} strokeWidth={2} />
L549:                      </span>
L550:                      <span className="echly-mode-card-title">Voice (Recommended)</span>
L551:                    </div>
L552:                    <div
L553:                      className={`echly-mode-tile echly-mode-card text-mode ${captureMode === "text" ? "selected" : ""}`}
L554:                      onClick={() => {
L555:                        if (isStartingSession) return;
L556:                        setMode("text");
L557:                      }}
L558:                      onKeyDown={(e) => {
L559:                        if (isStartingSession) return;
L560:                        if (e.key === "Enter") setMode("text");
L561:                      }}
L562:                      role="button"
L563:                      tabIndex={0}
L564:                      aria-pressed={captureMode === "text"}
L565:                    >
L566:                      <span className="echly-mode-card-icon">
L567:                        <PenLine className="mode-icon" size={18} strokeWidth={2} />
L568:                      </span>
L569:                      <span className="echly-mode-card-title">Write</span>
L570:                    </div>
L571:                  </div>
L572:                )}
L573:
L574:                {state.errorMessage && (
L575:                  <div className="echly-sidebar-error">
L576:                    {state.errorMessage}
L577:                  </div>
L578:                )}
L579:              </div>
L580:              )}
L581:
L582:              {!(effectiveSessionLimitReached && !sessionId) && showHomeScreen && (
L583:                <>
L584:                  <div className="echly-command-divider" aria-hidden />
L585:                  <WidgetFooter
L586:                  isIdle={!isStartingSession}
L587:                  onAddFeedback={handlers.handleAddFeedback}
L588:                  startCapture={handlers.startCapture}
L589:                  extensionMode={extensionMode}
L590:                  onStartSession={handlers.startSession}
L591:                  onOpenPreviousSession={handlePreviousSessions}
L592:                  openingPrevious={false}
L593:                  hasActiveSession={hasStoredSession}
L594:                  captureDisabled={captureDisabled}
L595:                />
L596:                </>
L597:              )}
L598:            </div>
L599:          </div>
L600:        </>
L601:      )}
L602:    </>
L603:  );
L604:}
L605:
```

## 2. Portal Structure

### Portal map (where each component lands in the DOM)

Hierarchy diagram (runtime):

```
Shadow DOM (in #echly-shadow-host)
└─ React root container (ROOT_ID / #echly-root)
   ├─ CaptureWidget (normal DOM under React tree)
   │  ├─ Sidebar (.echly-sidebar-container, fixed, zIndex 2147483647)  [in shadow DOM]
   │  └─ CaptureLayer (rendered when captureRootEl exists)
   │
   └─ #echly-capture-root (capture root node created by useCaptureWidget)
      └─ CaptureLayer createPortal(captureContent, portalTarget)
         ├─ SessionOverlay createPortal(content, captureRoot)
         │  ├─ SessionControlPanel (fixed, zIndex 2147483646)
         │  └─ VoiceCapturePanel
         │     ├─ VoiceCapturePanel createPortal({ dimLayer, card }, captureRoot)
         │     │  └─ mic dropdown createPortal(menuDiv, document.body)  [outside shadow DOM]
         │     └─ (card uses .echly-capture-card with overflow:hidden)
         └─ RegionCaptureOverlay (rendered inside portalTarget tree)
```

Component placement rules from code:
- `CaptureWidget` → normal DOM under the React root container in the extension shadow root (`content.tsx` mounts React into a shadow DOM container).
- `CaptureLayer` → `createPortal(captureContent, portalTarget)` where `portalTarget = captureRootParent ?? captureRoot`.
- `SessionOverlay` → `createPortal(content, captureRoot)`.
- `VoiceCapturePanel`:
  - Main overlay card + dim: `createPortal(<> {dimLayer}{card} </>, captureRoot)`.
  - Mic selector dropdown: `createPortal(dropdownDiv, document.body)`.

### CaptureLayer.tsx (FULL file)

```tsx
L1:"use client";
L2:
L3:import React from "react";
L4:import { createPortal } from "react-dom";
L5:import { RegionCaptureOverlay, SessionOverlay } from "./internal/overlayHelpers";
L6:import type { CaptureContext, SessionFeedbackPending, VoiceCaptureError } from "./types";
L7:
L8:export type CaptureLayerState =
L9:  | "focus_mode"
L10:  | "region_selecting"
L11:  | "voice_listening"
L12:  | "processing"
L13:  | "idle"
L14:  | "success"
L15:  | "cancelled"
L16:  | "error";
L17:
L18:export type CaptureLayerProps = {
L19:  captureRoot: HTMLDivElement;
L20:  /** When set (e.g. dashboard), overlays are portaled into this root so they appear above host UI. */
L21:  captureRootParent?: HTMLElement | null;
L22:  extensionMode: boolean;
L23:  state: CaptureLayerState;
L24:  getFullTabImage: () => Promise<string | null>;
L25:  onRegionCaptured: (croppedDataUrl: string, context?: CaptureContext | null) => void;
L26:  onRegionSelectStart: () => void;
L27:  onCancelCapture: () => void;
L28:  /** Session Feedback Mode: when true, show session overlay instead of region capture */
L29:  sessionMode?: boolean;
L30:  /** Optimistic UI: when true, render session overlay even before sessionId/global state arrives. */
L31:  optimisticSessionStarting?: boolean;
L32:  /** From background (ECHLY_GLOBAL_STATE). Overlay only shows when true and sessionId is set to avoid stale state. */
L33:  globalSessionModeActive?: boolean;
L34:  /** Active session ID. Overlay only shows when set to avoid stale state. */
L35:  sessionId?: string;
L36:  sessionPaused?: boolean;
L37:  pausePending?: boolean;
L38:  endPending?: boolean;
L39:  isFinishing?: boolean;
L40:  sessionFeedbackPending?: SessionFeedbackPending | null;
L41:  onSessionElementClicked?: (element: Element) => void;
L42:  onSessionPause?: () => void;
L43:  onSessionResume?: () => void;
L44:  onSessionEnd?: () => void;
L45:  onSessionRecordVoice?: () => void;
L46:  onSessionDoneVoice?: () => void;
L47:  onSessionSaveText?: (transcript: string) => void;
L48:  onSessionFeedbackCancel?: () => void;
L49:  /** When "voice", element click opens voice UI; when "text", opens text UI. No per-click choice. */
L50:  captureMode?: "voice" | "text";
L51:  /** 0–1 normalized level for voice waveform (from useCaptureWidget state). */
L52:  listeningAudioLevel?: number;
L53:  /** AnalyserNode for real-time audio visualizer (from useCaptureWidget state). */
L54:  audioAnalyser?: AnalyserNode | null;
L55:  voiceError?: VoiceCaptureError;
L56:  onRetryVoice?: () => void;
L57:  onSelectMicrophone?: (deviceId: string) => void;
L58:  voiceMicDeviceId?: string;
L59:};
L60:
L61:/**
L62: * Overlay + region → #echly-capture-root.
L63: * When sessionMode is true, only SessionOverlay is shown (no region drag).
L64: */
L65:export function CaptureLayer({
L66:  captureRoot,
L67:  captureRootParent,
L68:  extensionMode,
L69:  state,
L70:  getFullTabImage,
L71:  onRegionCaptured,
L72:  onRegionSelectStart,
L73:  onCancelCapture,
L74:  sessionMode = false,
L75:  optimisticSessionStarting = false,
L76:  globalSessionModeActive = false,
L77:  sessionId: sessionIdProp,
L78:  sessionPaused = false,
L79:  pausePending = false,
L80:  endPending = false,
L81:  isFinishing = false,
L82:  sessionFeedbackPending = null,
L83:  onSessionElementClicked,
L84:  onSessionPause,
L85:  onSessionResume,
L86:  onSessionEnd,
L87:  onSessionRecordVoice,
L88:  onSessionDoneVoice,
L89:  onSessionSaveText,
L90:  onSessionFeedbackCancel = () => {},
L91:  captureMode = "voice",
L92:  listeningAudioLevel = 0,
L93:  audioAnalyser = null,
L94:  voiceError = null,
L95:  onRetryVoice,
L96:  onSelectMicrophone,
L97:  voiceMicDeviceId = "",
L98:}: CaptureLayerProps) {
L99:  if (extensionMode && (!sessionMode || (!sessionIdProp && !optimisticSessionStarting))) return null;
L100:  const showSessionOverlay =
L101:    sessionMode &&
L102:    extensionMode &&
L103:    ((!!globalSessionModeActive && !!sessionIdProp) || optimisticSessionStarting);
L104:  const showRegionOverlay =
L105:    !showSessionOverlay && (state === "focus_mode" || state === "region_selecting");
L106:  /* Do not show focus overlay when region overlay is shown (avoids full-screen pointer-events:auto blocking scroll). */
L107:  const showDimOverlay =
L108:    !showSessionOverlay &&
L109:    !showRegionOverlay &&
L110:    (state === "focus_mode" || state === "region_selecting");
L111:
L112:  const captureContent = (
L113:    <>
L114:      {showSessionOverlay && onSessionElementClicked && onSessionPause && onSessionResume && onSessionEnd && onSessionRecordVoice && onSessionDoneVoice && onSessionSaveText && (
L115:        <SessionOverlay
L116:          captureRoot={captureRoot}
L117:          sessionMode={sessionMode}
L118:          sessionPaused={sessionPaused}
L119:          pausePending={pausePending}
L120:          endPending={endPending}
L121:          isFinishing={isFinishing}
L122:          sessionFeedbackPending={sessionFeedbackPending ?? null}
L123:          state={state}
L124:          captureMode={captureMode}
L125:          listeningAudioLevel={listeningAudioLevel}
L126:          audioAnalyser={audioAnalyser ?? null}
L127:          voiceError={voiceError}
L128:          onRetryVoice={onRetryVoice}
L129:          onSelectMicrophone={onSelectMicrophone}
L130:          voiceMicDeviceId={voiceMicDeviceId}
L131:          onElementClicked={onSessionElementClicked}
L132:          onPause={onSessionPause}
L133:          onResume={onSessionResume}
L134:          onEnd={onSessionEnd}
L135:          onRecordVoice={onSessionRecordVoice}
L136:          onDoneVoice={onSessionDoneVoice}
L137:          onSaveText={onSessionSaveText}
L138:          onCancel={onSessionFeedbackCancel}
L139:        />
L140:      )}
L141:      {showDimOverlay && (
L142:        <div
L143:          className="echly-focus-overlay"
L144:          style={{
L145:            position: "fixed",
L146:            inset: 0,
L147:            background: "rgba(0,0,0,0.08)",
L148:            pointerEvents: "auto",
L149:            cursor: "crosshair",
L150:            zIndex: 999999,
L151:          }}
L152:          aria-hidden
L153:        />
L154:      )}
L155:      {showRegionOverlay && (
L156:        <RegionCaptureOverlay
L157:          getFullTabImage={getFullTabImage}
L158:          onAddVoice={onRegionCaptured}
L159:          onCancel={onCancelCapture}
L160:          onSelectionStart={onRegionSelectStart}
L161:        />
L162:      )}
L163:    </>
L164:  );
L165:
L166:  const portalTarget = captureRootParent ?? captureRoot;
L167:  return (
L168:    <>
L169:      {createPortal(captureContent, portalTarget)}
L170:    </>
L171:  );
L172:}
```


## 3. Component Tree

### SessionOverlay.tsx (FULL file)

```tsx
L1:"use client";
L2:
L3:import React, { useEffect, useRef, useState } from "react";
L4:import { createPortal } from "react-dom";
L5:import { attachElementHighlighter, detachElementHighlighter } from "./session/elementHighlighter";
L6:import { attachClickCapture, detachClickCapture } from "./session/clickCapture";
L7:import { SessionControlPanel } from "./SessionControlPanel";
L8:import { VoiceCapturePanel } from "./VoiceCapturePanel";
L9:import { TextFeedbackPanel } from "./TextFeedbackPanel";
L10:import type { CaptureContext, SessionFeedbackPending, VoiceCaptureError } from "@/lib/capture-engine/core/types";
L11:
L12:function createCommentCursor() {
L13:  const svg = [
L14:    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">`,
L15:    `<path fill="white" stroke="black" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
L16:    `</svg>`,
L17:  ].join("");
L18:  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 6 6, auto`;
L19:}
L20:
L21:const COMMENT_CURSOR = createCommentCursor();
L22:
L23:export type SessionOverlayProps = {
L24:  captureRoot: HTMLDivElement;
L25:  sessionMode: boolean;
L26:  sessionPaused: boolean;
L27:  pausePending?: boolean;
L28:  endPending?: boolean;
L29:  isFinishing?: boolean;
L30:  sessionFeedbackPending: SessionFeedbackPending | null;
L31:  state: string;
L32:  onElementClicked: (element: Element) => void;
L33:  onPause: () => void;
L34:  onResume: () => void;
L35:  onEnd: () => void;
L36:  onRecordVoice: () => void;
L37:  onDoneVoice: () => void;
L38:  onSaveText: (transcript: string) => void;
L39:  onCancel?: () => void;
L40:  captureMode?: "voice" | "text";
L41:  listeningAudioLevel?: number;
L42:  audioAnalyser?: AnalyserNode | null;
L43:  voiceError?: VoiceCaptureError;
L44:  onRetryVoice?: () => void;
L45:  onSelectMicrophone?: (deviceId: string) => void;
L46:  voiceMicDeviceId?: string;
L47:};
L48:
L49:/**
L50: * Renders session UI into capture root and attaches highlighter + click capture.
L51: * When sessionMode and !sessionPaused, hover and click are active; when sessionFeedbackPending
L52: * is set, click capture is effectively disabled (popup is on top and has data-echly-ui).
L53: */
L54:export function SessionOverlay({
L55:  captureRoot,
L56:  sessionMode,
L57:  sessionPaused,
L58:  pausePending = false,
L59:  endPending = false,
L60:  isFinishing = false,
L61:  sessionFeedbackPending,
L62:  state,
63:  onElementClicked,
L64:  onPause,
L65:  onResume,
L66:  onEnd,
L67:  onRecordVoice,
L68:  onDoneVoice,
L69:  onSaveText,
L70:  onCancel,
L71:  captureMode = "voice",
L72:  listeningAudioLevel = 0,
L73:  audioAnalyser = null,
L74:  voiceError = null,
L75:  onRetryVoice,
L76:  onSelectMicrophone,
L77:  voiceMicDeviceId = "",
L78:}: SessionOverlayProps) {
L79:  const cleanupRef = useRef<(() => void)[]>([]);
L80:  const voiceStartedForPendingRef = useRef(false);
L81:  const sessionActionPending = pausePending || endPending;
L82:  const sessionCursorActive = sessionMode && !sessionPaused && !sessionActionPending;
L83:
L84:  useEffect(() => {
L85:    if (!sessionMode || !captureRoot) return;
L86:    const getActive = () =>
L87:      sessionMode &&
L88:      !sessionPaused &&
L89:      !sessionActionPending &&
L90:      sessionFeedbackPending == null;
L91:    cleanupRef.current.push(
L92:      attachElementHighlighter(captureRoot, { getActive })
L93:    );
L94:    cleanupRef.current.push(
L95:      attachClickCapture(captureRoot, {
L96:        enabled: getActive,
L97:        onElementClicked,
L98:      })
L99:    );
L100:    return () => {
L101:      cleanupRef.current.forEach((fn) => fn());
L102:      cleanupRef.current = [];
L103:      detachElementHighlighter();
L104:      detachClickCapture();
L105:    };
L106:  }, [
L107:    sessionMode,
L108:    captureRoot,
L109:    sessionPaused,
L110:    sessionActionPending,
L111:    sessionFeedbackPending,
L112:    onElementClicked,
L113:  ]);
L114:
L115:  /* Keep feedback cursor scoped to active session capture mode. */
L116:  useEffect(() => {
L117:    if (!captureRoot?.isConnected) return;
L118:    const previousCursor = document.body.style.cursor;
L119:    document.body.style.cursor = sessionCursorActive ? COMMENT_CURSOR : "";
L120:    return () => {
L121:      document.body.style.cursor = previousCursor;
L122:    };
L123:  }, [sessionCursorActive, captureRoot]);
L124:
L125:  /* When captureMode is voice and we have pending feedback, start voice recording immediately (once). */
L126:  useEffect(() => {
L127:    if (!sessionFeedbackPending || captureMode !== "voice" || voiceStartedForPendingRef.current) return;
L128:    voiceStartedForPendingRef.current = true;
L129:    onRecordVoice();
L130:  }, [sessionFeedbackPending, captureMode, onRecordVoice]);
L131:
L132:  useEffect(() => {
L133:    if (!sessionFeedbackPending) voiceStartedForPendingRef.current = false;
L134:  }, [sessionFeedbackPending]);
L135:
L136:  if (!sessionMode || !captureRoot) return null;
L137:
L138:  const content = (
L139:    <>
L140:      {sessionFeedbackPending && (
L141:        <div
L142:          className="echly-dim-layer echly-dim-layer--visible"
L143:          aria-hidden
L144:        />
L145:      )}
L146:      <div
L147:        aria-hidden
L148:        className="echly-session-overlay-cursor"
L149:        style={{
L150:          position: "fixed",
L151:          inset: 0,
L152:          pointerEvents: "none",
L153:          zIndex: 2147483645,
L154:          cursor: sessionCursorActive ? COMMENT_CURSOR : "default",
L155:        }}
L156:      />
L157:      <SessionControlPanel
L158:        sessionPaused={sessionPaused}
L159:        pausePending={pausePending}
L160:        endPending={endPending}
L161:        onPause={onPause}
L162:        onResume={onResume}
L163:        onEnd={onEnd}
L164:      />
L165:      {sessionFeedbackPending && captureMode === "voice" && (
L166:        <VoiceCapturePanel
L167:          captureRoot={captureRoot}
L168:          screenshot={sessionFeedbackPending.screenshot ?? undefined}
L169:          audioLevel={listeningAudioLevel}
L170:          isListening={state === "voice_listening" && !isFinishing && !voiceError}
L171:          isFinishing={isFinishing}
L172:          onFinish={onDoneVoice}
L173:          onCancel={onCancel}
L174:          analyser={!isFinishing && !voiceError ? (audioAnalyser ?? null) : null}
L175:          voiceError={voiceError}
L176:          onRetryVoice={onRetryVoice}
L177:          onSelectMicrophone={onSelectMicrophone}
L178:          voiceMicDeviceId={voiceMicDeviceId}
L179:        />
L180:      )}
L181:      {sessionFeedbackPending && captureMode === "text" && (
L182:        <TextFeedbackPanel
L183:          screenshot={sessionFeedbackPending.screenshot ?? undefined}
L184:          onSubmit={onSaveText}
L185:          onCancel={onCancel}
L186:        />
L187:      )}
L188:    </>
L189:  );
L190:
L191:  return createPortal(content, captureRoot);
L192:}
```

### Voice Panel (FULL file)

### VoiceCapturePanel.tsx (FULL file)

```tsx
L1:"use client";
L2:
L3:import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
L4:import { createPortal } from "react-dom";
L5:import { MicOff } from "lucide-react";
L6:import ChatGPTWaveform from "@/components/ChatGPTWaveform";
L7:import type { VoiceCaptureError } from "@/lib/capture-engine/core/types";
L8:
L9:export type VoiceCapturePanelProps = {
L10:  /** 0–1 normalized microphone level (legacy, visualizer uses analyser when provided) */
L11:  audioLevel: number;
L12:  onFinish: () => void;
L13:  /** Called when user cancels (e.g. Escape). Discards the capture session. */
L14:  onCancel?: () => void;
L15:  /** Optional screenshot for context (session element capture) */
L16:  screenshot?: string;
L17:  isListening?: boolean;
L18:  isFinishing?: boolean;
L19:  /** AnalyserNode for real-time horizontal bar visualizer */
L20:  analyser?: AnalyserNode | null;
L21:  /** DOM node to portal into (#echly-capture-root). Required for correct viewport positioning. */
L22:  captureRoot?: HTMLDivElement | null;
L23:  /** Voice capture failure — alternative recoverable UI */
L24:  voiceError?: VoiceCaptureError;
L25:  /** Retry after failure (restarts recording / MediaRecorder) */
L26:  onRetryVoice?: () => void;
L27:  /** User picked a microphone from the failure UI */
L28:  onSelectMicrophone?: (deviceId: string) => void;
L29:  /** Currently selected input device (for picker highlight) */
L30:  voiceMicDeviceId?: string;
L31:};
L32:
L33:export function VoiceCapturePanel({
L34:  audioLevel: _audioLevel,
L35:  onFinish,
L36:  onCancel,
L37:  screenshot,
L38:  isListening = true,
L39:  isFinishing = false,
L40:  analyser = null,
L41:  captureRoot = null,
L42:  voiceError = null,
L43:  onRetryVoice,
L44:  onSelectMicrophone,
L45:  voiceMicDeviceId = "",
L46:}: VoiceCapturePanelProps) {
L47:  const [recordingStarted, setRecordingStarted] = useState(false);
L48:  const [micPickerOpen, setMicPickerOpen] = useState(false);
L49:  const [micDevices, setMicDevices] = useState<Array<{ deviceId: string; label: string }>>([]);
L50:  const [micDropdownRect, setMicDropdownRect] = useState<{
L51:    top: number;
L52:    left: number;
L53:    width: number;
L54:    maxHeight: number;
L55:    placement: "up" | "down";
L56:  } | null>(null);
L57:  const micPickerRef = useRef<HTMLDivElement>(null);
L58:  const micTriggerRef = useRef<HTMLButtonElement>(null);
L59:
L60:  const showFailure = Boolean(voiceError);
L61:  const cardVisible = recordingStarted || showFailure;
L62:
L63:  useEffect(() => {
L64:    if (analyser && !recordingStarted && !showFailure) {
L65:      setRecordingStarted(true);
L66:    }
L67:  }, [analyser, recordingStarted, showFailure]);
L68:
L69:  useEffect(() => {
L70:    if (showFailure) {
L71:      setRecordingStarted(true);
L72:    }
L73:  }, [showFailure]);
L74:
L75:  const updateMicDropdownPosition = useCallback(() => {
L76:    const btn = micTriggerRef.current;
L77:    if (!btn || !micPickerOpen) return;
L78:    const rect = btn.getBoundingClientRect();
L79:    const margin = 8;
L80:    const maxScroll = 200;
L81:    const spaceAbove = rect.top - margin;
L82:    const spaceBelow = window.innerHeight - rect.bottom - margin;
L83:    /** Prefer drop-up when there is enough room for the menu above the button, or more space above than below. */
L84:    const canFitFullMenuUp = spaceAbove >= maxScroll + margin;
L85:    const preferUp =
L86:      canFitFullMenuUp || (spaceAbove >= spaceBelow && spaceAbove >= Math.min(maxScroll, 80));
L87:
L88:    let placement: "up" | "down";
L89:    let top: number;
L90:    let maxHeight: number;
L91:    let left = rect.left;
L92:    let width = rect.width;
L93:
L94:    if (preferUp) {
L95:      placement = "up";
L96:      maxHeight = Math.min(maxScroll, Math.max(margin * 2, spaceAbove));
L97:      top = rect.top - margin - maxHeight;
L98:      if (top < margin) {
L99:        maxHeight = Math.max(margin * 2, rect.top - margin * 2);
L100:        top = margin;
L101:      }
L102:    } else {
L103:      placement = "down";
L104:      maxHeight = Math.min(maxScroll, Math.max(margin * 2, spaceBelow));
L105:      top = rect.bottom + margin;
L106:      if (top + maxHeight > window.innerHeight - margin) {
L107:        maxHeight = Math.max(margin * 2, window.innerHeight - margin - top);
L108:      }
L109:    }
L110:
L111:    if (left + width > window.innerWidth - margin) {
L112:      left = Math.max(margin, window.innerWidth - margin - width);
L113:    }
L114:    if (left < margin) {
L115:      width = Math.min(width, window.innerWidth - 2 * margin);
L116:      left = margin;
L117:    }
L118:
L119:    setMicDropdownRect({ top, left, width, maxHeight, placement });
L120:  }, [micPickerOpen]);
L121:
L122:  useLayoutEffect(() => {
L123:    if (!micPickerOpen || micDevices.length === 0) {
L124:      setMicDropdownRect(null);
L125:      return;
L126:    }
L127:    updateMicDropdownPosition();
L128:    const onResizeOrScroll = () => updateMicDropdownPosition();
L129:    window.addEventListener("resize", onResizeOrScroll);
L130:    window.addEventListener("scroll", onResizeOrScroll, true);
L131:    return () => {
L132:      window.removeEventListener("resize", onResizeOrScroll);
L133:      window.removeEventListener("scroll", onResizeOrScroll, true);
L134:    };
L135:  }, [micPickerOpen, micDevices.length, updateMicDropdownPosition]);
L136:
L137:  useEffect(() => {
L138:    if (!onCancel) return;
L139:    const onKeyDown = (e: KeyboardEvent) => {
L140:      if (e.key === "Escape") {
L141:        if (micPickerOpen) {
L142:          e.preventDefault();
L143:          e.stopPropagation();
L144:          setMicPickerOpen(false);
L145:          return;
L146:        }
L147:        e.preventDefault();
L148:        onCancel();
L149:      }
L150:    };
L151:    window.addEventListener("keydown", onKeyDown);
L152:    return () => window.removeEventListener("keydown", onKeyDown);
L153:  }, [onCancel, micPickerOpen]);
L154:
L155:  useEffect(() => {
L156:    if (!micPickerOpen) return;
L157:    const onMouseDown = (e: MouseEvent) => {
L158:      const target = e.target as Node;
L159:      if (micPickerRef.current?.contains(target)) return;
L160:      if (micTriggerRef.current?.contains(target)) return;
L161:      setMicPickerOpen(false);
L162:    };
L163:    document.addEventListener("mousedown", onMouseDown);
L164:    return () => document.removeEventListener("mousedown", onMouseDown);
L165:  }, [micPickerOpen]);
L166:
L167:  const openMicPicker = useCallback(async () => {
L168:    try {
L169:      const list = await navigator.mediaDevices.enumerateDevices();
L170:      const inputs = list.filter((d) => d.kind === "audioinput");
L171:      setMicDevices(
L172:        inputs.map((d, i) => ({
L173:          deviceId: d.deviceId,
L174:          label: d.label?.trim() || `Microphone ${i + 1}`,
L175:        }))
L176:      );
L177:      setMicPickerOpen(true);
L178:    } catch {
L179:      setMicDevices([]);
L180:    }
L181:  }, []);
L182:
L183:  /** Body avoids stacking-context clipping (extension / modal); fixed coords keep menu in viewport. */
L184:  const micDropdownPortalTarget =
L185:    typeof document !== "undefined" ? document.body : null;
L186:
L187:  const micDropdownMenu =
L188:    micPickerOpen &&
L189:    micDevices.length > 0 &&
L190:    micDropdownRect &&
L191:    micDropdownPortalTarget ? (
L192:      createPortal(
L193:        <div
L194:          ref={micPickerRef}
L195:          className={`echly-voice-mic-dropdown echly-voice-mic-dropdown--${micDropdownRect.placement}`}
L196:          style={{
L197:            position: "fixed",
L198:            top: micDropdownRect.top,
L199:            left: micDropdownRect.left,
L200:            width: micDropdownRect.width,
L201:            maxHeight: micDropdownRect.maxHeight,
L202:            zIndex: 9999,
L203:          }}
L204:          role="listbox"
L205:          aria-label="Microphones"
L206:        >
L207:          {micDevices.map((d) => (
L208:            <button
L209:              key={d.deviceId}
L210:              type="button"
L211:              role="option"
L212:              className={`echly-voice-mic-option ${d.deviceId === voiceMicDeviceId ? "echly-voice-mic-option--active" : ""}`}
L213:              onClick={() => {
L214:                onSelectMicrophone?.(d.deviceId);
L215:                setMicPickerOpen(false);
L216:              }}
L217:            >
L218:              {d.label}
L219:            </button>
L220:          ))}
L221:        </div>,
L222:        micDropdownPortalTarget
L223:      )
L224:    ) : null;
L225:
L226:  const failureCopy = (() => {
L227:    if (voiceError === "mic_permission") {
L228:      return {
L229:        title: "Microphone access is required",
L230:        description: "Allow microphone access in your browser settings to record voice feedback.",
L231:      };
L232:    }
L233:    if (voiceError === "transcription_failed") {
L234:      return {
L235:        title: "Couldn't transcribe that",
L236:        description: "Something went wrong while processing audio. Try speaking again or check your connection.",
L237:      };
L238:    }
L239:    return {
L240:      title: "Couldn't hear anything",
L241:      description: "We didn't detect clear audio. Check your microphone and try again.",
L242:    };
L243:  })();
L244:
L245:  const dimLayer = (
L246:    <div
L247:      className={`echly-dim-layer ${cardVisible ? "echly-dim-layer--visible" : ""}`}
L248:      aria-hidden
L249:    />
L250:  );
L251:
L252:  const failureBody = showFailure && (
L253:    <div className="echly-voice-failure-body">
L254:      <div className="echly-voice-failure-icon-wrap" aria-hidden>
L255:        <MicOff size={40} strokeWidth={1.5} />
L256:      </div>
L257:      <div className="echly-capture-header echly-voice-failure-header">
L258:        <h2 className="echly-capture-title">{failureCopy.title}</h2>
L259:        <p className="echly-capture-instruction">{failureCopy.description}</p>
L260:      </div>
L261:      <div className="echly-voice-failure-actions">
L262:        <button
L263:          type="button"
L264:          className="echly-finish-btn"
L265:          onClick={() => onRetryVoice?.()}
L266:        >
L267:          Try Again
L268:        </button>
L269:        <div className="echly-voice-failure-secondary-wrap">
L270:          <button
L271:            ref={micTriggerRef}
L272:            type="button"
L273:            className="echly-voice-failure-secondary"
L274:            onClick={() => void openMicPicker()}
L275:            aria-expanded={micPickerOpen}
L276:            aria-haspopup="listbox"
L277:          >
L278:            Select Microphone
L279:          </button>
L280:        </div>
L281:      </div>
L282:    </div>
L283:  );
L284:
L285:  const normalBody = !showFailure && (
L286:    <>
L287:      <div className="echly-capture-header">
L288:        <h2 className="echly-capture-title">Voice Feedback</h2>
L289:        <p className="echly-capture-instruction">Describe the issue - Echly will structure it.</p>
L290:      </div>
L291:
L292:      <div className="echly-capture-visualizer">
L293:        <div className="echly-waveform-container">
L294:          <ChatGPTWaveform analyser={analyser} />
L295:        </div>
L296:      </div>
L297:
L298:      <div className="echly-capture-status">
L299:        {!isFinishing && isListening ? (
L300:          <>
L301:            <span className="echly-recording-dot" aria-hidden />
L302:            Recording
L303:          </>
L304:        ) : (
L305:          ""
L306:        )}
L307:      </div>
L308:
L309:      <button
L310:        type="button"
L311:        className="echly-finish-btn"
L312:        onClick={onFinish}
L313:        disabled={isFinishing}
L314:        aria-busy={isFinishing}
L315:      >
L316:        {isFinishing ? (
L317:          <>
L318:            <span className="echly-spinner" aria-hidden style={{ marginRight: 8 }} />
L319:            Finishing...
L320:          </>
L321:        ) : (
L322:          "Finish"
L323:        )}
L324:      </button>
L325:      <p className="echly-capture-cancel-hint">(Press Esc to cancel)</p>
L326:    </>
L327:  );
L328:
L329:  const card = (
L330:    <div
L331:      className={`echly-capture-card panel ${cardVisible ? "echly-capture-card--visible" : ""}`}
L332:      data-echly-ui="true"
L333:    >
L334:      <div className="echly-capture-card-blur-bg panel-bg" aria-hidden />
L335:      <div className="echly-capture-card-content panel-content">
L336:        {screenshot && (
L337:          <div className="echly-capture-screenshot-preview">
L338:            <img src={screenshot} alt="Capture" />
L339:          </div>
L340:        )}
L341:        {failureBody}
L342:        {normalBody}
L343:      </div>
L344:    </div>
L345:  );
L346:
L347:  return (
L348:    <>
L349:      {captureRoot ? (
L350:        createPortal(
L351:          <>
L352:            {dimLayer}
L353:            {card}
L354:          </>,
L355:          captureRoot
L356:        )
L357:      ) : (
L358:        card
L359:      )}
L360:      {micDropdownMenu}
L361:    </>
L362:  );
L363:}
```


## 4. Z-Index Map

This section compiles z-index + positioning values from the popup overlay source code paths discovered in:
- `lib/capture-engine/core/CaptureWidget.tsx`
- `lib/capture-engine/core/CaptureLayer.tsx`
- `lib/capture-engine/core/hooks/useCaptureWidget.ts`
- `components/CaptureWidget/SessionOverlay.tsx`
- `components/CaptureWidget/VoiceCapturePanel.tsx`
- `components/CaptureWidget/SessionControlPanel.tsx`
- `components/CaptureWidget/TextFeedbackPanel.tsx`
- `components/CaptureWidget/RegionCaptureOverlay.tsx`
- `components/CaptureWidget/session/elementHighlighter.ts`
- `components/CaptureWidget/session/feedbackMarkers.ts`
- CSS: `app/globals.css` and `echly-extension/popup.css` (restricted to the selectors requested in Step 6)

### High-level overlay priority bands (from code)

1. `2147483647` (top-most trays/modals/voice UI)
   - Sidebar container (`CaptureWidget` extension-mode inline style)
   - Voice pill wrappers/rows (`.echly-voice-pill-wrapper`, `.echly-voice-row` in CSS)
   - Text feedback panel (`TextFeedbackPanel` inline style)
2. `2147483646` (backdrop/control/capture card)
   - Backdrop (`.echly-backdrop` inline style in `CaptureWidget`)
   - Session control panel (`SessionControlPanel`)
   - Capture card (`.echly-capture-card` in CSS; used by VoiceCapturePanel createPortal)
3. `2147483645` (captureRoot + session cursor)
   - capture root (`useCaptureWidget` sets `captureEl.style.zIndex = "2147483645"`)
   - Session overlay cursor (`SessionOverlay` fixed cursor zIndex)
4. `2147483644` (marker layer + dim layer)
   - Marker layer z-index (`MARKER_LAYER_Z = 2147483644` in `useCaptureWidget`)
   - Dim layer z-index (`.echly-dim-layer` in CSS)
5. `999999` / `999998` (region capture overlay UI + cutout/dim)
   - Focus overlay in `CaptureLayer` uses `zIndex: 999999`
   - Region overlay uses `zIndex: 999999` and internal layers `999998`
6. `9999` (voice mic dropdown list)
   - Mic dropdown menu inline style sets `zIndex: 9999`
   - `.echly-voice-mic-dropdown` CSS also sets `z-index: 9999`

### Explicit z-index + positioning values (non-exhaustive, but cover all requested layers)

Capture root / overlay containers:
- `useCaptureWidget.ts`: `OVERLAY_ROOT_ID = "echly-capture-root"`.
- `useCaptureWidget.ts`: `captureEl.style.pointerEvents = "none"` and `captureEl.style.zIndex = "2147483645"`. (No `position` style is set on `captureEl` in this code.)
- `useCaptureWidget.ts`: Marker layer (`#echly-marker-layer`) uses `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 2147483644`.

Sidebar / host trays:
- `CaptureWidget.tsx`: when `extensionMode`, the sidebar container has inline style:
  - `position: "fixed"`
  - either `{ left: state.position.x, top: state.position.y }` or `{ bottom: "24px", right: "24px" }`
  - `zIndex: 2147483647`
  - `pointerEvents: "auto"`
- `CaptureWidget.tsx` (non-extensionMode only): renders `.echly-backdrop` with `position: fixed`, `inset: 0`, `zIndex: 2147483646`.

Capture card + dim:
- `.echly-dim-layer`: `position: fixed`, `inset: 0`, `z-index: 2147483644` (CSS in both `app/globals.css` and `echly-extension/popup.css`).
- `.echly-capture-card`: `position: fixed`, centered via `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`, `z-index: 2147483646` (CSS).
- `.echly-capture-card` hidden by default:
  - `visibility: hidden`, `pointer-events: none`
  - visible state `.echly-capture-card--visible` sets `visibility: visible`, `pointer-events: auto`

Session overlay cursor + controls:
- `SessionOverlay.tsx`: fixed cursor overlay:
  - `position: "fixed"`, `inset: 0`, `pointerEvents: "none"`, `zIndex: 2147483645`
- `SessionControlPanel.tsx`: `position: "fixed"`, `bottom: 24`, centered, `pointerEvents: "auto"`, `zIndex: 2147483646`

Text feedback panel:
- `TextFeedbackPanel.tsx`: `position: "fixed"`, centered, `pointerEvents: "auto"`, `zIndex: 2147483647`

Voice mic dropdown:
- `VoiceCapturePanel.tsx` dropdown menu createPortal:
  - inline `style.position = "fixed"`
  - inline `style.zIndex = 9999`
  - appended via `createPortal(..., document.body)`
- `.echly-voice-mic-dropdown` CSS:
  - `z-index: 9999`
  - `pointer-events: auto` and scroll constraints

Region capture overlay:
- `RegionCaptureOverlay.tsx`: outer container `#echly-overlay`:
  - `position: "fixed"`, `inset: 0`, `zIndex: 999999`
- internal dim overlay: `zIndex: 999998`
- cutout: `zIndex: 999998`
- confirm bar: `zIndex: 999999`

Element highlight overlay:
- `elementHighlighter.ts`: hover overlay:
  - `position: fixed`, `pointer-events: none`, `z-index: 2147483646`
  - appended directly to `captureRoot` container passed to `attachElementHighlighter(...)`.

## 5. CSS Layers

### app/globals.css (restricted blocks)

```css
/* app/globals.css */

/* Voice pill wrapper (z-index 2147483647) */
.echly-voice-pill-wrapper {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 2147483647;
  transition: opacity 200ms ease-out;
  pointer-events: auto;
}
.echly-voice-pill-wrapper.echly-voice-pill--exiting {
  opacity: 0;
  pointer-events: none;
}
.echly-voice-pill {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  height: 48px;
  padding: 0 20px 0 12px;
  border-radius: 14px;
  background: rgba(20, 22, 28, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
  font-family: var(--echly-font);
}
.echly-voice-pill-orb {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 -18px 0 -8px;
}
.echly-voice-pill-orb .echly-mic-orb-wrapper {
  width: 40px;
  height: 40px;
}
.echly-voice-pill-orb .echly-mic-orb-ring,
.echly-voice-pill-orb .echly-mic-orb-processing-ring {
  width: 36px;
  height: 36px;
  margin-left: -18px;
  margin-top: -18px;
}
.echly-voice-pill-orb .echly-mic-orb {
  width: 36px;
  height: 36px;
}
.echly-voice-pill-text {
  color: #F3F4F6;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.echly-voice-pill-dots span {
  animation: echly-pill-dot 1.4s ease-in-out infinite;
}
.echly-voice-pill-dots span:nth-child(2) { animation-delay: 0.2s; }
.echly-voice-pill-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes echly-pill-dot {
  0%, 60%, 100% { opacity: 0.35; }
  30% { opacity: 1; }
}
.echly-voice-pill-done {
  margin-left: 4px;
  padding: 8px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff3b3b, #ff5c5c);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 120ms, transform 80ms;
  box-shadow: 0 2px 12px rgba(255, 59, 59, 0.35);
}
.echly-voice-pill-done:hover { opacity: 0.95; }
.echly-voice-pill-done:active { transform: scale(0.98); }

/* Sidebar container (tray shape); z-index is set inline by CaptureWidget */
.echly-sidebar-container {
  width: 360px;
  max-width: min(360px, calc(100vw - 32px));
  height: auto;
  max-height: 520px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: opacity 140ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 140ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Capture root + dim background (z-index 2147483644) */
#echly-capture-root {
  pointer-events: none;
}
.echly-dim-layer {
  position: fixed;
  inset: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  pointer-events: none;
  z-index: 2147483644;
  transition: background 180ms ease, backdrop-filter 180ms ease, -webkit-backdrop-filter 180ms ease;
}
.echly-dim-layer.echly-dim-layer--visible {
  background: var(--voice-capture-dim-bg);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

/* Capture card (z-index 2147483646) */
.echly-capture-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2147483646;
  width: min(440px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 18px;
  box-shadow: var(--voice-capture-card-shadow);
  display: block;
  font-family: var(--echly-font);
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
.echly-capture-card.echly-capture-card--visible {
  visibility: visible;
  pointer-events: auto;
  animation: echly-capture-card-enter 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.echly-capture-card-blur-bg,
.panel-bg {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: var(--glass-voice-capture-bg);
  border-radius: inherit;
  z-index: 0;
  pointer-events: none;
}
.echly-capture-card-content,
.panel-content {
  position: relative;
  z-index: 1;
  opacity: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

/* Voice capture failure + mic dropdown */
.echly-voice-failure-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 4px auto 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 80, 80, 0.8);
}
html.dark .echly-voice-failure-icon-wrap {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(248, 113, 113, 0.85);
}
.echly-voice-failure-secondary-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.echly-voice-failure-secondary {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  font-family: var(--echly-font);
  background: color-mix(in srgb, var(--text-primary) 6%, transparent);
  color: var(--text-primary);
  transition: background 120ms ease, transform 120ms ease;
  width: 100%;
}
.echly-voice-failure-secondary:hover {
  background: color-mix(in srgb, var(--text-primary) 10%, transparent);
}
.echly-voice-failure-secondary:active {
  transform: scale(0.99);
}
.echly-voice-mic-dropdown {
  box-sizing: border-box;
  pointer-events: auto;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--glass-voice-capture-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 9999;
}
html.dark .echly-voice-mic-dropdown {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.45);
}
.echly-voice-mic-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--echly-font);
  cursor: pointer;
  transition: background 100ms ease;
}
.echly-voice-mic-option:hover {
  background: color-mix(in srgb, var(--text-primary) 8%, transparent);
}
.echly-voice-mic-option--active {
  background: color-mix(in srgb, var(--text-primary) 12%, transparent);
}

/* Voice capsule row (z-index 2147483647) */
.echly-voice-row {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 20px;
  pointer-events: auto;
}
```

### echly-extension/popup.css (restricted blocks)

```css
/* echly-extension/popup.css */

/* Voice pill wrapper (z-index 2147483647) */
.echly-voice-pill-wrapper {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 2147483647;
  transition: opacity 200ms ease-out;
  pointer-events: auto;
}
.echly-voice-pill-wrapper.echly-voice-pill--exiting {
  opacity: 0;
  pointer-events: none;
}
.echly-voice-pill {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  height: 48px;
  padding: 0 20px 0 12px;
  border-radius: 14px;
  background: rgba(20, 22, 28, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
  font-family: var(--echly-font);
}
.echly-voice-pill-text { color: #F3F4F6; font-size: 14px; font-weight: 500; letter-spacing: -0.01em; }
.echly-voice-pill-done:hover { opacity: 0.95; }
.echly-voice-pill-done:active { transform: scale(0.98); }

/* Sidebar container (tray shape); z-index is set inline by CaptureWidget */
.echly-sidebar-container {
  width: 360px;
  max-width: min(360px, calc(100vw - 32px));
  height: auto;
  max-height: 520px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: opacity 140ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 140ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Capture root + dim background (z-index 2147483644) */
#echly-capture-root { pointer-events: none; }
.echly-dim-layer {
  position: fixed;
  inset: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  pointer-events: none;
  z-index: 2147483644;
  transition: background 180ms ease, backdrop-filter 180ms ease, -webkit-backdrop-filter 180ms ease;
}
.echly-dim-layer.echly-dim-layer--visible {
  background: var(--voice-capture-dim-bg);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

/* Capture card (z-index 2147483646) */
.echly-capture-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2147483646;
  width: min(440px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 18px;
  box-shadow: var(--voice-capture-card-shadow);
  display: block;
  font-family: var(--echly-font);
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
.echly-capture-card.echly-capture-card--visible {
  visibility: visible;
  pointer-events: auto;
  animation: echly-capture-card-enter 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.echly-capture-card-blur-bg,
.panel-bg {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: var(--glass-voice-capture-bg);
  border-radius: inherit;
  z-index: 0;
  pointer-events: none;
}
.echly-capture-card-content,
.panel-content {
  position: relative;
  z-index: 1;
  opacity: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

/* Voice capture failure + mic dropdown */
.echly-voice-failure-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 4px auto 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 80, 80, 0.8);
}
html.dark .echly-voice-failure-icon-wrap {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(248, 113, 113, 0.85);
}
.echly-voice-failure-secondary-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.echly-voice-failure-secondary {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  font-family: var(--echly-font);
  background: var(--text-primary);
  @supports (color: color-mix(in lab, red, red)) {
    background: color-mix(in srgb, var(--text-primary) 6%, transparent);
  }
  color: var(--text-primary);
  transition: background 120ms ease, transform 120ms ease;
  width: 100%;
}
.echly-voice-failure-secondary:hover {
  background: var(--text-primary);
  @supports (color: color-mix(in lab, red, red)) {
    background: color-mix(in srgb, var(--text-primary) 10%, transparent);
  }
}
.echly-voice-failure-secondary:active { transform: scale(0.99); }

.echly-voice-mic-dropdown {
  box-sizing: border-box;
  pointer-events: auto;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--glass-voice-capture-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 9999;
}
html.dark .echly-voice-mic-dropdown {
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.45);
}
.echly-voice-mic-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--echly-font);
  cursor: pointer;
  transition: background 100ms ease;
}
.echly-voice-mic-option:hover { background: var(--text-primary); }
.echly-voice-mic-option--active { background: var(--text-primary); }

.echly-voice-row {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 20px;
  pointer-events: auto;
}
```

## 6. Dropdown Implementation

### Mic dropdown logic (VoiceCapturePanel)

The mic dropdown is implemented in `components/CaptureWidget/VoiceCapturePanel.tsx`:
- Button to open: `"Select Microphone"` inside `failureBody` (`.echly-voice-failure-secondary`), with `ref={micTriggerRef}`.
- On click:
  - `openMicPicker()` calls `navigator.mediaDevices.enumerateDevices()`
  - filters audioinput devices
  - builds `micDevices: Array<{ deviceId; label }>`
  - sets `micPickerOpen(true)`
- Positioning:
  - `useLayoutEffect` calls `updateMicDropdownPosition()`, which:
    - reads `micTriggerRef.current.getBoundingClientRect()`
    - chooses placement `"up"` vs `"down"` based on available viewport space
    - sets `micDropdownRect = { top, left, width, maxHeight, placement }`
- Portal target:
  - The dropdown menu is rendered via `createPortal(..., micDropdownPortalTarget)`
  - `micDropdownPortalTarget` is `document.body` (when available)
- Dropdown styling/layering:
  - dropdown container uses class `.echly-voice-mic-dropdown`
  - inline `style` sets `position: fixed` and `zIndex: 9999`

## 7. Event Flow

Trace: click `"Select Microphone"` (Voice error recovery UI)

1. UI interaction:
   - User clicks button labeled `"Select Microphone"` in `failureBody` (`VoiceCapturePanel`).
   - This button has `ref={micTriggerRef}` and `onClick={() => void openMicPicker()}`.
2. State change:
   - `openMicPicker()` enumerates devices and updates:
     - `micDevices`
     - `micPickerOpen` to `true`
3. Render + positioning:
   - `micPickerOpen` triggers:
     - `useLayoutEffect` to run (since `micPickerOpen` becomes true and `micDevices.length > 0`)
     - `updateMicDropdownPosition()` computes fixed `top/left/width/maxHeight` and sets `micDropdownRect`
4. Portal:
   - `micDropdownMenu` becomes non-null when:
     - `micPickerOpen === true`
     - `micDevices.length > 0`
     - `micDropdownRect` is available
     - portal target is `document.body`
   - It renders the menu via `createPortal(...)` into `document.body`.
5. Final DOM position:
   - Dropdown menu `div.echly-voice-mic-dropdown` is a direct child (or within descendants) of `document.body`, positioned using fixed coordinates relative to viewport.

## 8. Stacking Context Analysis

For each layer, analysis is limited to what is explicitly set in code/CSS (position, z-index, and parent/DOM placement).

1. Shadow host + widget container (normal DOM)
   - Parent: `document.body` contains `div#echly-shadow-host` appended in `content.tsx` (`waitForBody` then `document.body.appendChild(host)`).
   - Host styles (from `content.tsx`): `position: fixed`, `zIndex: 2147483647`, `pointerEvents: none` (host itself) and hidden by default.
2. Sidebar container (CaptureWidget main tray)
   - Parent: inside shadow DOM under `#echly-root` / `ROOT_ID` container.
   - In extension mode, inline style on `.echly-sidebar-container` sets:
     - `position: fixed`, `zIndex: 2147483647`, `pointerEvents: auto`.
3. Capture root mount point (`#echly-capture-root`)
   - Created in `useCaptureWidget.createCaptureRoot()`:
     - `captureEl.id = "echly-capture-root"`
     - `pointer-events: none`
     - `zIndex: 2147483645`
     - parent: `captureRootParent ?? document.body`
       - in extension mode, `captureRootParent` is passed as `widgetRoot` (shadow-dom container) from `content.tsx`.
4. CaptureLayer portal (portaled overlay content)
   - `CaptureLayer.tsx` uses:
     - `portalTarget = captureRootParent ?? captureRoot`
     - `createPortal(captureContent, portalTarget)`
   - `captureContent` includes:
     - `SessionOverlay` (portaled further into `captureRoot`)
     - focus overlay (`.echly-focus-overlay`) rendered inside the portal as a fixed element
     - `RegionCaptureOverlay` rendered as normal DOM under the portal component tree (no additional portal)
5. SessionOverlay (portal into captureRoot)
   - `SessionOverlay.tsx` returns `createPortal(content, captureRoot)`
   - `content` includes:
     - optional `.echly-dim-layer--visible`
     - cursor overlay: fixed, `zIndex: 2147483645`, `pointerEvents: none`
     - `SessionControlPanel`: fixed, `zIndex: 2147483646`, `pointerEvents: auto`
     - `VoiceCapturePanel` / `TextFeedbackPanel` overlays
6. VoiceCapturePanel (portal into captureRoot + dropdown to body)
   - Main card:
     - if `captureRoot` exists, renders:
       - `createPortal(<>{dimLayer}{card}</>, captureRoot)`
     - `dimLayer` uses CSS `.echly-dim-layer` (fixed, `z-index: 2147483644`)
     - `card` uses CSS `.echly-capture-card` (fixed, `z-index: 2147483646`)
   - Mic dropdown:
     - renders `createPortal(dropdownDiv, document.body)`
     - dropdownDiv has inline `position: fixed` and `zIndex: 9999`
7. RegionCaptureOverlay overlay layer
   - Rendered when `showRegionOverlay` is true in `CaptureLayer`.
   - Outer `#echly-overlay` is `position: fixed` with `zIndex: 999999`.
   - Internal dim/cutout uses `zIndex: 999998`.

## 9. Failure Points

The following are potential failures directly supported by code/z-index/portal relationships (no fixes proposed).

1. Mic dropdown styling scope risk
   - `VoiceCapturePanel` renders the mic dropdown into `document.body` via `createPortal(..., document.body)`.
   - `content.tsx` injects `popup.css` into the shadow root only (it explicitly avoids injecting into `document.head`).
   - If the shadow-root stylesheet does not apply to nodes in `document.body`, the mic dropdown may render without expected styling.
2. Mic dropdown z-index collision with capture card
   - Mic dropdown uses `zIndex: 9999` (inline) and `.echly-voice-mic-dropdown { z-index: 9999; }`.
   - Capture card uses `z-index: 2147483646` and cursor/control overlays use `z-index: 2147483645/2147483646/2147483647`.
   - If the dropdown overlaps the capture card visually/stacking-wise, it may be covered because its z-index is far lower.
3. Capture root z-index depends on `position`
   - `useCaptureWidget` sets `captureEl.style.zIndex = "2147483645"` but does not set `captureEl.style.position`.
   - Whether `z-index` affects stacking for `#echly-capture-root` is therefore dependent on default/computed `position` styles (not set in this code).
4. Fixed overlays spanning portals
   - Several elements use `position: fixed` with very high z-index values:
     - sidebar (2147483647)
     - capture card (2147483646)
     - session control (2147483646)
     - cursor (2147483645)
     - text panel (2147483647)
   - Because fixed positioning ignores layout stacking, any accidental z-index equality/overlap could cause interactions (click/hover) to go to the wrong layer.

