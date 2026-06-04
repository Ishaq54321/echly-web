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
}

/** Returns explicit status for a feedback item. Use instead of !isResolved. */
export function getTicketStatus(f: Pick<Feedback, "isResolved">): TicketStatus {
  if (f.isResolved === true) return "resolved";
  return "open";
}
