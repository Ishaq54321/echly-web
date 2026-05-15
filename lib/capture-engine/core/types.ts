import type { MutableRefObject } from "react";
import type { CaptureEnvironment } from "../CaptureEnvironment";

export type StructuredFeedback = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  screenshotId?: string | null;
  tags?: string[];
  /** AI-detected page/section, e.g. "Pricing Page → Hero Section". */
  pageArea?: string | null;
  userAgent?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  devicePixelRatio?: number | null;
  /** ISO string (API) or epoch ms (in-memory). */
  createdAt?: string | number | null;
};

/** Element bounding rect (viewport coordinates) for anchoring capture card. */
export type ElementRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

/** Pending session feedback (screenshot + context + optional element position). Screenshot is optional so capture flow can continue when screenshot fails. */
export type SessionFeedbackPending = {
  screenshot?: string | null;
  context: CaptureContext | null;
  elementRect?: ElementRect | null;
};

/** Context captured with the region (URL, scroll, viewport, selected-element subtree). */
export type CaptureContext = {
  url: string;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  screenWidth?: number;
  screenHeight?: number;
  /** Visible text from the DOM subtree of the selected element (Ring 1). */
  subtreeText?: string | null;
  /** Weak reference hint for selected element kind; never a decision input. */
  elementType?: string | null;
  /** Best human-readable name for the clicked element (aria-label, alt, title, placeholder, or innerText). */
  semanticIdentifier?: string | null;
  /** Computed styles (color, background, font-size, padding, size) for the clicked element. */
  computedStyles?: string | null;
  /** Structured list of meaningful direct children of the clicked element (tag, name, brief styles). */
  childrenList?: string | null;
  /** ARIA state of the clicked element (checked, expanded, selected, pressed, current). */
  elementState?: string | null;
  /** Semantic type of the clicked element (button, link, input, heading, paragraph, image, icon, card, section). */
  semanticType?: "button" | "link" | "input" | "heading" | "paragraph" | "image" | "icon" | "card" | "section" | null;
  /** "disabled" if element has disabled or aria-disabled, otherwise empty. */
  disabledState?: string | null;
  /** Modal/dialog/popover context when element is inside one. */
  modalContext?: string | null;
  /** Current value of the input element (with privacy filtering). */
  inputValue?: string | null;
  /** Iframe context when element is inside an embedded frame. */
  iframeContext?: string | null;
  capturedAt: number;
  /** When set, OCR should run on this image (e.g. selection crop) instead of the UI screenshot. */
  ocrImageDataUrl?: string | null;
  /** Pin position as percentage of container (0–100) for annotation placement. */
  pinPosition?: { xPercent: number; yPercent: number } | null;
};

export interface Recording {
  id: string;
  screenshot: string | null;
  transcript: string;
  structuredOutput: StructuredFeedback | null;
  /** Page context when capture was taken (extension region capture). */
  context?: CaptureContext | null;
  createdAt: number;
}

/** Voice capture failure shown in VoiceCapturePanel (session / overlay). */
export type VoiceCaptureError =
  | null
  | "no_audio"
  | "transcription_failed"
  | "mic_permission";

/** Explicit capture flow state machine. */
export type CaptureState =
  | "idle"
  | "focus_mode"
  | "region_selecting"
  | "voice_listening"
  | "processing"
  | "success"
  | "cancelled"
  | "error";

export type CaptureWidgetProps = {
  sessionId: string;
  userId: string;
  /** When true, disables auto-collapse on blur/outside click and locks tray during recording. */
  extensionMode?: boolean;
  initialPointers?: StructuredFeedback[];
  onComplete: (
    transcript: string,
    screenshot: string | null,
    callbacks?: {
      onSuccess: (ticket: StructuredFeedback) => void;
      onError: () => void;
    },
    context?: CaptureContext | null,
    options?: { sessionMode?: boolean }
  ) => void | Promise<StructuredFeedback | undefined>;
  onDelete: (id: string) => Promise<void>;
  /** Optional: when provided (e.g. extension), ticket updates use this instead of authFetch. */
  onUpdate?: (id: string, payload: { title: string; description?: string; tags?: string[] }) => Promise<void>;
  /** Optional ref for extension: parent can set a toggle callback to open/close widget via message. */
  widgetToggleRef?: MutableRefObject<(() => void) | null>;
  /** Optional callback when recording starts or stops (for extension global recording state). */
  onRecordingChange?: (recording: boolean) => void;
  /** When provided, widget is controlled: expanded = open panel, !expanded = floating button only. */
  expanded?: boolean;
  /** Called when user clicks the floating button to open (extension sends ECHLY_EXPAND_WIDGET). */
  onExpandRequest?: () => void;
  /** Called when user clicks close (X) to collapse (extension sends ECHLY_COLLAPSE_WIDGET). */
  onCollapseRequest?: () => void;
  /** When true, Add Feedback button is disabled (e.g. no active session in extension). No message shown. */
  captureDisabled?: boolean;
  /** Theme for widget (dark/light). When provided with onThemeToggle, theme toggle is shown. */
  theme?: "dark" | "light";
  /** Called when user clicks theme toggle. */
  onThemeToggle?: () => void;
  /** Extension: fetch sessions for Previous Sessions picker. */
  fetchSessions?: () => Promise<import("./ResumeSessionModal").SessionOption[]>;
  /** Extension: true when backend has at least one session (from /api/sessions?limit=1). Used to show Previous Sessions button only when sessions exist. */
  hasPreviousSessions?: boolean;
  /** Extension: when user selects a session from Previous Sessions picker. Parent should set active session, fetch feedback, then pass loadSessionWithPointers. If options.enterCaptureImmediately, parent should also start session mode (overlay) after load. */
  onPreviousSessionSelect?: (sessionId: string, options?: { enterCaptureImmediately?: boolean }) => void;
  /** Extension: when set, widget enters session mode with these pointers (e.g. after resuming a session). */
  loadSessionWithPointers?: { sessionId: string; pointers: StructuredFeedback[] } | null;
  /** Extension: global session pointers from background. When provided, overrides loadSessionWithPointers for tray list; all tabs show same list. */
  pointers?: StructuredFeedback[];
  /** Extension: total feedback count from backend aggregation; independent of loaded pointers. */
  totalCount?: number;
  /** Extension: open feedback count from backend aggregation; independent of loaded pointers. */
  openCount?: number;
  /** Extension: resolved feedback count from backend aggregation; independent of loaded pointers. */
  resolvedCount?: number;
  /** Precomputed open high-priority feedback count (session/write-time); optional summary line when greater than zero. */
  highPriorityOpenCount?: number;
  /** Extension: true while loading a previous session's feedback; show spinner instead of empty state. */
  sessionLoading?: boolean;
  /** Extension: true while pagination recovery loop is actively retrying rehydrate. */
  feedbackRecovering?: boolean;
  /** Extension: number of recovery attempts made for pagination self-healing. */
  feedbackRecoveryAttempts?: number;
  /** Extension: true when a recovery cycle exhausted retries and is waiting for a future trigger. */
  feedbackFetchFailed?: boolean;
  /** Extension: session title from globalUIState. When provided, overrides internal sessionTitle for display. */
  sessionTitleProp?: string | null;
  /** Extension: when session title is saved in tray. When provided, called instead of internal setSessionTitle (enables PATCH + broadcast). */
  onSessionTitleChange?: (title: string) => void | Promise<void>;
  /** Called after widget has applied loadSessionWithPointers so parent can clear it. */
  onSessionLoaded?: () => void;
  /** Called when user ends the feedback session (e.g. to clear resume override in extension). */
  onSessionEnd?: () => void;
  /** Extension: create a new session (POST /api/sessions). Returns { id } or limit object when 403 PLAN_LIMIT_REACHED. */
  onCreateSession?: () => Promise<
    { id: string } | { limitReached: true; message: string; upgradePlan: unknown } | null
  >;
  /** Extension: notify parent that active session changed (e.g. after start or resume). Parent sets storage and passes new sessionId. */
  onActiveSessionChange?: (sessionId: string) => void;
  /** Extension: global session mode from background (ECHLY_GLOBAL_STATE). When true, overlay activates in this tab. */
  globalSessionModeActive?: boolean;
  /** Extension: global session paused from background. Synced to local sessionPaused. */
  globalSessionPaused?: boolean;
  /** Extension: edit-pause tooltip visibility from background (persists across page navigations). */
  editPauseTooltipVisible?: boolean;
  /** Extension: notify background to set/clear the edit-pause tooltip flag. */
  onSetEditPauseTooltip?: (visible: boolean) => void | Promise<void>;
  /** Extension: notify background that session mode started (after POST /api/sessions succeeds). */
  onSessionModeStart?: () => void;
  /** Extension: called when Start Session succeeds so widget can switch to session view (same as Previous Session). */
  onSessionViewRequested?: () => void;
  /** Extension: notify background to set session paused. */
  onSessionModePause?: () => void;
  /** Extension: notify background to resume session. */
  onSessionModeResume?: () => void;
  /** Extension: notify background that session ended (disable overlay in all tabs). */
  onSessionModeEnd?: () => void;
  /** Extension: soft end — clear session state but keep widget open and stay on home screen (no redirect). */
  onSessionModeEndSoft?: () => void;
  /** Extension: notify background of user activity (resets 30-min idle timeout). Called on click capture, etc. */
  onSessionActivity?: () => void;
  /** Extension: global capture mode (voice vs text). When "voice", element click opens voice UI; when "text", opens text UI. */
  captureMode?: "voice" | "text";
  /** Dashboard: when chrome.runtime is unavailable, called when user toggles Voice/Write mode. */
  onCaptureModeChange?: (mode: "voice" | "text") => void;
  /** Optional preferred microphone deviceId for voice capture (from enumerateDevices). */
  selectedMicrophoneId?: string;
  /** Called when devices are enumerated at start of voice recording (user-initiated). Use to populate microphone list. */
  onDevicesEnumerated?: (devices: Array<{ deviceId: string; label: string }>) => void;
  /** When user selects a microphone from voice failure UI or picker; keep parent device list in sync (e.g. extension tray). */
  onVoiceMicrophoneSelect?: (deviceId: string) => void;
  /** When set (e.g. extension shadow root container), capture root is appended here so it receives shadow DOM styles; otherwise appended to document.body. */
  captureRootParent?: HTMLElement | null;
  /** When true, show a loading indicator above the feedback tray while a ticket is being processed (e.g. after submit). */
  isProcessingFeedback?: boolean;
  /** Extension: list of in-flight and failed feedback jobs. When provided, tray shows one card per job (processing / failed) instead of a single isProcessingFeedback flag. */
  feedbackJobs?: FeedbackJob[];
  /** Extension: URL for the launcher logo (minimized state). When set with extensionMode, launcher shows logo instead of text. */
  launcherLogoUrl?: string;
  /** Extension: when true (e.g. from ECHLY_OPEN_PREVIOUS_SESSIONS message), open the Previous Sessions modal. */
  openResumeModal?: boolean;
  /** Extension: called when the resume/previous-sessions modal is closed so parent can clear openResumeModal. */
  onResumeModalClose?: () => void;
  /** Extension: auth guard. Returns true if authenticated, false if login was triggered. Call before Start Session to open auth broker when logged out. */
  ensureAuthenticated?: () => Promise<boolean>;
  /** Extension: verify dashboard session before loading previous sessions list. If false, modal shows login-required UI and does not call /api/sessions. */
  verifySessionBeforeSessions?: () => Promise<boolean>;
  /** Extension: open login (auth broker). Called when user clicks "Open Login" in Previous Sessions when not authenticated. */
  onTriggerLogin?: () => void;
  /** Extension: when set (POST /api/sessions returned 403 PLAN_LIMIT_REACHED), show upgrade view instead of session controls. */
  sessionLimitReached?: { message: string; upgradePlan: unknown } | null;
  /** Extension: when set (POST /api/feedback returned 403 PLAN_LIMIT_REACHED for tickets), show ticket upgrade screens. */
  feedbackLimitReached?: { message: string; upgradePlan: string } | null;
  /** Internal: triggers the inline upgrade-card shake animation; wired by CaptureWidget into the hook. */
  triggerUpgradeShake?: () => void;
  /** Internal: open the inline ticket editor for a saved ticket. Wired by CaptureWidget; placeholder/pending markers are skipped. */
  onEditTicket?: (id: string) => void;
  /** Extension: current feedback tickets used this month (from GET_AUTH_STATE usage fetch). */
  feedbackUsage?: number | null;
  /** Extension: max feedback tickets allowed per month for this plan (null = unlimited). */
  feedbackLimit?: number | null;
  /** Extension: transient banner when session start failed (e.g. background-triggered createSession). */
  sessionStartErrorBanner?: string | null;
  /** Extension: clear session start error banner (e.g. after user dismisses or retries). */
  onSessionStartErrorDismiss?: () => void;
  /** Optional capture environment adapter (extension, dashboard, etc.). When provided, useCaptureWidget uses it instead of direct props/callbacks. */
  environment?: CaptureEnvironment;
  /**
   * Called immediately before workspace-scoped API calls (transcribe, ticket PATCH, share-link).
   * Web app: pass `() => assertIdentityResolved(isIdentityResolved)`.
   * Extension: pass a no-op once extension auth is satisfied (identity enforced by the extension host).
   */
  assertIdentityBeforeWorkspaceMutations: () => void;
  /** Extension: open Previous Sessions modal. Replaces chrome.runtime.sendMessage ECHLY_OPEN_PREVIOUS_SESSIONS. */
  onPreviousSessions?: () => void;
  /** Extension: set capture mode (voice/text). Replaces chrome.runtime.sendMessage ECHLY_SET_CAPTURE_MODE. */
  onSetCaptureMode?: (mode: "voice" | "text") => void;
  /** Extension: open billing/settings. Replaces chrome.runtime.sendMessage ECHLY_OPEN_BILLING. */
  onOpenBilling?: () => void;
  /** Extension: open dashboard (e.g. Home button). Replaces chrome.runtime.sendMessage ECHLY_OPEN_DASHBOARD. */
  onOpenDashboard?: () => void;
  /** Extension: resolve asset URL (e.g. chrome.runtime.getURL). Replaces chrome.runtime.getURL in core. */
  getAssetUrl?: (path: string) => string;
  /**
   * Extension: fetch wrapper used by the TicketEditorOverlay's DescriptionEditor
   * for API calls (AI improve, voice transcription). The dashboard build leaves
   * this undefined and the editor uses same-origin `fetch`; the extension
   * passes an authenticated client that prepends API_BASE and attaches the
   * bearer token.
   */
  fetchClient?: (url: string, init?: RequestInit) => Promise<Response>;
  /** Extension: derived “still saving” for session chrome (content script); optional everywhere else. */
  __extensionSavingState?: boolean;
  /** Extension: lift pause/end/session-feedback saving flags from the widget for derived saving UI in the host. */
  onExtensionSavingSignalsChange?: (signals: {
    sessionFeedbackSaving: boolean;
    pausePending: boolean;
    endPending: boolean;
  }) => void;
};

/** One feedback job in the pipeline (processing or failed). Completed jobs are removed and the ticket appears in pointers. */
export type FeedbackJob = {
  id: string;
  status: "processing" | "failed";
  transcript: string;
  screenshot: string | null;
  createdAt: number;
  errorMessage?: string;
};

export type Position = { x: number; y: number };
