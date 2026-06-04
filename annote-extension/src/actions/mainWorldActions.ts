/**
 * MAIN-world user-actions capture script.
 *
 * Runs in the page's main JavaScript context (manifest content_script with
 * `world: "MAIN"`, Chrome 111+). Listens for user-interaction events and
 * pushes redacted `UserAction` entries into a per-realm ring buffer.
 *
 * Mirrors the install / idempotency / defensive-listener posture of
 * `../console/mainWorld.ts` and `../network/mainWorldNetwork.ts`. Kept as a
 * separate bundle so a bug in one capture surface cannot kill the others.
 *
 * What this script CAPTURES:
 *  - click, submit, focus, blur, input (field edited, NEVER value)
 *  - visibilitychange, resize
 *  - SPA navigation (pushState/replaceState/popstate/hashchange)
 *
 * What this script does NOT do (deferred phases):
 *  - postMessage bridge to the isolated world (Phase A3)
 *  - injection wiring in background.ts (Phase A3)
 *  - server persistence (Phase A4)
 *  - UI (Phase A5)
 *
 * Pure-observer discipline: every listener is passive + capture; we never
 * call preventDefault, stopPropagation, or stopImmediatePropagation. The
 * history wrappers call through to the native function FIRST so the page's
 * navigation runs identically whether or not we're present — even if our
 * post-call recording code throws.
 *
 * Cannot import the cross-realm logger and cannot use chrome.runtime — this
 * script runs in the page's own JS context.
 */

import { ActionBuffer } from "./buffer";
import { CAPTURED_ATTRIBUTES, isAnnoteElement, isNoisyTag } from "./denylist";
import { getPrivacyTreatment } from "../shared/privacy";
import { redactAttributes, redactElementText, redactUrl } from "./redactAction";
import type {
  ActionsSnapshot,
  ActionsSnapshotRequest,
  ElementDescriptor,
  NavigationMethod,
  UserAction,
  VisibilityState as ActionVisibilityState,
} from "./types";
import {
  ACTIONS_BRIDGE_SOURCE_ISOLATED,
  ACTIONS_BRIDGE_SOURCE_MAIN,
  ACTIONS_FLUSH_PUSH,
  ACTIONS_SNAPSHOT_REQUEST,
  ACTIONS_SNAPSHOT_RESPONSE,
} from "./types";

declare global {
  interface Window {
    __ECHLY_ACTIONS_WRAPPED__?: boolean;
    /**
     * A3 will reach in here for the snapshot accessor. Mirrors how the other
     * MAIN-world scripts make their buffer reachable to their bridge code.
     */
    __ECHLY_ACTIONS_GET_SNAPSHOT__?: () => ActionsSnapshot;
  }
  interface History {
    __ECHLY_HISTORY_WRAPPED__?: boolean;
  }
}

(function initActionsCapture() {
  if (window.__ECHLY_ACTIONS_WRAPPED__) return;
  window.__ECHLY_ACTIONS_WRAPPED__ = true;

  const buffer = new ActionBuffer();

  // Cap on captured classes per element. Some component libraries emit
  // pathological class lists (utility-css frameworks, fingerprinting libs).
  // 10 is generous for identifying a component without bloating the buffer.
  const MAX_CLASSES = 10;

  // Per-field input debounce — one "edited X" per quiet period, not one per
  // keystroke. 500ms matches typical typing-pause boundaries.
  const INPUT_DEBOUNCE_MS = 500;

  // Resize is fired many times per second during a window drag. Debounce so
  // we record the FINAL size after a short quiet period.
  const RESIZE_DEBOUNCE_MS = 300;

  // Collapse a focus immediately followed by a blur on the same element
  // within this window into a no-op pair. Keeps the timeline readable when
  // tab-cycling through a form.
  const FOCUS_BLUR_COALESCE_MS = 50;

  function newId(): string {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch {
      // fall through
    }
    return "a-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
  }

  function safeLocationHref(): string {
    try {
      return window.location.href;
    } catch {
      return "";
    }
  }

  // ─── Synthetic-event safety cap ────────────────────────────────
  // Defence against synthetic event storms (animation-driven focus loops,
  // framework re-render input floods). Human input never approaches this
  // rate; the cap is belt-and-braces only. Mirrors the console-side
  // circuit-breaker shape but kept simpler: when more than RATE_LIMIT
  // actions are pushed in a rolling 1-second window, we stop recording
  // until the rate drops below the threshold for one full window.
  const RATE_LIMIT_WINDOW_MS = 1000;
  const RATE_LIMIT_MAX = 100;
  let rateWindowStart = 0;
  let rateWindowCount = 0;
  let rateLimited = false;

  function pushAction(action: Omit<UserAction, "id">): void {
    try {
      const now = Date.now();
      if (now - rateWindowStart >= RATE_LIMIT_WINDOW_MS) {
        rateWindowStart = now;
        rateWindowCount = 0;
        rateLimited = false;
      }
      rateWindowCount += 1;
      if (rateWindowCount > RATE_LIMIT_MAX) {
        rateLimited = true;
        return;
      }
      if (rateLimited) return;
      buffer.addAction({ id: newId(), ...action });
    } catch {
      // never throw out of a capture handler
    }
  }

  // ─── Element resolution ────────────────────────────────────────
  // composedPath()[0] pierces shadow DOM so we see the real target inside
  // Web Components (Stripe Elements, Salesforce, Lit/Stencil-based UIs)
  // instead of the shadow host.
  function resolveTarget(event: Event): Element | null {
    try {
      if (typeof event.composedPath === "function") {
        const path = event.composedPath();
        if (path && path.length > 0) {
          for (const node of path) {
            if (node && (node as Element).nodeType === 1) {
              return node as Element;
            }
          }
        }
      }
    } catch {
      // fall through to event.target
    }
    const t = event.target;
    if (t && (t as Element).nodeType === 1) return t as Element;
    return null;
  }

  // ─── Element descriptor ────────────────────────────────────────
  // Builds the Jam-style descriptor. Privacy treatment gates how much detail
  // is recorded; isAnnoteElement skips our own widget entirely.
  function buildDescriptor(el: Element | null): ElementDescriptor | undefined {
    if (!el || el.nodeType !== 1) return undefined;
    if (isAnnoteElement(el)) return undefined;

    let treatment: "block" | "mask" | "allow";
    try {
      treatment = getPrivacyTreatment(el);
    } catch {
      treatment = "block"; // fail-private
    }

    try {
      const tag = (el.tagName || "unknown").toLowerCase();

      if (treatment === "block") {
        return { tag, masked: true };
      }

      if (treatment === "mask") {
        // Keep structural fields (tag, classes) but drop text and any
        // free-text attributes (placeholder/title/alt/aria-label/href).
        const classes = readClasses(el);
        const out: ElementDescriptor = { tag, masked: true };
        if (classes.length > 0) out.classes = classes;
        const structural = readStructuralAttributes(el);
        if (Object.keys(structural).length > 0) out.attributes = structural;
        return out;
      }

      // treatment === "allow"
      const desc: ElementDescriptor = { tag };
      if (el.id) desc.id = el.id;
      const classes = readClasses(el);
      if (classes.length > 0) desc.classes = classes;
      const attrs = readCapturedAttributes(el);
      if (Object.keys(attrs).length > 0) desc.attributes = redactAttributes(attrs);
      const text = redactElementText(extractVisibleText(el));
      if (text) desc.text = text;
      return desc;
    } catch {
      // Exotic elements (SVG, custom elements) can throw on some property
      // accesses. Fall back to a structural marker so we still record that
      // *something* happened without leaking partial state.
      return { tag: "unknown", masked: true };
    }
  }

  function readClasses(el: Element): string[] {
    try {
      const list = el.classList;
      if (!list || list.length === 0) return [];
      const out: string[] = [];
      const max = Math.min(list.length, MAX_CLASSES);
      for (let i = 0; i < max; i++) {
        const c = list.item(i);
        if (c) out.push(c);
      }
      return out;
    } catch {
      return [];
    }
  }

  function readCapturedAttributes(el: Element): Record<string, string> {
    const out: Record<string, string> = {};
    try {
      for (const name of CAPTURED_ATTRIBUTES) {
        if (el.hasAttribute(name)) {
          const v = el.getAttribute(name);
          if (v !== null) out[name] = v;
        }
      }
    } catch {
      // swallow — partial info is fine
    }
    return out;
  }

  // Subset of CAPTURED_ATTRIBUTES that is NOT free-text. For "mask" treatment
  // we keep role/type/name (structural identifiers) but omit the free-text
  // attributes whose values would leak label content.
  const STRUCTURAL_ATTRS: ReadonlySet<string> = new Set(["role", "type", "name"]);

  function readStructuralAttributes(el: Element): Record<string, string> {
    const out: Record<string, string> = {};
    try {
      for (const name of CAPTURED_ATTRIBUTES) {
        if (!STRUCTURAL_ATTRS.has(name)) continue;
        if (el.hasAttribute(name)) {
          const v = el.getAttribute(name);
          if (v !== null) out[name] = v;
        }
      }
    } catch {
      // swallow
    }
    return out;
  }

  /**
   * Pick the best visible-text approximation for an element.
   *
   * - For form inputs: NEVER use `.value` (privacy). Prefer aria-label,
   *   associated <label>, name, placeholder, then the input type.
   * - For everything else: textContent.
   *
   * All of these get further redacted/truncated by `redactElementText`.
   */
  function extractVisibleText(el: Element): string {
    try {
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        // CRITICAL: never read (el as HTMLInputElement).value — that's the
        // user's typed data and is the central privacy invariant of this
        // capture surface. If you are editing this code and feel the urge to
        // add `.value` anywhere, STOP — it's the one thing this script must
        // never read.
        return pickFieldLabel(el) || "";
      }
      const text = el.textContent;
      return typeof text === "string" ? text : "";
    } catch {
      return "";
    }
  }

  /**
   * Build a field label for an input — the only identification we keep for
   * input events, since the value itself is deliberately never captured.
   * Tries aria-label, the associated <label> text, name, placeholder, type,
   * in that order. The chosen string is then redacted by the caller.
   */
  function pickFieldLabel(el: Element): string {
    try {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return aria;

      // <label for="id"> association.
      const id = el.id;
      if (id) {
        try {
          const labelEl = (el.ownerDocument || document).querySelector(
            'label[for="' + cssEscape(id) + '"]',
          );
          if (labelEl && labelEl.textContent && labelEl.textContent.trim()) {
            return labelEl.textContent;
          }
        } catch {
          // swallow — querySelector may throw on exotic ids
        }
      }

      // Implicit <label><input/></label> association.
      try {
        let parent: Element | null = el.parentElement;
        let hops = 0;
        while (parent && hops < 4) {
          if (parent.tagName && parent.tagName.toLowerCase() === "label") {
            const text = parent.textContent;
            if (text && text.trim()) return text;
            break;
          }
          parent = parent.parentElement;
          hops++;
        }
      } catch {
        // swallow
      }

      const name = el.getAttribute("name");
      if (name && name.trim()) return name;

      const placeholder = el.getAttribute("placeholder");
      if (placeholder && placeholder.trim()) return placeholder;

      const type = el.getAttribute("type");
      if (type && type.trim()) return type;
    } catch {
      // swallow
    }
    return "";
  }

  function cssEscape(s: string): string {
    try {
      const fn = (window as unknown as { CSS?: { escape?: (s: string) => string } }).CSS;
      if (fn && typeof fn.escape === "function") return fn.escape(s);
    } catch {
      // fall through
    }
    // Minimal fallback: escape ", \, and newlines so the attribute selector
    // remains valid for the common id shapes.
    return s.replace(/(["\\\n])/g, "\\$1");
  }

  // ─── Click ─────────────────────────────────────────────────────
  function onClick(event: Event): void {
    try {
      const target = resolveTarget(event);
      if (!target) return;
      if (isAnnoteElement(target)) return;
      const tag = (target.tagName || "").toLowerCase();
      // Skip bare html/body backdrop clicks — see denylist.isNoisyTag.
      if (isNoisyTag(tag)) return;
      pushAction({
        type: "click",
        timestamp: Date.now(),
        element: buildDescriptor(target),
      });
    } catch {
      // never throw from a listener
    }
  }

  // ─── Submit ────────────────────────────────────────────────────
  function onSubmit(event: Event): void {
    try {
      const target = resolveTarget(event);
      if (!target) return;
      if (isAnnoteElement(target)) return;
      pushAction({
        type: "submit",
        timestamp: Date.now(),
        element: buildDescriptor(target),
      });
    } catch {
      // swallow
    }
  }

  // ─── Input (field edited, NEVER value) ─────────────────────────
  // Per-element debounce. We hold a per-instance timer keyed off a WeakMap
  // so removed elements don't pin entries. Each timer records ONE action
  // when it fires — the last sample of the burst.
  type PendingInput = {
    timer: ReturnType<typeof setTimeout>;
    element: Element;
    fieldLabel: string;
  };
  const inputPending = new WeakMap<Element, PendingInput>();

  function onInput(event: Event): void {
    try {
      const target = resolveTarget(event);
      if (!target) return;
      if (isAnnoteElement(target)) return;

      // PRIVACY INVARIANT: we DO NOT read target.value here, anywhere in this
      // handler, or anywhere in the pipeline below. The fieldLabel is built
      // from aria-label / <label> / name / placeholder / type — never the
      // typed value. If a future maintainer is tempted to read .value, stop
      // and re-read the privacy section of the A2 spec.
      const rawLabel = pickFieldLabel(target);
      const fieldLabel = redactElementText(rawLabel);

      const existing = inputPending.get(target);
      if (existing) {
        clearTimeout(existing.timer);
      }

      const timer = setTimeout(() => {
        try {
          inputPending.delete(target);
          pushAction({
            type: "input",
            timestamp: Date.now(),
            element: buildDescriptor(target),
            fieldLabel: fieldLabel || undefined,
          });
        } catch {
          // swallow
        }
      }, INPUT_DEBOUNCE_MS);

      inputPending.set(target, { timer, element: target, fieldLabel });
    } catch {
      // swallow
    }
  }

  // ─── Focus / blur ──────────────────────────────────────────────
  // Coalesce a focus immediately followed by a blur on the same element.
  let lastFocusEl: Element | null = null;
  let lastFocusAt = 0;
  let lastFocusActionPushed = false;

  function onFocusIn(event: Event): void {
    try {
      const target = resolveTarget(event);
      if (!target) return;
      if (isAnnoteElement(target)) return;
      const tag = (target.tagName || "").toLowerCase();
      if (isNoisyTag(tag)) return;

      lastFocusEl = target;
      lastFocusAt = Date.now();
      lastFocusActionPushed = false;

      pushAction({
        type: "focus",
        timestamp: lastFocusAt,
        element: buildDescriptor(target),
      });
      lastFocusActionPushed = true;
    } catch {
      // swallow
    }
  }

  function onFocusOut(event: Event): void {
    try {
      const target = resolveTarget(event);
      if (!target) return;
      if (isAnnoteElement(target)) return;
      const tag = (target.tagName || "").toLowerCase();
      if (isNoisyTag(tag)) return;

      const now = Date.now();
      // Coalesce: if this blur fires on the same element within the coalesce
      // window AND we pushed the focus for it, the pair was a passthrough
      // (tab-cycle). Drop both — pop the focus entry from the buffer is too
      // surgical; instead just skip the blur. The lone focus stays, which is
      // closer to "user briefly visited this field" semantics anyway.
      if (
        lastFocusEl === target &&
        lastFocusActionPushed &&
        now - lastFocusAt < FOCUS_BLUR_COALESCE_MS
      ) {
        lastFocusEl = null;
        lastFocusActionPushed = false;
        return;
      }
      lastFocusEl = null;
      lastFocusActionPushed = false;

      pushAction({
        type: "blur",
        timestamp: now,
        element: buildDescriptor(target),
      });
    } catch {
      // swallow
    }
  }

  // ─── Visibility ────────────────────────────────────────────────
  function onVisibility(): void {
    try {
      const state = document.visibilityState as ActionVisibilityState;
      pushAction({
        type: "visibility",
        timestamp: Date.now(),
        visibilityState: state,
      });
    } catch {
      // swallow
    }
  }

  // ─── Resize (debounced) ────────────────────────────────────────
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  function onResize(): void {
    try {
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        try {
          pushAction({
            type: "resize",
            timestamp: Date.now(),
            viewport: { width: window.innerWidth, height: window.innerHeight },
          });
        } catch {
          // swallow
        }
      }, RESIZE_DEBOUNCE_MS);
    } catch {
      // swallow
    }
  }

  // ─── Navigation ────────────────────────────────────────────────
  // Tracks the current URL as observed (post-redaction). On any URL change
  // detected via pushState / replaceState / popstate / hashchange we emit a
  // single navigation entry and update the cursor. No-op transitions
  // (replaceState with the same URL) are skipped — they're surprisingly
  // common on SPA frameworks and would otherwise spam the buffer.
  let lastNavUrl = safeLocationHref();

  function recordNavigationIfChanged(method: NavigationMethod): void {
    try {
      const next = safeLocationHref();
      if (!next || next === lastNavUrl) return;
      const fromUrl = redactUrl(lastNavUrl);
      const toUrl = redactUrl(next);
      lastNavUrl = next;
      pushAction({
        type: "navigation",
        timestamp: Date.now(),
        fromUrl,
        url: toUrl,
        navigationMethod: method,
      });
    } catch {
      // swallow
    }
  }

  function installHistoryWrappers(): void {
    // Guard against double-wrapping. The flag lives on History.prototype so
    // re-running this script in the same realm (HMR, devtools eval) won't
    // double-wrap and form a self-loop.
    if (window.history.__ECHLY_HISTORY_WRAPPED__) return;

    try {
      const origPushState = window.history.pushState;
      const origReplaceState = window.history.replaceState;

      if (typeof origPushState === "function") {
        // CRITICAL: call the native FIRST, capture its return value, then
        // record. If our recording code throws, the page's navigation has
        // already happened with native semantics — the page is unaffected
        // by any bug in our observer.
        window.history.pushState = function (
          this: History,
          ...args: Parameters<History["pushState"]>
        ): ReturnType<History["pushState"]> {
          const result = origPushState.apply(this, args);
          try {
            recordNavigationIfChanged("pushState");
          } catch {
            // swallow — never let our error reach the page
          }
          return result;
        };
      }

      if (typeof origReplaceState === "function") {
        window.history.replaceState = function (
          this: History,
          ...args: Parameters<History["replaceState"]>
        ): ReturnType<History["replaceState"]> {
          const result = origReplaceState.apply(this, args);
          try {
            recordNavigationIfChanged("replaceState");
          } catch {
            // swallow
          }
          return result;
        };
      }

      window.history.__ECHLY_HISTORY_WRAPPED__ = true;
    } catch {
      // swallow — some pages freeze history.
    }
  }

  function onPopState(): void {
    recordNavigationIfChanged("popstate");
  }

  function onHashChange(): void {
    recordNavigationIfChanged("hashchange");
  }

  // ─── Listener attachment ───────────────────────────────────────
  // All passive + capture. We are pure observers — never preventDefault,
  // stopPropagation, or stopImmediatePropagation anywhere in this file.
  const captureOpts: AddEventListenerOptions = { capture: true, passive: true };
  const passiveOpts: AddEventListenerOptions = { passive: true };

  try {
    document.addEventListener("click", onClick, captureOpts);
    document.addEventListener("submit", onSubmit, captureOpts);
    document.addEventListener("input", onInput, captureOpts);
    // focusin/focusout (NOT focus/blur) — they bubble and so reach the
    // document-level capture listener.
    document.addEventListener("focusin", onFocusIn, captureOpts);
    document.addEventListener("focusout", onFocusOut, captureOpts);
    document.addEventListener("visibilitychange", onVisibility, passiveOpts);
    window.addEventListener("resize", onResize, passiveOpts);
    window.addEventListener("popstate", onPopState, passiveOpts);
    window.addEventListener("hashchange", onHashChange, passiveOpts);
  } catch {
    // If a page somehow blocks addEventListener we lose capture; not fatal.
  }

  installHistoryWrappers();

  // ─── Snapshot accessor (for A3 to wire) ────────────────────────
  // Expose a stable read path for the upcoming postMessage bridge. The
  // bridge itself is intentionally NOT wired here (A3 owns that surface).
  // Mirrors how the other MAIN-world scripts leave their buffer reachable.
  function getSnapshot(): ActionsSnapshot {
    return buffer.snapshot();
  }
  try {
    window.__ECHLY_ACTIONS_GET_SNAPSHOT__ = getSnapshot;
  } catch {
    // swallow
  }

  // ─── postMessage bridge ────────────────────────────────────────
  // Mirrors the console bridge handler in console/mainWorld.ts. We exchange
  // snapshots with the isolated-world bridge via window.postMessage — the
  // one channel both worlds share. Origin validation rejects forged
  // structure tags from foreign frames; empty origin is allowed for
  // transitional same-window documents.
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.origin !== "" && event.origin !== window.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const typed = data as { type?: unknown };
    if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_ACTIONS_")) return;
    const msg = data as ActionsSnapshotRequest;
    if (
      msg.source === ACTIONS_BRIDGE_SOURCE_ISOLATED &&
      msg.type === ACTIONS_SNAPSHOT_REQUEST &&
      typeof msg.requestId === "string"
    ) {
      try {
        window.postMessage(
          {
            source: ACTIONS_BRIDGE_SOURCE_MAIN,
            type: ACTIONS_SNAPSHOT_RESPONSE,
            requestId: msg.requestId,
            snapshot: buffer.snapshot(),
          },
          "*",
        );
      } catch {
        // swallow
      }
    }
  });

  // Defensive flush: a navigation between session-start and ticket-file
  // would otherwise lose actions because the MAIN realm tears down before
  // the isolated bridge can request a snapshot. Push the current buffer
  // contents to the isolated world on visibilitychange→hidden and
  // beforeunload; the isolated bridge caches the most recent push and
  // falls back to it when its own request times out.
  function flushPush(): void {
    try {
      window.postMessage(
        {
          source: ACTIONS_BRIDGE_SOURCE_MAIN,
          type: ACTIONS_FLUSH_PUSH,
          snapshot: buffer.snapshot(),
        },
        "*",
      );
    } catch {
      // swallow
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPush();
  });
  window.addEventListener("beforeunload", flushPush);
})();
