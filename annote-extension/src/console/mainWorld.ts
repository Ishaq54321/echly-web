/**
 * MAIN-world console capture script.
 *
 * Runs in the page's main JavaScript context (manifest content_script with
 * `world: "MAIN"`, Chrome 111+). This is the ONLY way to observe console
 * calls and uncaught errors as they happen on the page — content scripts in
 * the default isolated world cannot see them.
 *
 * Responsibilities:
 *   1. Wrap console.{log,info,warn,error,debug} on first install, preserving
 *      any existing wrap (Sentry, LogRocket, etc.) by calling through to
 *      whatever was *currently* in window.console at install time.
 *   2. Listen for uncaught errors and unhandled rejections.
 *   3. Redact every captured string at capture time before it touches the
 *      buffer — we never store unredacted PII.
 *   4. Maintain a ring buffer of recent entries (ConsoleBuffer).
 *   5. Pause capture if log rate exceeds 100/sec for 5 sustained seconds
 *      (circuit breaker), emit synthetic warning, resume after 10 quiet sec.
 *   6. Re-wrap every 250ms if window.console.log is no longer our function —
 *      preserving any outer wrap installed on top of us in the meantime.
 *   7. Bridge: respond to ECHLY_CONSOLE_SNAPSHOT_REQUEST and push snapshots
 *      on visibilitychange / beforeunload.
 *
 * Cannot import the cross-realm logger and cannot use chrome.runtime — this
 * script runs in the page's own JS context.
 */

import { ConsoleBuffer } from "./buffer";
import { isDenylisted, isExtensionOrigin } from "./denylist";
import { redact } from "./redact";
import { serializeNode } from "./serializeElement";
import type {
  ConsoleLogEntry,
  ConsoleLogLevel,
  ConsoleSnapshotRequest,
  ExceptionEntry,
} from "./types";
import {
  CONSOLE_BRIDGE_SOURCE_ISOLATED,
  CONSOLE_BRIDGE_SOURCE_MAIN,
  CONSOLE_FLUSH_PUSH,
  CONSOLE_SNAPSHOT_REQUEST,
  CONSOLE_SNAPSHOT_RESPONSE,
} from "./types";

declare global {
  interface Window {
    __ECHLY_CONSOLE_WRAPPED__?: boolean;
  }
}

(function initConsoleCapture() {
  if (window.__ECHLY_CONSOLE_WRAPPED__) return;
  window.__ECHLY_CONSOLE_WRAPPED__ = true;

  const LEVELS: readonly ConsoleLogLevel[] = ["log", "info", "warn", "error", "debug"];
  const INTEGRITY_CHECK_INTERVAL_MS = 2000;
  const buffer = new ConsoleBuffer();

  // Wrapper functions we install. Keyed by level so the integrity check can
  // compare window.console[level] against the one we put there. If something
  // (Sentry/LogRocket/HMR) replaces our wrapper, identity comparison detects
  // it and we re-wrap on top of the new layer.
  const ourWrappers: Partial<Record<ConsoleLogLevel, (...args: unknown[]) => unknown>> = {};
  // Track every wrapper instance we've ever installed, per level. The
  // integrity check uses this to detect when a downstream wrapper (page/SDK)
  // has correctly captured one of our wrappers as its previous — in that case
  // the call chain is intact and we MUST NOT re-wrap, or we'd leapfrog with
  // the page's own integrity check.
  const knownWrappers: Record<ConsoleLogLevel, WeakSet<object>> = {
    log: new WeakSet<object>(),
    info: new WeakSet<object>(),
    warn: new WeakSet<object>(),
    error: new WeakSet<object>(),
    debug: new WeakSet<object>(),
  };

  // The function we call through to for each level. Initialised at install
  // time to whatever was *currently* in window.console (which may itself be
  // a wrapper installed by Sentry et al. — that's the whole point: we want
  // to preserve their behavior). Updated whenever we re-wrap.
  const previousWrap: Partial<Record<ConsoleLogLevel, (...args: unknown[]) => unknown>> = {};

  // ─── True-native console escape hatch ──────────────────────────
  // Multiple extensions installing console wrappers can form a cycle (e.g.
  // Jam re-wraps on top of us after we wrap on top of them; our integrity
  // re-install then makes their wrapper our previousWrap, which calls us
  // again — RangeError on first log). The escape hatch: pull pristine
  // console refs out of a detached iframe at module init. The iframe's
  // console is independent of whatever wrappers other extensions have
  // installed on the host window. We use these natives whenever the
  // recursion guard trips, so the user's log still reaches a real console.
  //
  // If iframe creation fails (CSP, sandbox attrs, etc.) we fall back to
  // copying window.console.* at install time. That fallback is theoretically
  // unsafe if window.console is already wrapped at module-init time AND a
  // cycle forms — but the cycle guard at runtime still prevents stack
  // overflow; it just means in the absolute-worst case we'd call into
  // someone else's wrapper rather than the true native. Logs to the page
  // still happen; we just can't guarantee they bypass other extensions.
  const nativeConsole: Partial<Record<ConsoleLogLevel, (...args: unknown[]) => unknown>> = {};
  let nativeSource: "iframe" | "window-fallback" = "iframe";
  (function captureNatives() {
    try {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.display = "none";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      (document.documentElement || document.body).appendChild(iframe);
      const win = iframe.contentWindow as (Window & { console?: Console }) | null;
      if (win && win.console) {
        const iframeConsole = win.console as Console & Record<string, unknown>;
        for (const level of LEVELS) {
          const fn = iframeConsole[level];
          if (typeof fn === "function") {
            // Bind to the MAIN window's console (NOT the iframe's). Binding to
            // the iframe's console ties our call to a document that becomes
            // inactive after iframe.remove() — some Chrome versions then
            // throw InvalidStateError. Binding to window.console keeps the
            // call valid because window.console outlives the iframe document.
            nativeConsole[level] = (fn as (...a: unknown[]) => unknown).bind(window.console);
          }
        }
      }
      try {
        iframe.remove();
      } catch {
        // ignore — if we can't remove it, leaving a hidden iframe is fine.
      }
    } catch {
      nativeSource = "window-fallback";
    }
    // Fill any holes (or full set if the iframe path failed) with whatever
    // window.console currently holds. Best-effort, may be a wrapper.
    for (const level of LEVELS) {
      if (typeof nativeConsole[level] !== "function") {
        const fn = (window.console as Console & Record<string, unknown>)[level];
        if (typeof fn === "function") {
          nativeConsole[level] = (fn as (...a: unknown[]) => unknown).bind(window.console);
          if (!nativeConsole[level]) nativeSource = "window-fallback";
        }
      }
    }
  })();

  // Recursion guard: tripped whenever we're inside a previousWrap callthrough.
  // If our wrapper is re-entered while this is true (a cycle through another
  // extension's wrapper that ultimately calls back into window.console), the
  // wrapper skips capture AND skips previousWrap, routing straight to the
  // native console. That breaks the cycle without losing the log.
  let isCapturing = false;

  // ─── Safe stringifier ──────────────────────────────────────────
  // Console args can be anything — circular refs, DOM nodes, gigantic
  // objects, prototypes with explosive toJSON. Cap depth, total output,
  // and short-circuit on DOM nodes and Errors.
  const MAX_DEPTH = 4;
  const MAX_OUTPUT_BYTES = 2048;

  function stringifyArg(value: unknown): string {
    const seen = new WeakSet<object>();
    function inner(v: unknown, depth: number): unknown {
      if (depth > MAX_DEPTH) return "<…>";
      if (v === null || v === undefined) return v;
      const t = typeof v;
      if (t === "string" || t === "number" || t === "boolean" || t === "bigint") return v;
      if (t === "function") return `[Function${(v as { name?: string }).name ? ": " + (v as { name?: string }).name : ""}]`;
      if (t === "symbol") return (v as symbol).toString();
      if (v instanceof Error) {
        return {
          name: v.name,
          message: v.message,
          stack: typeof v.stack === "string" ? v.stack.slice(0, 1000) : undefined,
        };
      }
      // DOM node check: avoid serialising entire subtrees. Privacy-aware
      // (Phase R2): an Element inside a customer-marked private region
      // ([data-private]/.fs-block/.fs-mask/…) is serialized as
      // "<hidden element>" rather than leaking its tag — mirroring how the
      // user-actions surface already honors getPrivacyTreatment. Catches the
      // real case: console.log(someElement) / console.log("state", domNode)
      // where the node lives inside a private panel.
      if (typeof Node !== "undefined" && v instanceof Node) {
        return serializeNode(v);
      }
      if (typeof v === "object") {
        if (seen.has(v as object)) return "<circular>";
        seen.add(v as object);
        if (Array.isArray(v)) {
          return v.slice(0, 50).map((item) => inner(item, depth + 1));
        }
        const out: Record<string, unknown> = {};
        const keys = Object.keys(v as object).slice(0, 50);
        for (const k of keys) {
          try {
            out[k] = inner((v as Record<string, unknown>)[k], depth + 1);
          } catch {
            out[k] = "<unserializable>";
          }
        }
        return out;
      }
      return String(v);
    }

    let serialized: string;
    try {
      const reduced = inner(value, 0);
      serialized = typeof reduced === "string" ? reduced : JSON.stringify(reduced);
      if (serialized === undefined) serialized = String(value);
    } catch {
      try {
        serialized = String(value);
      } catch {
        serialized = "<unserializable>";
      }
    }
    if (serialized.length > MAX_OUTPUT_BYTES) {
      serialized = serialized.slice(0, MAX_OUTPUT_BYTES) + "…";
    }
    return serialized;
  }

  // ─── Circuit breaker ───────────────────────────────────────────
  // Sliding 1-second counter, plus second-by-second tracking of how long
  // we've been hot or cool. Pause buffer pushes (but always call through
  // to previousWrap — never break the page's logging) while active.
  const LOG_RATE_THRESHOLD = 100;
  const HOT_SECONDS_TO_TRIP = 5;
  const COOL_SECONDS_TO_RESET = 10;
  let logsThisSecond = 0;
  let hotSeconds = 0;
  let coolSeconds = 0;
  let circuitBreakerActive = false;

  setInterval(() => {
    if (logsThisSecond > LOG_RATE_THRESHOLD) {
      hotSeconds += 1;
      coolSeconds = 0;
      if (!circuitBreakerActive && hotSeconds >= HOT_SECONDS_TO_TRIP) {
        circuitBreakerActive = true;
        buffer.addLog({
          timestamp: Date.now(),
          level: "warn",
          message:
            "[Annote] Console capture paused — log rate exceeded threshold (100/sec). Capture will resume after 10 seconds of normal traffic.",
          source: safeLocationHref(),
        });
      }
    } else {
      hotSeconds = 0;
      if (circuitBreakerActive) {
        coolSeconds += 1;
        if (coolSeconds >= COOL_SECONDS_TO_RESET) {
          circuitBreakerActive = false;
          coolSeconds = 0;
          buffer.addLog({
            timestamp: Date.now(),
            level: "info",
            message: "[Annote] Console capture resumed.",
            source: safeLocationHref(),
          });
        }
      }
    }
    logsThisSecond = 0;
  }, 1000);

  function safeLocationHref(): string | undefined {
    try {
      return window.location.href;
    } catch {
      return undefined;
    }
  }

  // ─── Capture pipeline ──────────────────────────────────────────
  // Stringification + redaction together are the dominant per-log cost. On
  // logging-heavy frameworks running below the 100/sec circuit-breaker
  // threshold (e.g. 50/sec sustained for a 30-min session) the cumulative
  // main-thread cost is noticeable. Defer that work to the next microtask
  // so the page's console call returns before we serialize.
  //
  // Tradeoff: if the page reloads/navigates between the synchronous capture
  // and the microtask running, the entry is lost. Acceptable for debug logs
  // — exceptions still capture synchronously below.
  function captureLevel(level: ConsoleLogLevel, args: unknown[]): void {
    logsThisSecond += 1;
    if (circuitBreakerActive) return; // breaker handles its own state msgs

    // Snapshot the args reference + metadata synchronously. The args array
    // itself is held; if the caller mutates it before our microtask runs the
    // stringifier will see the mutated state — acceptable since well-behaved
    // code does not mutate args after calling console.*.
    const timestamp = Date.now();
    const source = safeLocationHref();
    const capturedArgs = args;
    queueMicrotask(() => {
      let stringifiedArgs: string[];
      try {
        stringifiedArgs = capturedArgs.map(stringifyArg);
      } catch {
        return; // never throw from inside a console wrapper
      }
      const joined = stringifiedArgs.join(" ");
      if (isDenylisted(joined)) return;

      let redactedMessage: string;
      let redactedArgs: string[];
      try {
        redactedMessage = redact(joined);
        redactedArgs = stringifiedArgs.map(redact);
      } catch {
        return;
      }

      const entry: ConsoleLogEntry = {
        timestamp,
        level,
        message: redactedMessage,
        args: redactedArgs,
        source,
      };
      try {
        buffer.addLog(entry);
      } catch {
        // swallow — don't let buffer errors break page logging
      }
    });
  }

  // ─── Wrapper install / re-install ───────────────────────────────
  function installWrappers(): void {
    for (const level of LEVELS) {
      // CRITICAL: capture window.console[level] as currently observed, not
      // the native original — so a Sentry wrap installed before us is the
      // function we call through to. On re-install (integrity check) this
      // picks up whatever outer wrap has been layered on top of us.
      const current = (window.console as Console & Record<string, unknown>)[level] as
        | ((...a: unknown[]) => unknown)
        | undefined;
      if (typeof current === "function") {
        // Assign-time cycle check: if the slot currently holds one of OUR
        // wrappers (any previous installation), calling it from a new
        // wrapper would self-loop. Route to native instead.
        if (knownWrappers[level].has(current as unknown as object)) {
          const native = nativeConsole[level];
          if (typeof native === "function") {
            previousWrap[level] = native;
          }
          // If no native available either, leave previousWrap as-is from a
          // prior install; the runtime guard below still prevents recursion.
        } else {
          previousWrap[level] = current;
        }
      }
      const wrapper = function (this: unknown, ...args: unknown[]): unknown {
        // Runtime cycle break: if we're already inside a previousWrap call
        // and another extension's wrapper has looped back through us, do
        // NOT call previousWrap again (that's what produces RangeError).
        // Route straight to the native console so the log still surfaces.
        if (isCapturing) {
          const native = nativeConsole[level];
          if (typeof native === "function") {
            try {
              return native.apply(null, args);
            } catch {
              return undefined;
            }
          }
          return undefined;
        }
        try {
          captureLevel(level, args);
        } catch {
          // never throw from the wrapper
        }
        const prev = previousWrap[level];
        if (typeof prev !== "function") return undefined;
        isCapturing = true;
        try {
          return prev.apply(this, args);
        } catch {
          // If the downstream wrapper throws (rare but possible with bad
          // SDK code), fall back to native so the user's log still surfaces.
          const native = nativeConsole[level];
          if (typeof native === "function") {
            try {
              return native.apply(null, args);
            } catch {
              return undefined;
            }
          }
          return undefined;
        } finally {
          isCapturing = false;
        }
      };
      ourWrappers[level] = wrapper;
      knownWrappers[level].add(wrapper as unknown as object);
      try {
        (window.console as Console & Record<string, unknown>)[level] = wrapper;
      } catch {
        // ignore — some pages freeze console; nothing we can do.
      }
    }
  }

  installWrappers();

  // Integrity check: if anything has overwritten our wrapper (HMR, Sentry
  // re-initializing, etc.), re-install on top of it. CRITICAL: only re-wrap
  // when the current slot is a function we've never seen — if the slot
  // holds a previously-installed wrapper of ours (the page/SDK wrapped on
  // top of us with delegation intact), re-wrapping would leapfrog with
  // their integrity check and create infinite nesting. Bumped to 2000ms
  // (from 250ms) because late-init wrappers install once at page load,
  // not continuously.
  setInterval(() => {
    let needsReinstall = false;
    for (const level of LEVELS) {
      const current = (window.console as Console & Record<string, unknown>)[level] as unknown;
      if (current === ourWrappers[level]) continue; // unchanged
      if (typeof current === "function" && knownWrappers[level].has(current as unknown as object)) {
        // One of OUR previous wrappers is on top → page wrapped on top of us
        // and correctly delegates. Leave alone.
        continue;
      }
      needsReinstall = true;
      break;
    }
    if (needsReinstall) installWrappers();
  }, INTEGRITY_CHECK_INTERVAL_MS);

  // ─── Exception listeners ───────────────────────────────────────
  //
  // We capture uncaught errors via BOTH addEventListener("error") and
  // window.onerror. Some errors surface via only one path: a few SDKs and
  // older code set window.onerror directly (which addEventListener observers
  // still see), but there are also cases where a page's own window.onerror is
  // assigned in a way that, combined with our wrapping order, makes the
  // assignment path the reliable one. Setting both maximizes coverage.
  //
  // Dedup: a single uncaught error fires the "error" event AND window.onerror.
  // To avoid recording it twice we key on message|source|line|column and skip
  // a duplicate seen within ERROR_DEDUP_WINDOW_MS. The key is computed from
  // the REDACTED message (redaction is deterministic, so identical raw errors
  // collide as intended). addEventListener is the primary recorder because it
  // fires first and carries the richest data (event.error.stack); window.
  // onerror records only errors the listener didn't already capture, and
  // always chains to any pre-existing page handler regardless.
  const ERROR_DEDUP_WINDOW_MS = 1000;
  let lastErrorKey: string | null = null;
  let lastErrorAt = 0;

  // Returns true if this error was just recorded by the sibling path (within
  // the dedup window) and should be skipped. Otherwise stamps it as seen and
  // returns false. Never throws.
  function isDuplicateError(key: string): boolean {
    try {
      const now = Date.now();
      if (lastErrorKey === key && now - lastErrorAt < ERROR_DEDUP_WINDOW_MS) {
        return true;
      }
      lastErrorKey = key;
      lastErrorAt = now;
      return false;
    } catch {
      return false;
    }
  }

  // Build + record an exception entry from already-redacted fields, deduped
  // against the sibling path. Returns nothing; never throws.
  function recordError(
    message: string,
    stack: string | null,
    source: string | null,
    line: number | null,
    column: number | null,
  ): void {
    try {
      // Drop extension-originated exceptions before they reach the buffer. The
      // reliable signal is the SOURCE/STACK (a chrome-extension:// script URL),
      // NOT the message — an extension error's message is often just "Failed to
      // fetch" with no marker, while every stack frame is chrome-extension://.
      // This is the gap that fed the AI a bogus "a chrome-extension script"
      // root cause. We also check the message for the rare case where the URL
      // is embedded there. Targets the chrome-extension:// SCHEME only, so a
      // same-origin page error on annote.ai itself is never filtered.
      if (isExtensionOrigin(stack) || isExtensionOrigin(source) || isExtensionOrigin(message)) {
        return;
      }
      const key = `${message}|${source ?? ""}|${line ?? ""}|${column ?? ""}`;
      if (isDuplicateError(key)) return;
      const entry: ExceptionEntry = {
        timestamp: Date.now(),
        message,
        stack,
        source,
        line,
        column,
        type: "error",
      };
      buffer.addException(entry);
    } catch {
      // swallow — never let exception capture break the page.
    }
  }

  window.addEventListener("error", (event) => {
    try {
      const message = redact(event.message || "");
      const stack =
        event.error && typeof event.error.stack === "string" ? redact(event.error.stack) : null;
      const source = event.filename ? redact(event.filename) : null;
      const line = typeof event.lineno === "number" ? event.lineno : null;
      const column = typeof event.colno === "number" ? event.colno : null;
      recordError(message, stack, source, line, column);
    } catch {
      // swallow
    }
  });

  // window.onerror — set in addition to the listener, chaining to whatever the
  // page (or an SDK) already installed. CRITICAL discipline (matches the
  // console/history wrappers): record in try/catch, never throw, and ALWAYS
  // call the previous handler so the page's own error reporting is preserved.
  // We return the previous handler's return value (a truthy return suppresses
  // the browser's default "Uncaught" logging — we must not change that
  // decision the page made). If there was no previous handler we return false
  // so default browser behavior is unchanged.
  try {
    const previousOnError = typeof window.onerror === "function" ? window.onerror : null;
    window.onerror = function (
      this: unknown,
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error,
    ): boolean {
      try {
        const msgStr = typeof message === "string" ? message : "";
        const redMessage = redact(msgStr || "");
        const stack = error && typeof error.stack === "string" ? redact(error.stack) : null;
        const redSource = source ? redact(source) : null;
        const line = typeof lineno === "number" ? lineno : null;
        const column = typeof colno === "number" ? colno : null;
        // Deduped against the addEventListener("error") path — for a normal
        // uncaught error that fires both, only the first records.
        recordError(redMessage, stack, redSource, line, column);
      } catch {
        // swallow — never break the page's error handling.
      }
      if (previousOnError) {
        try {
          return (
            (previousOnError as (...a: unknown[]) => unknown).apply(this, [
              message,
              source,
              lineno,
              colno,
              error,
            ]) || false
          ) as boolean;
        } catch {
          // The page's handler threw; don't propagate. Fall through to the
          // default (return false → browser still logs the error).
          return false;
        }
      }
      return false;
    };
  } catch {
    // Some pages freeze window.onerror or define it non-writable. Nothing we
    // can do; the addEventListener("error") path still captures.
  }

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event.reason as unknown;
      let message = "";
      let stack: string | null = null;
      if (reason instanceof Error) {
        message = reason.message;
        stack = typeof reason.stack === "string" ? reason.stack : null;
      } else if (typeof reason === "string") {
        message = reason;
      } else {
        try {
          message = JSON.stringify(reason);
        } catch {
          message = String(reason);
        }
      }
      // Drop extension-originated rejections (e.g. our widget's own
      // chrome-extension:// "Failed to fetch") before buffering — the stack
      // frames carry the chrome-extension:// origin even when the message does
      // not. Mirrors recordError's guard for the error/onerror paths. SCHEME
      // only — never filters a same-origin page rejection on annote.ai.
      if (isExtensionOrigin(stack) || isExtensionOrigin(message)) return;
      const entry: ExceptionEntry = {
        timestamp: Date.now(),
        message: redact(message || ""),
        stack: stack ? redact(stack) : null,
        source: null,
        line: null,
        column: null,
        type: "unhandledrejection",
      };
      buffer.addException(entry);
    } catch {
      // swallow
    }
  });

  // ─── postMessage bridge ────────────────────────────────────────
  //
  // KNOWN LIMITATION (deferred to post-Phase-5): when the Jam extension is
  // also installed and active on the same page, its console_recorder.js
  // wraps console on a similar 250ms cadence. With our wrapper installed
  // and the integrity check re-installing on top of any outer wrap, the
  // two wrappers can form a recursion cycle that the runtime guard
  // (isCapturing) prevents from crashing but cannot fully untangle.
  // Result: capture still works, but the same user log may be observed by
  // Jam twice (once at top-level, once via our previousWrap callthrough).
  //
  // The structural fix is to migrate this bridge from window.postMessage
  // to a CustomEvent dispatched on a private DOM node — that channel is
  // unique to us, and we'd no longer need to participate in the console
  // wrapper chain at all for the snapshot transport. Tracked separately;
  // not blocking for v1 since the Jam scenario is rare and the runtime
  // guard prevents user-visible breakage.
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    // Origin validation: same-window posts from the page have origin
    // === window.origin; some legitimate same-window posts arrive with an
    // empty origin (transitional document state). Reject anything else —
    // this defeats targeted snapshot exfiltration where a foreign frame
    // forges the structure tag.
    if (event.origin !== "" && event.origin !== window.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const typed = data as { type?: unknown };
    if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_")) return;
    const msg = data as ConsoleSnapshotRequest;
    if (
      msg.source === CONSOLE_BRIDGE_SOURCE_ISOLATED &&
      msg.type === CONSOLE_SNAPSHOT_REQUEST &&
      typeof msg.requestId === "string"
    ) {
      try {
        window.postMessage(
          {
            source: CONSOLE_BRIDGE_SOURCE_MAIN,
            type: CONSOLE_SNAPSHOT_RESPONSE,
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

  function flushPush(): void {
    try {
      window.postMessage(
        {
          source: CONSOLE_BRIDGE_SOURCE_MAIN,
          type: CONSOLE_FLUSH_PUSH,
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
