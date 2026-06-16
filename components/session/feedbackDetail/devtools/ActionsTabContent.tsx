"use client";

import * as React from "react";
import {
  Circle,
  Compass,
  Eye,
  EyeOff,
  Keyboard,
  Maximize2,
  MousePointerClick,
  Navigation as NavIcon,
  SendHorizontal,
  Target,
} from "lucide-react";
import type {
  ActionType,
  ElementDescriptor,
  NavigationMethod,
  UserAction,
} from "@/lib/domain/feedback";
import { CanvasEmptyState } from "@/components/empty/CanvasEmptyState";
import { NoActivityIllu } from "@/components/empty/canvasIllustrations";

export interface ActionsTabContentProps {
  userActions?: UserAction[] | null;
  userActionCount?: number;
}

type Group = "all" | "click" | "navigation" | "input" | "other";
type ViewMode = "readable" | "technical";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const OTHER_GROUP: ActionType[] = ["visibility", "focus", "blur", "resize", "submit"];

const VIEW_MODE_STORAGE_KEY = "echly-actions-view-mode";

function readPersistedViewMode(): ViewMode {
  if (typeof window === "undefined") return "readable";
  try {
    const raw = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (raw === "technical" || raw === "readable") return raw;
    return "readable";
  } catch {
    return "readable";
  }
}

function writePersistedViewMode(mode: ViewMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {}
}

function actionGroup(type: ActionType): Exclude<Group, "all"> {
  if (type === "click") return "click";
  if (type === "navigation") return "navigation";
  if (type === "input") return "input";
  return "other";
}

function isVisible(action: UserAction, group: Group): boolean {
  if (group === "all") return true;
  return actionGroup(action.type) === group;
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatAbs(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function navigationMethodLabel(method?: NavigationMethod): string {
  switch (method) {
    case "pushState":
    case "replaceState":
      return "via app navigation";
    case "popstate":
      return "via back/forward";
    case "load":
      return "via initial load";
    case "hashchange":
      return "via hash change";
    default:
      return "";
  }
}

/** Friendlier short-form for readable mode. */
function readableNavigationMethodLabel(method?: NavigationMethod): string {
  switch (method) {
    case "pushState":
    case "replaceState":
      return "via in-app";
    case "popstate":
      return "via back/forward";
    case "load":
      return "via page load";
    case "hashchange":
      return "via section";
    default:
      return "";
  }
}

/** Builds the human-readable text portion of a row (everything except the
 *  element chip). Returned with a `chip` slot so the renderer can interleave
 *  a monospace descriptor at the right position. */
interface DescriptionParts {
  prefix: string;
  chipKind: "element" | "url" | "none";
  chipText?: string;
  suffix?: string;
}

function buildDescriptionParts(action: UserAction): DescriptionParts {
  switch (action.type) {
    case "click":
      return { prefix: "Clicked ", chipKind: "element" };
    case "submit":
      return { prefix: "Submitted ", chipKind: "element" };
    case "input": {
      const label = action.fieldLabel?.trim();
      return {
        prefix: "Edited ",
        chipKind: label ? "url" : "none",
        chipText: label || undefined,
        suffix: label ? "" : "field",
      };
    }
    case "focus":
      return { prefix: "Focused ", chipKind: "element" };
    case "blur":
      return { prefix: "Blurred ", chipKind: "element" };
    case "navigation": {
      const to = action.url ?? "";
      const method = navigationMethodLabel(action.navigationMethod);
      return {
        prefix: "Navigated to ",
        chipKind: "url",
        chipText: to,
        suffix: method ? ` ${method}` : "",
      };
    }
    case "visibility":
      return {
        prefix: "Tab became ",
        chipKind: "none",
        suffix: action.visibilityState ?? "unknown",
      };
    case "resize": {
      const w = action.viewport?.width;
      const h = action.viewport?.height;
      const dims = w != null && h != null ? `${w}×${h}` : "viewport";
      return {
        prefix: "Resized to ",
        chipKind: "url",
        chipText: dims,
      };
    }
    default:
      return { prefix: action.type, chipKind: "none" };
  }
}

/** Renders the Jam-style <tag id classes attributes> string. Respects the
 *  privacy gate: when `masked` is true the descriptor is replaced with a
 *  generic placeholder so no captured text/attributes leak. */
function renderElementDescriptor(el: ElementDescriptor | undefined): string {
  if (!el) return "";
  if (el.masked) return "‹masked element›";

  const parts: string[] = [];
  parts.push(`<${el.tag}`);
  if (el.id) parts.push(` id="${el.id}"`);
  if (el.classes && el.classes.length > 0) {
    parts.push(` class="${el.classes.join(" ")}"`);
  }
  if (el.attributes) {
    for (const [key, value] of Object.entries(el.attributes)) {
      // skip id/class — already rendered explicitly above
      if (key === "id" || key === "class") continue;
      parts.push(` ${key}="${value}"`);
    }
  }
  parts.push(">");
  return parts.join("");
}

const GENERIC_TAGS = new Set([
  "div",
  "span",
  "section",
  "html",
  "body",
  "main",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
]);

/** Returns a friendly noun phrase for an element when we have no text /
 *  aria-label to quote. Falls back to "an element" for generic containers. */
function friendlyElementName(el: ElementDescriptor | undefined): string {
  if (!el) return "an element";
  if (el.masked) return "a hidden element";

  const tag = (el.tag || "").toLowerCase();
  const attrs = el.attributes ?? {};
  const role = attrs.role?.toLowerCase();

  if (tag === "a") return "a link";
  if (tag === "button" || role === "button") return "a button";
  if (tag === "select") return "a dropdown";
  if (tag === "textarea") return "a text area";
  if (tag === "img") return "an image";
  if (tag === "form") return "the form";
  if (tag === "label") return "a label";
  if (tag === "input") {
    const type = (attrs.type || "text").toLowerCase();
    if (type === "submit" || type === "button") return "a button";
    if (type === "checkbox") return "a checkbox";
    if (type === "radio") return "a radio option";
    return `the ${type} field`;
  }
  if (GENERIC_TAGS.has(tag)) return "an element";
  return `a <${tag}>`;
}

/** Picks the best identification string for an element in readable mode,
 *  following the locked priority: text → aria-label → friendly type name.
 *  Returns { quoted, identifier } so callers can choose to wrap in quotes. */
function readableElementIdentifier(el: ElementDescriptor | undefined): {
  text: string;
  quoted: boolean;
} {
  if (!el) return { text: "an element", quoted: false };
  if (el.masked) return { text: "a hidden element", quoted: false };

  const text = el.text?.trim();
  if (text) return { text, quoted: true };

  const ariaLabel = el.attributes?.["aria-label"]?.trim();
  if (ariaLabel) return { text: ariaLabel, quoted: true };

  return { text: friendlyElementName(el), quoted: false };
}

/** Shorter / friendlier URL form for readable mode: prefer same-origin path. */
function readableUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    const sameOrigin =
      typeof window !== "undefined" &&
      window.location?.origin === parsed.origin;
    if (sameOrigin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

/** Builds the full plain-language string for readable mode. */
function buildReadableDescription(action: UserAction): string {
  switch (action.type) {
    case "click": {
      const { text, quoted } = readableElementIdentifier(action.element);
      return quoted ? `Clicked "${text}"` : `Clicked ${text}`;
    }
    case "submit": {
      const { text, quoted } = readableElementIdentifier(action.element);
      return quoted ? `Submitted "${text}"` : `Submitted ${text}`;
    }
    case "input": {
      const label = action.fieldLabel?.trim();
      if (label) return `Edited "${label}"`;
      // No fieldLabel — fall back to element identification.
      const { text, quoted } = readableElementIdentifier(action.element);
      if (quoted) return `Edited "${text}"`;
      return `Edited ${text}`;
    }
    case "focus": {
      const { text, quoted } = readableElementIdentifier(action.element);
      return quoted ? `Selected "${text}"` : `Selected ${text}`;
    }
    case "blur": {
      const { text, quoted } = readableElementIdentifier(action.element);
      return quoted ? `Left "${text}"` : `Left ${text}`;
    }
    case "navigation": {
      const url = readableUrl(action.url ?? "");
      const method = readableNavigationMethodLabel(action.navigationMethod);
      const target = url || "another page";
      return method ? `Navigated to ${target} (${method})` : `Navigated to ${target}`;
    }
    case "visibility":
      return action.visibilityState === "hidden"
        ? "Switched away from tab"
        : "Returned to tab";
    case "resize": {
      const w = action.viewport?.width;
      const h = action.viewport?.height;
      if (w != null && h != null) return `Resized window to ${w}×${h}`;
      return "Resized window";
    }
    default:
      return action.type;
  }
}

/** A row is "low-signal" if it's a click/focus/blur on a generic container
 *  with no text, no aria-label, no id, and no interactive role. */
function isLowSignal(action: UserAction): boolean {
  if (
    action.type !== "click" &&
    action.type !== "focus" &&
    action.type !== "blur"
  ) {
    return false;
  }
  const el = action.element;
  if (!el) return false;
  if (el.masked) return false;

  const tag = (el.tag || "").toLowerCase();
  if (!GENERIC_TAGS.has(tag)) return false;

  if (el.text && el.text.trim().length > 0) return false;
  if (el.id && el.id.trim().length > 0) return false;

  const attrs = el.attributes ?? {};
  if (attrs["aria-label"] && attrs["aria-label"].trim().length > 0) return false;
  const role = attrs.role?.toLowerCase();
  if (role && role !== "presentation" && role !== "none") return false;

  return true;
}

// ─── Render-time focus/blur pairing (Fix D) ──────────────────────
// Capture emits focus and blur as TWO separate UserActions, so every field
// interaction shows as a "Selected …"/"Left …" pair and the timeline reads
// twice as long as the interaction count. This is a PRESENTATION-only fix: at
// render time we pair each focus with the next blur on the SAME element and
// show them as ONE row. Capture, buffers, the watermark, userActionCount, and
// the stored data are all untouched — unpaired focus or blur rows (no partner)
// render exactly as before.

/** A render row is either a passthrough action or a merged focus+blur pair. */
type RenderRow =
  | { kind: "single"; key: string; action: UserAction }
  | { kind: "focusPair"; key: string; focus: UserAction; blur: UserAction };

/** Structural signature of an element descriptor — our "same element" handle,
 *  since captured actions carry no live DOM identity. Two focus/blur actions
 *  are treated as the same element when their signatures match. A descriptor
 *  with no distinguishing detail still yields a stable (tag-only) signature;
 *  pairing then matches the nearest such focus/blur, which is the desired
 *  behavior for anonymous fields. Returns null when there's no element at all
 *  (such actions never pair). */
function elementSignature(el: ElementDescriptor | undefined): string | null {
  if (!el) return null;
  const attrs = el.attributes ?? {};
  const attrSig = Object.keys(attrs)
    .sort()
    .map((k) => `${k}=${attrs[k]}`)
    .join(",");
  return [
    el.masked ? "M" : "",
    (el.tag || "").toLowerCase(),
    el.id ?? "",
    (el.classes ?? []).join("."),
    attrSig,
    el.text ?? "",
  ].join("|");
}

/**
 * Pair focus→blur on the same element into single rows over a time-sorted
 * action list. Algorithm: scan in order; on a focus, remember it as "open" for
 * its element signature; on a blur, if there's an open focus for the same
 * signature, emit ONE focusPair (focus + this blur) and clear it; otherwise the
 * blur is unpaired. Any focus still open at the end is emitted as a lone focus.
 * All non-focus/blur actions pass straight through. Order is preserved by the
 * focus's (earlier) timestamp — the pair occupies the focus's slot. O(n).
 *
 * Mode-independent: the SAME rows render in readable and technical view (only
 * the row's TEXT differs by mode), so search/filter results don't shift when
 * the user toggles modes.
 */
function pairFocusBlur(actions: UserAction[]): RenderRow[] {
  const rows: RenderRow[] = [];
  // signature → index in `rows` of the open (not-yet-paired) focus row.
  const openFocusRowIndex = new Map<string, number>();

  for (const action of actions) {
    if (action.type === "focus") {
      const sig = elementSignature(action.element);
      const rowIdx = rows.length;
      rows.push({ kind: "single", key: action.id, action });
      // A new focus on a signature supersedes any still-open one (the prior
      // focus simply never got a blur — it stays a lone focus row).
      if (sig != null) openFocusRowIndex.set(sig, rowIdx);
      continue;
    }
    if (action.type === "blur") {
      const sig = elementSignature(action.element);
      const openIdx = sig != null ? openFocusRowIndex.get(sig) : undefined;
      if (sig != null && openIdx != null) {
        const open = rows[openIdx];
        if (open && open.kind === "single" && open.action.type === "focus") {
          rows[openIdx] = {
            kind: "focusPair",
            key: open.action.id,
            focus: open.action,
            blur: action,
          };
          openFocusRowIndex.delete(sig);
          continue;
        }
        openFocusRowIndex.delete(sig);
      }
      // Unpaired blur → passthrough row.
      rows.push({ kind: "single", key: action.id, action });
      continue;
    }
    rows.push({ kind: "single", key: action.id, action });
  }

  return rows;
}

/** Optional held-duration label for a focus→blur pair, e.g. "0:03". Only shown
 *  when ≥1s so sub-second tab-throughs stay clean. */
function pairDurationLabel(focus: UserAction, blur: UserAction): string | null {
  const ms = blur.timestamp - focus.timestamp;
  if (!Number.isFinite(ms) || ms < 1000) return null;
  return formatElapsed(ms);
}

/** Readable text for a merged focus/blur row: the focus identifier with the
 *  "Selected" verb, plus an optional held-duration. */
function buildPairReadableDescription(focus: UserAction, blur: UserAction): string {
  const { text, quoted } = readableElementIdentifier(focus.element);
  const base = quoted ? `Selected "${text}"` : `Selected ${text}`;
  const dur = pairDurationLabel(focus, blur);
  return dur ? `${base} (held ${dur})` : base;
}

/** Clipboard-friendly single-line summary for a row. Format follows the
 *  visible representation in the current view mode. */
function formatActionForClipboard(action: UserAction, mode: ViewMode): string {
  if (mode === "readable") {
    return `[${formatAbs(action.timestamp)}] ${buildReadableDescription(action)}`;
  }
  const parts = buildDescriptionParts(action);
  const chip =
    parts.chipKind === "element"
      ? renderElementDescriptor(action.element)
      : parts.chipKind === "url"
      ? parts.chipText ?? ""
      : "";
  const text = `${parts.prefix}${chip}${parts.suffix ?? ""}`.trim();
  return `[${formatAbs(action.timestamp)}] ${text}`;
}

/** Clipboard summary for a merged focus/blur pair. Readable mirrors the visible
 *  row; technical shows the element chip with both timestamps (focus → blur). */
function formatPairForClipboard(focus: UserAction, blur: UserAction, mode: ViewMode): string {
  if (mode === "readable") {
    return `[${formatAbs(focus.timestamp)}] ${buildPairReadableDescription(focus, blur)}`;
  }
  const chip = renderElementDescriptor(focus.element);
  return `[${formatAbs(focus.timestamp)}–${formatAbs(blur.timestamp)}] Focused ${chip}`.trim();
}

/** Text used for search matching of a render row, in BOTH representations so a
 *  query works regardless of the active view mode. */
function rowSearchText(row: RenderRow): string {
  if (row.kind === "focusPair") {
    const chip = renderElementDescriptor(row.focus.element);
    return `${buildPairReadableDescription(row.focus, row.blur)} Focused ${chip}`.toLowerCase();
  }
  const a = row.action;
  const parts = buildDescriptionParts(a);
  const descriptor =
    parts.chipKind === "element"
      ? renderElementDescriptor(a.element)
      : parts.chipKind === "url"
      ? parts.chipText ?? ""
      : "";
  const technical = `${parts.prefix} ${descriptor} ${parts.suffix ?? ""}`;
  return `${technical} ${buildReadableDescription(a)}`.toLowerCase();
}

/** A render row's representative action for group-filtering / timestamp. For a
 *  pair it's the focus (which carries the row's slot + group "other"). */
function rowPrimaryAction(row: RenderRow): UserAction {
  return row.kind === "focusPair" ? row.focus : row.action;
}

function actionIcon(action: UserAction): React.ReactNode {
  const props = {
    size: 13,
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };
  switch (action.type) {
    case "click":
      return <MousePointerClick {...props} />;
    case "navigation":
      return <NavIcon {...props} />;
    case "visibility":
      return action.visibilityState === "hidden" ? (
        <EyeOff {...props} />
      ) : (
        <Eye {...props} />
      );
    case "submit":
      return <SendHorizontal {...props} />;
    case "input":
      return <Keyboard {...props} />;
    case "focus":
      return <Target {...props} />;
    case "blur":
      return <Circle {...props} />;
    case "resize":
      return <Maximize2 {...props} />;
    default:
      return <Compass {...props} />;
  }
}

export function ActionsTabContent({
  userActions,
  userActionCount,
}: ActionsTabContentProps) {
  const all = React.useMemo<UserAction[]>(
    () => userActions ?? [],
    [userActions]
  );
  const totalCount = userActionCount ?? all.length;

  const sorted = React.useMemo(
    () => [...all].sort((a, b) => a.timestamp - b.timestamp),
    [all]
  );

  // Tab-visibility events ("Switched away from tab" / "Returned to tab") are
  // noise and were removed from capture. Old stored tickets still carry them in
  // userActions, so we filter them out here BEFORE any render pass — in both
  // readable and technical modes. This runs ahead of pairFocusBlur so a
  // focus/blur pair that previously straddled a visibility row now pairs
  // correctly. The header badge still shows the raw stored userActionCount
  // (which includes these historical visibility entries on old tickets) — that
  // discrepancy is acceptable; we do NOT recompute stored counts.
  const visible = React.useMemo(
    () => sorted.filter((a) => a.type !== "visibility"),
    [sorted]
  );
  const baseTs = visible.length > 0 ? visible[0].timestamp : 0;

  // Fix D: collapse focus→blur pairs into single render rows. Presentation only
  // — the stored data behind it is unchanged; the count badge below still
  // reflects the raw userActionCount.
  const rows = React.useMemo(() => pairFocusBlur(visible), [visible]);

  const [group, setGroup] = React.useState<Group>("all");
  const [rawSearch, setRawSearch] = React.useState("");
  const search = useDebounced(rawSearch, 100);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const [viewMode, setViewModeState] = React.useState<ViewMode>(() =>
    readPersistedViewMode()
  );
  const setViewMode = React.useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    writePersistedViewMode(mode);
  }, []);

  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  }, []);
  React.useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Cmd/Ctrl+F focuses search (mirrors Console tab).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === "f" || e.key === "F")) {
        if (!searchInputRef.current) return;
        e.preventDefault();
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filter-chip counts operate on the post-filter (visibility-stripped) list,
  // so "Other" and "All" don't tally the removed tab-visibility rows.
  const counts = React.useMemo(() => {
    let clicks = 0;
    let nav = 0;
    let inputs = 0;
    let other = 0;
    for (const a of visible) {
      const g = actionGroup(a.type);
      if (g === "click") clicks += 1;
      else if (g === "navigation") nav += 1;
      else if (g === "input") inputs += 1;
      else other += 1;
    }
    return { all: visible.length, click: clicks, navigation: nav, input: inputs, other };
  }, [visible]);

  // Filter/search operate on the PAIRED render rows (Fix D). Group membership
  // uses the row's primary action (a focus/blur pair sits in "other" via its
  // focus). Search matches BOTH representations so a query works regardless of
  // the active view mode — picking "the less-surprising behavior" per the spec.
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!isVisible(rowPrimaryAction(row), group)) return false;
      if (!q) return true;
      return rowSearchText(row).includes(q);
    });
  }, [rows, group, search]);

  const anyFilterActive = group !== "all" || search.length > 0;

  const resetFilters = () => {
    setGroup("all");
    setRawSearch("");
  };

  const copyToClipboard = React.useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } catch {
        showToast("Copy failed");
      }
    },
    [showToast]
  );

  return (
    <div className="relative">
      <style>{`
        .actab-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: -0.005em;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease;
          user-select: none;
          background: transparent;
        }
        .actab-chip:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .actab-chip-count {
          font-size: 10.5px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          padding: 0 5px;
          border-radius: 999px;
          min-width: 16px;
          text-align: center;
        }
        .actab-search {
          height: 32px;
          width: 100%;
          padding: 0 28px 0 10px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 12.5px;
          font-family: inherit;
          color: var(--text-heading);
          transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
          outline: none;
        }
        .actab-search::placeholder { color: var(--text-placeholder); }
        .actab-search:hover { border-color: var(--border-strong); }
        .actab-search:focus {
          background: var(--surface);
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(90,73,191,0.10);
        }
        .actab-search-clear {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease;
        }
        .actab-search-clear:hover {
          background: var(--surface-hover);
          color: var(--text-heading);
        }

        .actab-viewtoggle {
          display: inline-flex;
          align-items: center;
          padding: 2px;
          background: var(--surface-subtle);
          border: 1px solid var(--border);
          border-radius: 999px;
          height: 26px;
          gap: 0;
        }
        .actab-viewtoggle-seg {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 20px;
          padding: 0 10px;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: -0.005em;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: background-color 160ms ease, color 160ms ease;
          user-select: none;
        }
        .actab-viewtoggle-seg[aria-pressed="true"] {
          background: var(--surface);
          color: var(--text-heading);
          box-shadow: 0 1px 2px rgba(21,16,31,0.06);
        }
        .actab-viewtoggle-seg:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        .actab-list {
          border-top: 1px solid var(--border);
        }
        .actab-row {
          display: grid;
          grid-template-columns: 44px 16px minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          min-height: 34px;
          padding: 6px 10px 6px 12px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background-color 120ms ease, opacity 120ms ease;
          font-size: 11.5px;
          color: var(--text-heading);
          position: relative;
        }
        .actab-row:hover {
          background: var(--surface-hover);
        }
        .actab-row.is-low-signal {
          opacity: 0.55;
        }
        .actab-row.is-low-signal:hover {
          opacity: 0.85;
        }
        .actab-row:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
        }
        .actab-time {
          font-size: 10.5px;
          font-variant-numeric: tabular-nums;
          color: var(--text-tertiary);
          text-align: right;
          padding-right: 2px;
        }
        .actab-icon {
          color: var(--text-tertiary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .actab-desc {
          font-size: 12.5px;
          color: var(--dt-text-body);
          min-width: 0;
          white-space: normal;
          word-break: break-word;
          line-height: 1.5;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px;
        }
        /* The action verb ("Clicked", "Navigated to") reads as dark body prose,
           with the element/URL chip carrying the monospace contrast. */
        .actab-desc-text {
          color: var(--dt-text-body);
          font-weight: 500;
        }
        .actab-readable {
          color: var(--text-heading);
          font-size: 12.5px;
          line-height: 1.5;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        /* Element / URL descriptor chip — tinted monospace pill matching the
           shared .dt-code atom so it reads as scannable technical data. */
        .actab-element {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 1px 6px;
          height: 18px;
          border-radius: 5px;
          background: var(--dt-code-bg);
          border: 1px solid var(--dt-code-border);
          font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
          font-size: 10.5px;
          font-weight: 500;
          color: var(--dt-code-text);
          line-height: 1;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: baseline;
        }
        .actab-element.is-masked {
          color: var(--text-tertiary);
          font-style: italic;
        }

        .actab-header-row {
          display: grid;
          grid-template-columns: 44px 16px minmax(0, 1fr);
          gap: 10px;
          padding: 0 10px 0 12px;
          height: 24px;
          align-items: center;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
          border-bottom: 1px solid var(--border);
          background: var(--surface-subtle);
        }
        .actab-header-cell-time { text-align: right; padding-right: 2px; }

        .actab-toast {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 12px;
          background: var(--text-heading);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          border-radius: 999px;
          box-shadow: var(--shadow-md);
          pointer-events: none;
          z-index: 5;
          animation: actab-toast-in 200ms ${SPRING} both;
        }
        @keyframes actab-toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        .actab-clear-btn {
          margin-top: 14px;
          display: inline-flex;
          height: 30px;
          align-items: center;
          padding: 0 12px;
          border-radius: 8px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          color: var(--text-heading);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
        }
        .actab-clear-btn:hover {
          background: var(--surface-subtle);
          border-color: var(--border-strong);
        }
        .actab-clear-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .actab-chip,
          .actab-search,
          .actab-row,
          .actab-toast,
          .actab-viewtoggle-seg {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="px-4 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <FilterBar
            group={group}
            counts={counts}
            onChange={setGroup}
          />
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <div className="relative mt-3">
          <input
            ref={searchInputRef}
            type="text"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search user actions"
            aria-label="Search user actions"
            className="actab-search"
            spellCheck={false}
            autoComplete="off"
          />
          {rawSearch ? (
            <button
              type="button"
              className="actab-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setRawSearch("");
                searchInputRef.current?.focus();
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill="none">
                <path
                  d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="pb-6">
        {visible.length === 0 ? (
          <div className="px-4 pt-6 pb-2">
            <CanvasEmptyState
              illustration={<NoActivityIllu />}
              title="No user actions captured for this ticket."
              description="Clicks, navigation, form input, and other page interactions will appear here."
              density="compact"
            />
          </div>
        ) : filtered.length === 0 ? (
          <FilterEmptyState onClear={resetFilters} total={totalCount} />
        ) : (
          <div>
            <div className="actab-header-row" aria-hidden="true">
              <div className="actab-header-cell-time">Time</div>
              <div />
              <div>Action</div>
            </div>
            <div
              className="actab-list"
              role="group"
              aria-label="Captured user actions"
            >
              {filtered.map((row) =>
                row.kind === "focusPair" ? (
                  <PairRow
                    key={row.key}
                    focus={row.focus}
                    blur={row.blur}
                    baseTs={baseTs}
                    viewMode={viewMode}
                    onCopy={() =>
                      copyToClipboard(
                        formatPairForClipboard(row.focus, row.blur, viewMode),
                        "Copied"
                      )
                    }
                  />
                ) : (
                  <ActionRow
                    key={row.key}
                    action={row.action}
                    baseTs={baseTs}
                    viewMode={viewMode}
                    onCopy={() =>
                      copyToClipboard(
                        formatActionForClipboard(row.action, viewMode),
                        "Copied"
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {toast ? <div className="actab-toast">{toast}</div> : null}
      </div>
    </div>
  );
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div
      className="actab-viewtoggle"
      role="group"
      aria-label="Action display mode"
    >
      <button
        type="button"
        className="actab-viewtoggle-seg"
        aria-pressed={mode === "readable"}
        onClick={() => onChange("readable")}
      >
        Readable
      </button>
      <button
        type="button"
        className="actab-viewtoggle-seg"
        aria-pressed={mode === "technical"}
        onClick={() => onChange("technical")}
      >
        Technical
      </button>
    </div>
  );
}

function FilterBar({
  group,
  counts,
  onChange,
}: {
  group: Group;
  counts: {
    all: number;
    click: number;
    navigation: number;
    input: number;
    other: number;
  };
  onChange: (g: Group) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip
        label="All"
        count={counts.all}
        active={group === "all"}
        dotColor="var(--text-tertiary)"
        onClick={() => onChange("all")}
      />
      <Chip
        label="Clicks"
        count={counts.click}
        active={group === "click"}
        dotColor="var(--brand)"
        onClick={() => onChange(group === "click" ? "all" : "click")}
      />
      <Chip
        label="Navigation"
        count={counts.navigation}
        active={group === "navigation"}
        dotColor="var(--color-success)"
        onClick={() =>
          onChange(group === "navigation" ? "all" : "navigation")
        }
      />
      <Chip
        label="Inputs"
        count={counts.input}
        active={group === "input"}
        dotColor="var(--color-warning-text)"
        onClick={() => onChange(group === "input" ? "all" : "input")}
      />
      <Chip
        label="Other"
        count={counts.other}
        active={group === "other"}
        dotColor="var(--text-tertiary)"
        onClick={() => onChange(group === "other" ? "all" : "other")}
      />
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  dotColor,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  dotColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="actab-chip"
      style={{
        background: active ? "var(--surface-hover)" : "transparent",
        borderColor: active ? "var(--border)" : "transparent",
        color: active ? "var(--text-heading)" : "var(--text-tertiary)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: active ? dotColor : "var(--text-placeholder)",
          transition: "background-color 180ms ease",
        }}
      />
      <span>{label}</span>
      <span
        className="actab-chip-count"
        style={{
          color: active ? "var(--text-secondary)" : "var(--text-placeholder)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function ActionRow({
  action,
  baseTs,
  viewMode,
  onCopy,
}: {
  action: UserAction;
  baseTs: number;
  viewMode: ViewMode;
  onCopy: () => void;
}) {
  const elapsed = formatElapsed(Math.max(0, action.timestamp - baseTs));
  const absLabel = formatAbs(action.timestamp);
  const lowSignal = isLowSignal(action);

  return (
    <div
      className={`actab-row${lowSignal ? " is-low-signal" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCopy();
        }
      }}
      aria-label={`${action.type} action at ${absLabel}. Click to copy.`}
    >
      <div className="actab-time" title={absLabel}>
        {elapsed}
      </div>
      <div className="actab-icon">{actionIcon(action)}</div>
      {viewMode === "readable" ? (
        <ReadableRowBody action={action} />
      ) : (
        <TechnicalRowBody action={action} />
      )}
    </div>
  );
}

function ReadableRowBody({ action }: { action: UserAction }) {
  const text = buildReadableDescription(action);
  return (
    <div className="actab-readable" title={text}>
      {text}
    </div>
  );
}

function TechnicalRowBody({ action }: { action: UserAction }) {
  const parts = buildDescriptionParts(action);
  const elementChip =
    parts.chipKind === "element"
      ? action.element
        ? renderElementDescriptor(action.element)
        : null
      : null;
  const urlChip =
    parts.chipKind === "url" && parts.chipText ? parts.chipText : null;

  return (
    <div className="actab-desc">
      <span className="actab-desc-text">{parts.prefix.trimEnd()}</span>
      {elementChip != null ? (
        <span
          className={`actab-element${action.element?.masked ? " is-masked" : ""}`}
          title={
            action.element?.masked
              ? "Element details withheld for privacy"
              : elementChip
          }
        >
          {elementChip}
        </span>
      ) : null}
      {urlChip != null ? (
        <span className="actab-element" title={urlChip}>
          {urlChip}
        </span>
      ) : null}
      {parts.suffix ? (
        <span className="actab-desc-text">{parts.suffix}</span>
      ) : null}
    </div>
  );
}

/** A merged focus→blur interaction rendered as ONE row (Fix D). Mirrors
 *  ActionRow's layout; the time column and icon come from the focus, the body
 *  shows the merged description (readable: "Selected …"; technical: the element
 *  chip with both focus & blur timestamps surfaced via title + held-duration). */
function PairRow({
  focus,
  blur,
  baseTs,
  viewMode,
  onCopy,
}: {
  focus: UserAction;
  blur: UserAction;
  baseTs: number;
  viewMode: ViewMode;
  onCopy: () => void;
}) {
  const elapsed = formatElapsed(Math.max(0, focus.timestamp - baseTs));
  const absLabel = formatAbs(focus.timestamp);
  const blurAbs = formatAbs(blur.timestamp);
  // A pair inherits the focus's low-signal styling (same element, same rule).
  const lowSignal = isLowSignal(focus);

  return (
    <div
      className={`actab-row${lowSignal ? " is-low-signal" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCopy();
        }
      }}
      aria-label={`focus interaction from ${absLabel} to ${blurAbs}. Click to copy.`}
    >
      <div className="actab-time" title={`${absLabel} – ${blurAbs}`}>
        {elapsed}
      </div>
      <div className="actab-icon">{actionIcon(focus)}</div>
      {viewMode === "readable" ? (
        <PairReadableRowBody focus={focus} blur={blur} />
      ) : (
        <PairTechnicalRowBody focus={focus} blur={blur} />
      )}
    </div>
  );
}

function PairReadableRowBody({ focus, blur }: { focus: UserAction; blur: UserAction }) {
  const text = buildPairReadableDescription(focus, blur);
  return (
    <div className="actab-readable" title={text}>
      {text}
    </div>
  );
}

function PairTechnicalRowBody({ focus, blur }: { focus: UserAction; blur: UserAction }) {
  const elementChip = focus.element ? renderElementDescriptor(focus.element) : null;
  const dur = pairDurationLabel(focus, blur);

  return (
    <div className="actab-desc">
      <span className="actab-desc-text">Focused</span>
      {elementChip != null ? (
        <span
          className={`actab-element${focus.element?.masked ? " is-masked" : ""}`}
          title={
            focus.element?.masked
              ? "Element details withheld for privacy"
              : elementChip
          }
        >
          {elementChip}
        </span>
      ) : null}
      {dur ? <span className="actab-desc-text">{`· held ${dur}`}</span> : null}
    </div>
  );
}

function FilterEmptyState({
  onClear,
  total,
}: {
  onClear: () => void;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-10 pb-8 px-6">
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-heading)",
          letterSpacing: "-0.005em",
        }}
      >
        No actions match your filters
      </h3>
      <p
        className="mt-1"
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          maxWidth: 260,
        }}
      >
        {total} {total === 1 ? "action is" : "actions are"} available. Adjust
        the filter chips or clear the search to see them.
      </p>
      <button type="button" className="actab-clear-btn" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}

export default ActionsTabContent;
