import type { Timestamp } from "firebase/firestore";

export interface StructuredFeedback {
  title: string;
  type: string;

  description: string;
  tags?: string[];
  pageArea?: string;

  // Metadata
  url?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  userAgent?: string;
  timestamp?: number;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;

  // Screenshot
  // 🚨 IMPORTANT:
  // Do NOT add legacy screenshot URL fields back.
  // Use screenshotId + resolver for access.
  screenshotId?: string | null;
  screenshotStatus?: "attached" | "pending" | "none" | "failed" | null;
  status?: "open" | "resolved" | "processing";

  /** See {@link Feedback.captureWindowStartAt}. */
  captureWindowStartAt?: number;

  creatorName?: string | null;
  creatorAvatarUrl?: string | null;
}

/** Single console-log entry captured by the extension's MAIN-world wrapper and persisted with a ticket. Domain copy — the extension keeps its own bundler-isolated copy in annote-extension/src/console/types.ts; field names must stay in lockstep. */
export interface ConsoleLogEntry {
  timestamp: number;
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
  args?: string[];
  source?: string;
}

/** Uncaught error / unhandled rejection captured by the extension's MAIN-world wrapper. Domain copy — shape must match annote-extension/src/console/types.ts. */
export interface ExceptionEntry {
  timestamp: number;
  message: string;
  stack?: string | null;
  source?: string | null;
  line?: number | null;
  column?: number | null;
  type: "error" | "unhandledrejection";
}

/** User-action type union. Domain copy — must stay in lockstep with annote-extension/src/actions/types.ts. */
export type ActionType =
  | "click"
  | "navigation"
  | "visibility"
  | "submit"
  | "input"
  | "focus"
  | "blur"
  | "resize";

/** Navigation sub-classification for type === "navigation". */
export type NavigationMethod =
  | "pushState"
  | "replaceState"
  | "popstate"
  | "load"
  | "hashchange";

export type ActionVisibilityState = "visible" | "hidden";

/** Jam-style element identification captured at click/submit/focus/blur/input time. Free-form `text` is post-redaction and truncated; `masked` true means a privacy attribute matched and details were withheld. Domain copy — must stay in lockstep with annote-extension/src/actions/types.ts. */
export interface ElementDescriptor {
  tag: string;
  id?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  text?: string;
  masked?: boolean;
}

/** A single user-action entry captured by the extension's MAIN-world wrapper and persisted with a ticket. Many fields are optional — each ActionType populates a different subset. Domain copy — must stay in lockstep with annote-extension/src/actions/types.ts. */
export interface UserAction {
  id: string;
  type: ActionType;
  timestamp: number;
  element?: ElementDescriptor;
  url?: string;
  fromUrl?: string;
  navigationMethod?: NavigationMethod;
  visibilityState?: ActionVisibilityState;
  viewport?: { width: number; height: number };
  /** For input events: name / label / type — never the value typed. */
  fieldLabel?: string;
}

/** Single network request captured by the extension's MAIN-world fetch/XHR wrapper and persisted with a ticket. Domain copy — the extension keeps its own bundler-isolated copy in annote-extension/src/network/types.ts; field names must stay in lockstep. Headers and bodies are redacted at the extension's capture site before they reach this type. */
export interface NetworkRequestEntry {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  status: number | null;
  statusText: string | null;
  durationMs: number | null;
  source: "fetch" | "xhr";
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody: string | null;
  requestBodyOriginalSize: number | null;
  requestBodyTruncated: boolean;
  responseBody: string | null;
  responseBodyOriginalSize: number | null;
  responseBodyTruncated: boolean;
  responseContentType: string | null;
  errored: boolean;
  errorMessage: string | null;
  initiatorPage: string | null;
}

/** Derived status for a ticket. Prefer explicit checks over !isResolved. */
export type TicketStatus = "open" | "resolved";

export type Priority = "high" | "medium" | "low";

/**
 * Anchor used to scroll to a specific feedback location in the UI.
 * - `selector`: preferred when present (DOM lookup)
 * - `x`/`y`: fallback absolute page coordinates
 */
export type FeedbackAnchor = {
  selector?: string;
  x?: number;
  y?: number;
};

export interface Feedback {
  id: string;
  /** Workspace scope (primary). */
  workspaceId?: string;
  sessionId: string;
  /** Legacy scope (pre-workspaces). */
  userId?: string;
  title: string;
  type: string;
  isResolved: boolean;
  createdAt: Timestamp | null;
  /** Number of comments on this feedback. Used for Discussion feed (conversations only). */
  commentCount?: number;
  /** Truncated last comment message for feed preview. */
  lastCommentPreview?: string;
  /** Timestamp of last comment. */
  lastCommentAt?: Timestamp | null;
  /** Phase 25.1: uid of the last commenter — the inbox "last actor". */
  lastCommentByUid?: string | null;
  /** Phase 25.1: display name of the last commenter (historical, per Phase 23). */
  lastCommentByName?: string | null;

  description?: string | null;
  tags?: string[] | null;
  pageArea?: string | null;

  // Metadata
  url?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  userAgent?: string | null;
  clientTimestamp?: number | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  devicePixelRatio?: number | null;

  /**
   * Capture-window honesty stamp (epoch ms). Present when this ticket's capture
   * streams were cut at a prior ticket's watermark (same engagement, same tab):
   * entries at or before this time were already filed with an earlier ticket, so
   * this ticket's captured window BEGINS here. "No signals captured" on such a
   * ticket means "none since the prior ticket", not "none at all" — the AI
   * analysis and the panel frame absence-of-evidence accordingly. Stamped by the
   * extension at file time; absent for the first ticket of an engagement and for
   * tickets filed by older extension builds.
   */
  captureWindowStartAt?: number | null;

  // Screenshot
  // 🚨 IMPORTANT:
  // Do NOT add legacy screenshot URL fields back.
  // Use screenshotId + resolver for access.
  screenshotId?: string | null;
  screenshotStatus?: "attached" | "pending" | "none" | "failed" | null;
  status?: "open" | "resolved" | "processing";

  /** Soft delete: when true, row stays in Firestore but is hidden from list/query semantics. */
  isDeleted?: boolean;

  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: "high" | "medium" | "low" | null;

  creatorName?: string | null;
  creatorAvatarUrl?: string | null;

  /** Aggregated set of user IDs who have been @mentioned in any comment on this ticket. */
  mentionedUserIds?: string[] | null;

  /** Console-log capture (Phase 4). All entries are redacted at the extension's capture site before storage; never persist unredacted PII. Omitted when no MAIN-world snapshot was attached at click time. */
  consoleLogs?: ConsoleLogEntry[] | null;
  /** Uncaught errors + unhandled rejections captured by the same MAIN-world wrapper. */
  exceptions?: ExceptionEntry[] | null;
  /** Denormalized count of consoleLogs (all levels). */
  consoleLogCount?: number;
  /** Denormalized count of exceptions. */
  exceptionCount?: number;
  /** Denormalized count of consoleLogs with level === "error". Surfaces in the header badge. */
  errorCount?: number;
  /** Denormalized count of consoleLogs with level === "warn". */
  warningCount?: number;

  /** Network-request capture (Phase N4). Headers and bodies are redacted at the extension's capture site before storage. Omitted when no MAIN-world snapshot was attached at click time or when the page had no network activity. */
  networkRequests?: NetworkRequestEntry[] | null;
  /** Denormalized count of networkRequests. */
  networkRequestCount?: number;
  /** Denormalized count of networkRequests where errored === true OR status >= 400. */
  networkErrorCount?: number;

  /** User-action capture (Phase A4). Elements are redacted at the extension's capture site (`text` post-redaction, `masked: true` when withheld). Omitted when no MAIN-world snapshot was attached at click time or when the page had no captured actions. */
  userActions?: UserAction[] | null;
  /** Denormalized count of userActions. Used for the A5 header badge / Actions tab placeholder. */
  userActionCount?: number;

  /**
   * AI Analysis (read-only second opinion). Generated lazily on first ticket
   * view by POST /api/feedback/[id]/analyze and cached back on this doc, then
   * streamed into the open ticket via the realtime listener. NEVER set at
   * create time and NEVER mutates the human-facing priority/pageArea fields.
   * Absent until the first view triggers analysis.
   */
  /** 1-2 sentence "what's happening" summary. */
  aiSummary?: string | null;
  /**
   * Likely cause + suggested fix as one block. LEGACY/COMPAT shape: pre-structured
   * tickets only have this run-on paragraph. Still written on new analyses (a joined
   * fallback of {@link aiCause} + {@link aiFixSteps}) so any reader of this field keeps
   * working; the panel prefers the structured fields and only falls back to this for
   * old tickets. For the no-fault path this carries the honest UX/design framing.
   */
  aiFixSuggestion?: string | null;
  /**
   * Structured analysis (new shape). One-line likely root cause. Absent on legacy
   * tickets and on the no-fault path (which uses {@link aiFixSuggestion} only).
   */
  aiCause?: string | null;
  /**
   * Structured analysis (new shape). Discrete fix / next-step items, rendered as a
   * scannable list (not "(1)…(2)…" inside a paragraph). Absent on legacy tickets and
   * on the no-fault path.
   */
  aiFixSteps?: string[] | null;
  /**
   * Structured analysis (new shape). The model's verdict on how the captured
   * signals relate to the report:
   *   "related"        — a captured signal plausibly explains the report;
   *   "unrelated"      — signals were captured but appear disconnected from the report;
   *   "design_request" — the report is a design/UX/content change, not a defect;
   *   "no_signal"      — the capture holds nothing that confirms OR rules out the
   *                      report; it may well be a real defect the capture didn't see.
   * Lets the panel render the verdict directly. Absent on legacy tickets and on
   * the error path.
   */
  aiSignalRelation?: "related" | "unrelated" | "design_request" | "no_signal" | null;
  /**
   * Model's self-reported confidence 0-1 IN THE VERDICT (not in a technical
   * cause) — a certain design-request call is high-confidence. Null on legacy
   * templated analyses and the error path.
   */
  aiConfidence?: number | null;
  /**
   * Analysis lifecycle. "pending" guards concurrent first-opens from double-firing;
   * "complete" = the model produced an analysis (every success path — the verdict
   * lives in aiSignalRelation); "error" = generation failed (panel shows graceful
   * state). "no_fault" is LEGACY-ONLY: pre-overhaul templated no-fault analyses —
   * never written for new analyses (no-anchor tickets now get a real model call)
   * but still read/rendered for old docs.
   */
  aiAnalysisStatus?: "pending" | "complete" | "no_fault" | "error" | null;
  /** When the analysis was written back. */
  aiGeneratedAt?: Timestamp | null;
}

/** Returns explicit status for a feedback item. Use instead of !isResolved. */
export function getTicketStatus(f: Pick<Feedback, "isResolved">): TicketStatus {
  if (f.isResolved === true) return "resolved";
  return "open";
}
