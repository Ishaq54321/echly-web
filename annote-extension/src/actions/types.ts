/**
 * Shared type definitions for the user-actions capture feature.
 *
 * Mirrors the shape of `../console/types.ts` and `../network/types.ts` so future
 * maintainers can pattern across the three capture streams. Actions describe
 * user-driven events (clicks, navigations, form submits, focus/blur, visibility,
 * resize) into a per-tab ring buffer that gets attached to a ticket at
 * click-time.
 *
 * The companion type duplicated on the web app side (when Phase A4 wires server
 * persistence) must stay structurally identical — keep them in sync.
 */

export type ActionType =
  | "click"
  | "navigation"
  | "visibility"
  | "submit"
  | "input"
  | "focus"
  | "blur"
  | "resize";

export type NavigationMethod =
  | "pushState"
  | "replaceState"
  | "popstate"
  | "load"
  | "hashchange";

export type VisibilityState = "visible" | "hidden";

/**
 * Jam-style element identification. Captures enough structure for a developer
 * to reconstruct which DOM element a user interacted with — tag, id, classes,
 * and a curated allowlist of high-signal attributes — without leaking the
 * element's free-form text content unredacted.
 *
 * - `text` is post-redaction visible text (or label), truncated to ~80 chars.
 * - `masked` is true when a privacy attribute (data-private, .fs-block, etc.)
 *   matched and the element details were withheld. Structural fields (tag) may
 *   still be present so the timeline shows *something* happened.
 */
export interface ElementDescriptor {
  /** Lowercased tag name, e.g. "a", "button", "input". */
  tag: string;
  /** Element id attribute, if present. */
  id?: string;
  /** Class names as an array (split from className). */
  classes?: string[];
  /** Subset of attributes from the CAPTURED_ATTRIBUTES allowlist. */
  attributes?: Record<string, string>;
  /** Post-redaction visible text / label, truncated to ~80 chars. */
  text?: string;
  /** True when a privacy attribute matched and details were withheld. */
  masked?: boolean;
}

/**
 * A single user-action entry stored in the ring buffer. Many fields are
 * optional because each ActionType populates a different subset:
 *  - click / submit / focus / blur / input → `element`
 *  - input → `element` + `fieldLabel` (never the typed value)
 *  - navigation → `url`, `fromUrl`, `navigationMethod`
 *  - visibility → `visibilityState`
 *  - resize → `viewport`
 */
export interface UserAction {
  /** UUID generated at capture time. */
  id: string;
  type: ActionType;
  /** Wall-clock ms epoch. */
  timestamp: number;
  /** Present for click / submit / focus / blur / input. */
  element?: ElementDescriptor;
  /** Post-redaction destination URL (navigation). */
  url?: string;
  /** Post-redaction previous URL (navigation). */
  fromUrl?: string;
  navigationMethod?: NavigationMethod;
  visibilityState?: VisibilityState;
  viewport?: { width: number; height: number };
  /**
   * For input events: the field's name / label / type — enough to identify
   * which field was edited. NEVER the value the user typed.
   */
  fieldLabel?: string;
}

export interface ActionsSnapshot {
  actions: UserAction[];
  capturedAt: number;
  count: number;
}

// ─── postMessage bridge protocol ────────────────────────────────
// Wired up in Phase A3. Defined here alongside the data shapes so the
// MAIN-world script and isolated-world bridge can both import from one place.

export const ACTIONS_BRIDGE_SOURCE_ISOLATED = "annote-isolated" as const;
export const ACTIONS_BRIDGE_SOURCE_MAIN = "annote-main" as const;

export const ACTIONS_SNAPSHOT_REQUEST = "ECHLY_ACTIONS_SNAPSHOT_REQUEST" as const;
export const ACTIONS_SNAPSHOT_RESPONSE = "ECHLY_ACTIONS_SNAPSHOT_RESPONSE" as const;
export const ACTIONS_FLUSH_PUSH = "ECHLY_ACTIONS_FLUSH_PUSH" as const;

export interface ActionsSnapshotRequest {
  source: typeof ACTIONS_BRIDGE_SOURCE_ISOLATED;
  type: typeof ACTIONS_SNAPSHOT_REQUEST;
  requestId: string;
}

export interface ActionsSnapshotResponse {
  source: typeof ACTIONS_BRIDGE_SOURCE_MAIN;
  type: typeof ACTIONS_SNAPSHOT_RESPONSE;
  requestId: string;
  snapshot: ActionsSnapshot;
}

export interface ActionsFlushPush {
  source: typeof ACTIONS_BRIDGE_SOURCE_MAIN;
  type: typeof ACTIONS_FLUSH_PUSH;
  snapshot: ActionsSnapshot;
}

export type ActionsBridgeMessage =
  | ActionsSnapshotRequest
  | ActionsSnapshotResponse
  | ActionsFlushPush;
