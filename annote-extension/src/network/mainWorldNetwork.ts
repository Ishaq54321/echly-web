/**
 * MAIN-world network capture script.
 *
 * Runs in the page's main JavaScript context (manifest content_script with
 * `world: "MAIN"`, Chrome 111+). Wraps fetch + XMLHttpRequest so we can observe
 * every request the page makes — content scripts in the isolated world cannot
 * see these calls.
 *
 * Mirrors the install / integrity / native-escape-hatch pattern used by
 * `../console/mainWorld.ts`. Kept as a separate bundle so a bug in one wrapper
 * cannot kill the other and so the two surfaces can be reasoned about
 * independently.
 *
 * Cannot import the cross-realm logger and cannot use chrome.runtime — this
 * script runs in the page's own JS context.
 */

import { NetworkBuffer } from "./buffer";
import { isNetworkDenylisted } from "./denylist";
import { redactBody, redactHeaders, redactUrl } from "./redactNetwork";
import type {
  NetworkRequestEntry,
  NetworkSnapshotRequest,
} from "./types";
import {
  NETWORK_BRIDGE_SOURCE_ISOLATED,
  NETWORK_BRIDGE_SOURCE_MAIN,
  NETWORK_FLUSH_PUSH,
  NETWORK_SNAPSHOT_REQUEST,
  NETWORK_SNAPSHOT_RESPONSE,
} from "./types";

declare global {
  interface Window {
    __ECHLY_NETWORK_WRAPPED__?: boolean;
  }
}

(function initNetworkCapture() {
  if (window.__ECHLY_NETWORK_WRAPPED__) return;
  window.__ECHLY_NETWORK_WRAPPED__ = true;

  const buffer = new NetworkBuffer();

  // ─── Body & response config ────────────────────────────────────
  const MAX_BODY_BYTES = 50 * 1024; // 50 KB
  const RESPONSE_READ_TIMEOUT_MS = 2000;
  const INTEGRITY_CHECK_INTERVAL_MS = 2000;
  const BINARY_CONTENT_TYPES = [
    "image/",
    "video/",
    "audio/",
    "application/octet-stream",
    "application/pdf",
    "application/zip",
    "font/",
  ];

  // Streaming content types must never be cloned + read. response.clone() on a
  // never-completing stream creates a tee buffer that Chrome keeps draining
  // into for the lifetime of the stream — even after our .text() promise has
  // timed out and been abandoned. On chat apps (Claude.ai, ChatGPT) and SSE
  // log endpoints (Vercel deployment logs) this caused multi-hundred-MB
  // tab memory growth and stream-stall behavior.
  const STREAMING_CONTENT_TYPES = new Set<string>([
    "text/event-stream",
    "application/x-ndjson",
    "multipart/x-mixed-replace",
    "application/grpc",
    "application/grpc-web",
    "application/grpc-web-text",
    "application/grpc-web+proto",
  ]);

  function isStreamingContentType(ct: string | null): boolean {
    if (!ct) return false;
    const lower = ct.toLowerCase().split(";")[0].trim();
    if (STREAMING_CONTENT_TYPES.has(lower)) return true;
    // RFC 7464 JSON sequences (application/<vendor>+json-seq).
    if (lower.startsWith("application/") && lower.endsWith("+json-seq")) return true;
    return false;
  }

  function isBinaryContentType(ct: string | null): boolean {
    if (!ct) return false;
    const lower = ct.toLowerCase();
    for (const prefix of BINARY_CONTENT_TYPES) {
      if (lower.startsWith(prefix)) return true;
    }
    return false;
  }

  function byteLengthOf(s: string): number {
    try {
      return new Blob([s]).size;
    } catch {
      return s.length;
    }
  }

  function truncateBody(s: string): { body: string; originalSize: number; truncated: boolean } {
    const originalSize = byteLengthOf(s);
    if (originalSize <= MAX_BODY_BYTES) {
      return { body: s, originalSize, truncated: false };
    }
    // Byte-aware slice. JS strings are UTF-16 so a character-count slice can
    // bisect a multi-byte sequence; we accept the rough byte cut here (the
    // worst case is one trailing replacement-char glyph in the rendered body).
    return { body: s.slice(0, MAX_BODY_BYTES), originalSize, truncated: true };
  }

  function safeLocationHref(): string | null {
    try {
      return window.location.href;
    } catch {
      return null;
    }
  }

  function newId(): string {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch {
      // fall through
    }
    return "n-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
  }

  // ─── True-native fetch / XHR escape hatch ──────────────────────
  // Other extensions (Jam, LogRocket, Datadog, Sentry) may have already
  // wrapped window.fetch and XMLHttpRequest by the time this script runs.
  // Pull pristine refs out of a detached iframe so the recursion guard has
  // somewhere safe to fall back to. CRITICAL: bind the iframe's fetch to the
  // MAIN window — binding to the iframe window ties the call to a document
  // that becomes inactive after iframe.remove(), causing InvalidStateError on
  // some Chrome versions when the recursion guard later invokes nativeFetch.
  let nativeFetch: ((...args: unknown[]) => Promise<Response>) | null = null;
  let NativeXMLHttpRequest: typeof XMLHttpRequest | null = null;
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
      const win = iframe.contentWindow as (Window & typeof globalThis) | null;
      if (win) {
        if (typeof win.fetch === "function") {
          // Bind to the MAIN window (NOT iframe window). The iframe's fetch
          // function value is independent of the iframe document lifetime
          // once bound to a still-active realm.
          nativeFetch = (win.fetch as (...a: unknown[]) => Promise<Response>).bind(window);
        }
        if (typeof win.XMLHttpRequest === "function") {
          // Constructors don't bind; just hold the reference. Cross-realm
          // XHR construction is supported in Chrome.
          NativeXMLHttpRequest = win.XMLHttpRequest;
        }
      }
      try {
        iframe.remove();
      } catch {
        // ignore — hidden iframe is fine if we can't remove it.
      }
    } catch {
      nativeSource = "window-fallback";
    }
    if (!nativeFetch && typeof window.fetch === "function") {
      nativeFetch = window.fetch.bind(window) as (...a: unknown[]) => Promise<Response>;
      nativeSource = "window-fallback";
    }
    if (!NativeXMLHttpRequest && typeof window.XMLHttpRequest === "function") {
      NativeXMLHttpRequest = window.XMLHttpRequest;
      nativeSource = "window-fallback";
    }
  })();
  void nativeSource; // currently informational; reserved for future telemetry

  // Defensive native-fetch invocation. On some Chrome versions, an iframe-
  // captured fetch may throw InvalidStateError after the iframe is removed
  // if the realm becomes invalid. Fall back to window.fetch — that may
  // recurse into our wrapper, but the recursion guard (isCapturing) will
  // route the second call to previousFetch instead of looping.
  function callNativeFetch(thisArg: unknown, args: unknown[]): Promise<Response> {
    if (!nativeFetch) {
      return (window.fetch as (...a: unknown[]) => Promise<Response>).apply(thisArg, args);
    }
    try {
      return (nativeFetch as (...a: unknown[]) => Promise<Response>).apply(thisArg, args);
    } catch (e) {
      const name = (e as { name?: string } | null)?.name;
      const msg = (e as { message?: string } | null)?.message ?? "";
      if (name === "InvalidStateError" || msg.includes("inactive")) {
        return (window.fetch as (...a: unknown[]) => Promise<Response>).apply(thisArg, args);
      }
      return Promise.reject(e);
    }
  }

  // Module-level recursion guard. If a downstream wrapper somehow calls back
  // into our wrapper while we're already mid-call, route around capture to
  // prevent infinite recursion / stack overflow.
  let isCapturing = false;

  // ─── Circuit breaker ───────────────────────────────────────────
  const REQUEST_RATE_THRESHOLD = 50;
  const HOT_SECONDS_TO_TRIP = 3;
  const COOL_SECONDS_TO_RESET = 10;
  let requestsThisSecond = 0;
  let hotSeconds = 0;
  let coolSeconds = 0;
  let circuitBreakerActive = false;

  setInterval(() => {
    if (requestsThisSecond > REQUEST_RATE_THRESHOLD) {
      hotSeconds += 1;
      coolSeconds = 0;
      if (!circuitBreakerActive && hotSeconds >= HOT_SECONDS_TO_TRIP) {
        circuitBreakerActive = true;
        try {
          buffer.addRequest(syntheticEntry(
            "[Annote] Network capture paused — request rate exceeded threshold (50/sec). Capture will resume after normal traffic.",
          ));
        } catch {
          // swallow
        }
      }
    } else {
      hotSeconds = 0;
      if (circuitBreakerActive) {
        coolSeconds += 1;
        if (coolSeconds >= COOL_SECONDS_TO_RESET) {
          circuitBreakerActive = false;
          coolSeconds = 0;
          try {
            buffer.addRequest(syntheticEntry("[Annote] Network capture resumed."));
          } catch {
            // swallow
          }
        }
      }
    }
    requestsThisSecond = 0;
  }, 1000);

  function syntheticEntry(url: string): NetworkRequestEntry {
    return {
      id: newId(),
      timestamp: Date.now(),
      url,
      method: "GET",
      status: null,
      statusText: null,
      durationMs: null,
      source: "fetch",
      requestHeaders: {},
      responseHeaders: {},
      requestBody: null,
      requestBodyOriginalSize: null,
      requestBodyTruncated: false,
      responseBody: null,
      responseBodyOriginalSize: null,
      responseBodyTruncated: false,
      responseContentType: null,
      errored: false,
      errorMessage: null,
      initiatorPage: safeLocationHref(),
    };
  }

  // ─── Body serialization helpers ────────────────────────────────
  function serializeRequestBody(
    body: BodyInit | null | undefined,
  ): { body: string | null; originalSize: number | null; truncated: boolean } {
    if (body === null || body === undefined) {
      return { body: null, originalSize: null, truncated: false };
    }
    try {
      if (typeof body === "string") {
        return truncateBody(body);
      }
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        const parts: string[] = [];
        try {
          body.forEach((value, key) => {
            if (typeof value === "string") {
              parts.push(`${key}=${value}`);
            } else if (typeof Blob !== "undefined" && value instanceof Blob) {
              const name = (value as File).name ? `:${(value as File).name}` : "";
              parts.push(`${key}=<file${name} ${value.size} bytes>`);
            } else {
              parts.push(`${key}=<unknown>`);
            }
          });
        } catch {
          // swallow — FormData iteration may throw on some shims
        }
        const serialized = `<FormData: ${parts.join(", ")}>`;
        return truncateBody(serialized);
      }
      if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
        return truncateBody(body.toString());
      }
      if (typeof Blob !== "undefined" && body instanceof Blob) {
        return {
          body: `<Blob: type=${body.type || "unknown"}, size=${body.size} bytes>`,
          originalSize: body.size,
          truncated: false,
        };
      }
      if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
        return {
          body: `<ArrayBuffer: ${body.byteLength} bytes>`,
          originalSize: body.byteLength,
          truncated: false,
        };
      }
      if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
        return { body: "<ReadableStream>", originalSize: null, truncated: false };
      }
      // ArrayBufferView (Uint8Array, etc.)
      if (ArrayBuffer.isView(body)) {
        const view = body as ArrayBufferView;
        return {
          body: `<ArrayBufferView: ${view.byteLength} bytes>`,
          originalSize: view.byteLength,
          truncated: false,
        };
      }
    } catch {
      // fall through
    }
    return { body: "<unknown body>", originalSize: null, truncated: false };
  }

  function headersToRecord(h: Headers | Record<string, string> | string[][] | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!h) return out;
    try {
      if (typeof Headers !== "undefined" && h instanceof Headers) {
        h.forEach((value, name) => {
          out[name] = value;
        });
        return out;
      }
      if (Array.isArray(h)) {
        for (const pair of h) {
          if (Array.isArray(pair) && pair.length === 2) {
            out[String(pair[0])] = String(pair[1]);
          }
        }
        return out;
      }
      if (typeof h === "object") {
        for (const name in h) {
          if (Object.prototype.hasOwnProperty.call(h, name)) {
            const value = (h as Record<string, unknown>)[name];
            out[name] = typeof value === "string" ? value : String(value);
          }
        }
      }
    } catch {
      // swallow
    }
    return out;
  }

  function parseXhrResponseHeaders(raw: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!raw) return out;
    try {
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const idx = line.indexOf(":");
        if (idx <= 0) continue;
        const name = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (name) out[name] = value;
      }
    } catch {
      // swallow
    }
    return out;
  }

  // Cancel the cloned response's underlying stream. Must be called whenever we
  // abandon reading the body (timeout, error). Without this, Chrome's tee
  // implementation keeps buffering chunks for our reader for the lifetime of
  // the page's reader — unbounded memory growth on long streams.
  function cancelResponseBody(response: Response): void {
    try {
      const body = response.body;
      if (body && typeof body.cancel === "function") {
        const cancelResult = body.cancel();
        // Avoid an UnhandledPromiseRejection if cancel rejects (locked stream).
        if (cancelResult && typeof (cancelResult as Promise<void>).catch === "function") {
          (cancelResult as Promise<void>).catch(() => {
            // swallow — cancel can reject if the stream is already locked
          });
        }
      }
    } catch {
      // swallow — body access can throw on opaque/already-cancelled responses
    }
  }

  // Read response body with a hard timeout — some streams never resolve.
  function readResponseTextWithTimeout(response: Response): Promise<string | null> {
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cancelResponseBody(response);
        resolve(null);
      }, RESPONSE_READ_TIMEOUT_MS);
      try {
        response
          .text()
          .then((text) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(text);
          })
          .catch(() => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            cancelResponseBody(response);
            resolve(null);
          });
      } catch {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cancelResponseBody(response);
        resolve(null);
      }
    });
  }

  // ─── fetch capture pipeline ────────────────────────────────────
  type FetchStartContext = {
    id: string;
    startedAt: number;
  } | null;

  function captureFetchStart(id: string, args: unknown[]): FetchStartContext {
    const startedAt = Date.now();
    requestsThisSecond += 1;
    if (circuitBreakerActive) return null;

    let url = "";
    let method = "GET";
    let requestHeaders: Record<string, string> = {};
    let rawBody: BodyInit | null | undefined = undefined;

    try {
      const first = args[0];
      const second = args[1] as RequestInit | undefined;

      if (typeof first === "string") {
        url = first;
      } else if (typeof URL !== "undefined" && first instanceof URL) {
        url = first.toString();
      } else if (typeof Request !== "undefined" && first instanceof Request) {
        url = first.url;
        method = (first.method || "GET").toUpperCase();
        requestHeaders = headersToRecord(first.headers);
        // Request body is a stream we generally cannot peek without consuming.
        // We'll let `second` override below if RequestInit provided a body.
      } else if (first && typeof first === "object" && "url" in first) {
        url = String((first as { url: unknown }).url);
      }

      if (second) {
        if (typeof second.method === "string") method = second.method.toUpperCase();
        if (second.headers) requestHeaders = headersToRecord(second.headers as Headers);
        if (second.body !== undefined) rawBody = second.body as BodyInit | null;
      }
    } catch {
      // swallow — partial info still ok
    }

    if (!url) return null;
    if (isNetworkDenylisted(url)) return null;

    let redactedUrl = url;
    let redactedHeaders: Record<string, string> = {};
    let bodySerialized = { body: null as string | null, originalSize: null as number | null, truncated: false };
    try {
      redactedUrl = redactUrl(url);
      redactedHeaders = redactHeaders(requestHeaders);
      bodySerialized = serializeRequestBody(rawBody);
      if (bodySerialized.body !== null) {
        bodySerialized.body = redactBody(bodySerialized.body, null);
      }
    } catch {
      // swallow — keep best-effort fields
    }

    const entry: NetworkRequestEntry = {
      id,
      timestamp: startedAt,
      url: redactedUrl,
      method,
      status: null,
      statusText: null,
      durationMs: null,
      source: "fetch",
      requestHeaders: redactedHeaders,
      responseHeaders: {},
      requestBody: bodySerialized.body,
      requestBodyOriginalSize: bodySerialized.originalSize,
      requestBodyTruncated: bodySerialized.truncated,
      responseBody: null,
      responseBodyOriginalSize: null,
      responseBodyTruncated: false,
      responseContentType: null,
      errored: false,
      errorMessage: null,
      initiatorPage: safeLocationHref(),
    };
    try {
      buffer.addRequest(entry);
    } catch {
      return null;
    }
    return { id, startedAt };
  }

  async function captureFetchEnd(
    ctx: NonNullable<FetchStartContext>,
    response: Response,
  ): Promise<void> {
    const durationMs = Date.now() - ctx.startedAt;
    let responseHeaders: Record<string, string> = {};
    let responseContentType: string | null = null;
    let body: string | null = null;
    let originalSize: number | null = null;
    let truncated = false;

    try {
      responseHeaders = headersToRecord(response.headers);
      responseContentType = response.headers.get("Content-Type");
    } catch {
      // swallow
    }

    try {
      if (isStreamingContentType(responseContentType)) {
        // Never clone a streaming response. response.clone() on SSE/ndjson/
        // grpc-web creates a tee buffer that grows unbounded for the lifetime
        // of the stream. Mark as captured with a sentinel body and skip read.
        body = "<streaming response>";
        originalSize = null;
        truncated = false;
      } else if (isBinaryContentType(responseContentType)) {
        const sizeHeader = response.headers.get("Content-Length");
        const size = sizeHeader ? parseInt(sizeHeader, 10) : NaN;
        body = `<binary content, ${Number.isFinite(size) ? size + " bytes" : "size unknown"}>`;
        originalSize = Number.isFinite(size) ? size : null;
      } else {
        // CRITICAL: clone before reading so the page never sees a consumed body.
        let cloned: Response | null = null;
        try {
          cloned = response.clone();
        } catch {
          // Some responses (already consumed, opaque) can't be cloned. Skip.
        }
        if (cloned) {
          const text = await readResponseTextWithTimeout(cloned);
          if (text === null) {
            body = "<response body read timeout>";
          } else {
            const tr = truncateBody(text);
            body = tr.body;
            originalSize = tr.originalSize;
            truncated = tr.truncated;
          }
        }
      }
    } catch {
      // swallow
    }

    let redactedResponseHeaders: Record<string, string> = responseHeaders;
    let redactedBody = body;
    try {
      redactedResponseHeaders = redactHeaders(responseHeaders);
      if (redactedBody !== null) {
        redactedBody = redactBody(redactedBody, responseContentType);
      }
    } catch {
      // swallow
    }

    try {
      buffer.updateRequest(ctx.id, {
        status: response.status,
        statusText: response.statusText || null,
        durationMs,
        responseHeaders: redactedResponseHeaders,
        responseBody: redactedBody,
        responseBodyOriginalSize: originalSize,
        responseBodyTruncated: truncated,
        responseContentType,
      });
    } catch {
      // swallow
    }
  }

  function captureFetchError(ctx: NonNullable<FetchStartContext>, error: unknown): void {
    const durationMs = Date.now() - ctx.startedAt;
    let message = "";
    try {
      if (error instanceof Error) message = error.message;
      else if (typeof error === "string") message = error;
      else message = String(error);
    } catch {
      message = "<unknown error>";
    }
    try {
      buffer.updateRequest(ctx.id, {
        errored: true,
        errorMessage: message || null,
        durationMs,
      });
    } catch {
      // swallow
    }
  }

  // ─── fetch wrapper install ─────────────────────────────────────
  let previousFetch: typeof window.fetch = window.fetch;
  let ourFetchWrapper: typeof window.fetch | null = null;
  // Track every wrapper instance we've ever installed. The integrity check
  // uses this to detect when an outer wrapper (page/SDK) has correctly
  // captured one of our wrappers as its previous — in that case the call
  // chain is intact and we must NOT re-wrap, or we'd create infinite nesting
  // every interval tick as the page and us leapfrog each other.
  const knownFetchWrappers = new WeakSet<object>();

  function makeFetchWrapper(): typeof window.fetch {
    const wrapper = function (this: unknown, ...args: unknown[]): Promise<Response> {
      // Recursion guard: if a downstream wrapper calls back into ours, bypass
      // capture entirely and call through to the captured native (which is
      // bound to the main window — see callNativeFetch). previousFetch may
      // itself loop back to us if the page has wrapped on top; use native.
      if (isCapturing) {
        try {
          return callNativeFetch(this, args);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      const id = newId();
      let ctx: FetchStartContext = null;
      try {
        ctx = captureFetchStart(id, args);
      } catch {
        ctx = null;
      }
      isCapturing = true;
      let result: Promise<Response>;
      try {
        result = (previousFetch as (...a: unknown[]) => Promise<Response>).apply(this, args);
      } catch (err) {
        isCapturing = false;
        if (ctx) {
          try {
            captureFetchError(ctx, err);
          } catch {
            // swallow
          }
        }
        throw err;
      }
      isCapturing = false;
      if (!ctx) return result;
      return result.then(
        (response) => {
          // Fire-and-forget: don't make the page wait for our body read.
          try {
            void captureFetchEnd(ctx!, response);
          } catch {
            // swallow
          }
          return response;
        },
        (error) => {
          try {
            captureFetchError(ctx!, error);
          } catch {
            // swallow
          }
          throw error;
        },
      );
    } as typeof window.fetch;
    return wrapper;
  }

  function installFetchWrapper(): void {
    const current = window.fetch;
    // Assign-time cycle check: if the slot currently holds one of our
    // wrappers, calling it from a new wrapper would self-loop. Route to
    // native fetch instead.
    if (typeof current === "function" && knownFetchWrappers.has(current as unknown as object) && nativeFetch) {
      previousFetch = nativeFetch as typeof window.fetch;
    } else if (typeof current === "function") {
      previousFetch = current;
    } else if (nativeFetch) {
      previousFetch = nativeFetch as typeof window.fetch;
    }
    const next = makeFetchWrapper();
    knownFetchWrappers.add(next as unknown as object);
    ourFetchWrapper = next;
    try {
      window.fetch = next;
    } catch {
      // Some pages freeze fetch (rare). Nothing we can do.
    }
  }

  installFetchWrapper();

  // ─── XHR capture pipeline ──────────────────────────────────────
  type XhrState = {
    id: string;
    startedAt: number;
    method: string;
    url: string;
    requestHeaders: Record<string, string>;
    requestBody: { body: string | null; originalSize: number | null; truncated: boolean };
    captured: boolean; // true once we've added to buffer (i.e. not denylisted)
  };

  const xhrState = new WeakMap<XMLHttpRequest, XhrState>();
  // Also track our own per-instance header-collector wrapper so we can read
  // them back at send() time.
  const xhrHeadersCollector = new WeakMap<XMLHttpRequest, Record<string, string>>();

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  let previousOpen: typeof originalOpen = originalOpen;
  let previousSend: typeof originalSend = originalSend;
  let previousSetRequestHeader: typeof originalSetRequestHeader = originalSetRequestHeader;
  let ourOpen: typeof originalOpen | null = null;
  let ourSend: typeof originalSend | null = null;
  let ourSetRequestHeader: typeof originalSetRequestHeader | null = null;
  // Same wrapper-war defense as fetch: track every wrapper instance we've
  // installed so the integrity check can detect when a downstream wrapper
  // correctly delegates to us, and refrain from re-wrapping in that case.
  const knownXhrOpenWrappers = new WeakSet<object>();
  const knownXhrSendWrappers = new WeakSet<object>();
  const knownXhrSetRequestHeaderWrappers = new WeakSet<object>();

  function captureXhrEnd(xhr: XMLHttpRequest, state: XhrState, errored: boolean, errorMessage: string | null): void {
    const durationMs = Date.now() - state.startedAt;
    if (errored) {
      try {
        buffer.updateRequest(state.id, {
          errored: true,
          errorMessage,
          durationMs,
        });
      } catch {
        // swallow
      }
      return;
    }

    let status: number | null = null;
    let statusText: string | null = null;
    let responseHeaders: Record<string, string> = {};
    let responseContentType: string | null = null;
    let bodyText: string | null = null;
    let originalSize: number | null = null;
    let truncated = false;

    try {
      status = xhr.status || null;
      statusText = xhr.statusText || null;
      const raw = xhr.getAllResponseHeaders();
      responseHeaders = parseXhrResponseHeaders(raw);
      responseContentType = xhr.getResponseHeader("Content-Type");
    } catch {
      // swallow
    }

    try {
      if (isBinaryContentType(responseContentType)) {
        let size: number | null = null;
        try {
          const r = xhr.response;
          if (r && typeof (r as Blob).size === "number") size = (r as Blob).size;
          else if (r && typeof (r as ArrayBuffer).byteLength === "number") size = (r as ArrayBuffer).byteLength;
        } catch {
          // swallow
        }
        bodyText = `<binary content, ${size !== null ? size + " bytes" : "size unknown"}>`;
        originalSize = size;
      } else {
        let text: string | null = null;
        try {
          // responseType "" or "text" → responseText is safe; otherwise try .response
          const type = xhr.responseType;
          if (type === "" || type === "text") {
            text = xhr.responseText;
          } else {
            const r = xhr.response;
            if (typeof r === "string") text = r;
            else if (r === null || r === undefined) text = null;
            else {
              try {
                text = JSON.stringify(r);
              } catch {
                text = String(r);
              }
            }
          }
        } catch {
          // Accessing responseText with a non-text responseType throws.
          text = null;
        }
        if (text !== null) {
          const tr = truncateBody(text);
          bodyText = tr.body;
          originalSize = tr.originalSize;
          truncated = tr.truncated;
        }
      }
    } catch {
      // swallow
    }

    let redactedResponseHeaders = responseHeaders;
    let redactedBody = bodyText;
    try {
      redactedResponseHeaders = redactHeaders(responseHeaders);
      if (redactedBody !== null) {
        redactedBody = redactBody(redactedBody, responseContentType);
      }
    } catch {
      // swallow
    }

    try {
      buffer.updateRequest(state.id, {
        status,
        statusText,
        durationMs,
        responseHeaders: redactedResponseHeaders,
        responseBody: redactedBody,
        responseBodyOriginalSize: originalSize,
        responseBodyTruncated: truncated,
        responseContentType,
      });
    } catch {
      // swallow
    }
  }

  function makeXhrOpenWrapper(): typeof originalOpen {
    return function (this: XMLHttpRequest, ...args: unknown[]): void {
      // Recursion guard (mirrors the fetch wrapper): if a downstream wrapper
      // calls back into ours while we're already inside a previous* call-
      // through, skip our capture work and pass straight to previous so we
      // can't re-capture or self-loop.
      if (isCapturing) {
        return (previousOpen as (...a: unknown[]) => void).apply(this, args);
      }
      try {
        const method = String(args[0] || "GET").toUpperCase();
        const rawUrl = args[1];
        let url = "";
        if (typeof rawUrl === "string") url = rawUrl;
        else if (typeof URL !== "undefined" && rawUrl instanceof URL) url = rawUrl.toString();
        else if (rawUrl != null) url = String(rawUrl);

        // Reset any prior collector for this xhr instance (xhr can be reopened).
        xhrHeadersCollector.set(this, {});
        if (url) {
          // Tentatively stash; if denylisted we won't add to buffer at send().
          xhrState.set(this, {
            id: newId(),
            startedAt: 0,
            method,
            url,
            requestHeaders: {},
            requestBody: { body: null, originalSize: null, truncated: false },
            captured: false,
          });
        }
      } catch {
        // swallow
      }
      // Call through. Cast args because the prototype signature is overloaded.
      // Set the recursion guard around the call-through only (mirrors fetch).
      isCapturing = true;
      try {
        return (previousOpen as (...a: unknown[]) => void).apply(this, args);
      } finally {
        isCapturing = false;
      }
    } as typeof originalOpen;
  }

  function makeXhrSetRequestHeaderWrapper(): typeof originalSetRequestHeader {
    return function (this: XMLHttpRequest, name: string, value: string): void {
      if (isCapturing) {
        return (previousSetRequestHeader as (...a: unknown[]) => void).apply(this, [name, value]);
      }
      try {
        const collector = xhrHeadersCollector.get(this) || {};
        collector[name] = value;
        xhrHeadersCollector.set(this, collector);
      } catch {
        // swallow
      }
      isCapturing = true;
      try {
        return (previousSetRequestHeader as (...a: unknown[]) => void).apply(this, [name, value]);
      } finally {
        isCapturing = false;
      }
    } as typeof originalSetRequestHeader;
  }

  function makeXhrSendWrapper(): typeof originalSend {
    return function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null): void {
      // Recursion guard (mirrors the fetch wrapper): a re-entrant call while
      // we're inside a previousSend call-through skips capture (including the
      // rate counter) and passes straight to previous.
      if (isCapturing) {
        return (previousSend as (...a: unknown[]) => void).apply(this, [body]);
      }
      const xhr = this;
      const state = xhrState.get(xhr);
      requestsThisSecond += 1;

      if (state) {
        state.startedAt = Date.now();
        state.requestHeaders = xhrHeadersCollector.get(xhr) || {};

        if (!circuitBreakerActive && !isNetworkDenylisted(state.url)) {
          // Serialize body (Document is rare; skip serialization for it).
          let serialized = { body: null as string | null, originalSize: null as number | null, truncated: false };
          try {
            if (body && typeof Document !== "undefined" && body instanceof Document) {
              serialized = { body: "<Document>", originalSize: null, truncated: false };
            } else {
              serialized = serializeRequestBody((body as BodyInit | null | undefined) ?? null);
            }
            if (serialized.body !== null) {
              serialized.body = redactBody(serialized.body, null);
            }
          } catch {
            // swallow
          }
          state.requestBody = serialized;

          let redactedUrl = state.url;
          let redactedHeaders: Record<string, string> = {};
          try {
            redactedUrl = redactUrl(state.url);
            redactedHeaders = redactHeaders(state.requestHeaders);
          } catch {
            // swallow
          }

          const entry: NetworkRequestEntry = {
            id: state.id,
            timestamp: state.startedAt,
            url: redactedUrl,
            method: state.method,
            status: null,
            statusText: null,
            durationMs: null,
            source: "xhr",
            requestHeaders: redactedHeaders,
            responseHeaders: {},
            requestBody: state.requestBody.body,
            requestBodyOriginalSize: state.requestBody.originalSize,
            requestBodyTruncated: state.requestBody.truncated,
            responseBody: null,
            responseBodyOriginalSize: null,
            responseBodyTruncated: false,
            responseContentType: null,
            errored: false,
            errorMessage: null,
            initiatorPage: safeLocationHref(),
          };
          try {
            buffer.addRequest(entry);
            state.captured = true;
          } catch {
            // swallow
          }

          // Single 'loadend' listener replaces the previous 4 (load/error/abort/
          // timeout). loadend fires regardless of how the XHR finished. We use
          // a tiny inline terminal-type tracker so we still know whether the
          // outcome was abort/timeout/error/load — those signals each fire
          // immediately before loadend. Cuts listener registration cost ~75%
          // on XHR-heavy pages.
          let terminalKind: "load" | "error" | "abort" | "timeout" | null = null;
          const tagError = () => {
            if (terminalKind === null) terminalKind = "error";
          };
          const tagAbort = () => {
            terminalKind = "abort";
          };
          const tagTimeout = () => {
            terminalKind = "timeout";
          };
          try {
            // These tag listeners are cheap (one assignment each) and only fire
            // for the abnormal terminations. The loadend listener does the
            // actual capture work.
            xhr.addEventListener("error", tagError);
            xhr.addEventListener("abort", tagAbort);
            xhr.addEventListener("timeout", tagTimeout);
            xhr.addEventListener("loadend", () => {
              if (!state.captured) return;
              try {
                if (terminalKind === "abort") {
                  captureXhrEnd(xhr, state, true, "Aborted");
                } else if (terminalKind === "timeout") {
                  captureXhrEnd(xhr, state, true, "Timeout");
                } else if (terminalKind === "error" || (xhr.readyState === 4 && xhr.status === 0)) {
                  captureXhrEnd(xhr, state, true, "Network error");
                } else {
                  captureXhrEnd(xhr, state, false, null);
                }
              } catch {
                // swallow
              }
            });
          } catch {
            // swallow
          }
        }
      }

      // Set the recursion guard around the call-through only (mirrors fetch).
      isCapturing = true;
      try {
        return (previousSend as (...a: unknown[]) => void).apply(this, [body]);
      } finally {
        isCapturing = false;
      }
    } as typeof originalSend;
  }

  function installXhrWrappers(): void {
    const currentOpen = XMLHttpRequest.prototype.open;
    const currentSend = XMLHttpRequest.prototype.send;
    const currentSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    // Cycle-detection: if the prototype slots currently hold one of our own
    // wrappers, calling through would loop. Substitute the native iframe-
    // extracted prototype methods if available.
    const NativeProto = NativeXMLHttpRequest && NativeXMLHttpRequest.prototype;

    if (typeof currentOpen === "function" && knownXhrOpenWrappers.has(currentOpen as unknown as object)) {
      previousOpen = (NativeProto && NativeProto.open) || originalOpen;
    } else if (typeof currentOpen === "function") {
      previousOpen = currentOpen;
    }

    if (typeof currentSend === "function" && knownXhrSendWrappers.has(currentSend as unknown as object)) {
      previousSend = (NativeProto && NativeProto.send) || originalSend;
    } else if (typeof currentSend === "function") {
      previousSend = currentSend;
    }

    if (
      typeof currentSetRequestHeader === "function" &&
      knownXhrSetRequestHeaderWrappers.has(currentSetRequestHeader as unknown as object)
    ) {
      previousSetRequestHeader = (NativeProto && NativeProto.setRequestHeader) || originalSetRequestHeader;
    } else if (typeof currentSetRequestHeader === "function") {
      previousSetRequestHeader = currentSetRequestHeader;
    }

    const nextOpen = makeXhrOpenWrapper();
    const nextSend = makeXhrSendWrapper();
    const nextSetRequestHeader = makeXhrSetRequestHeaderWrapper();
    knownXhrOpenWrappers.add(nextOpen as unknown as object);
    knownXhrSendWrappers.add(nextSend as unknown as object);
    knownXhrSetRequestHeaderWrappers.add(nextSetRequestHeader as unknown as object);
    ourOpen = nextOpen;
    ourSend = nextSend;
    ourSetRequestHeader = nextSetRequestHeader;

    try {
      XMLHttpRequest.prototype.open = nextOpen;
      XMLHttpRequest.prototype.send = nextSend;
      XMLHttpRequest.prototype.setRequestHeader = nextSetRequestHeader;
    } catch {
      // Some pages freeze prototypes. Nothing we can do.
    }
  }

  installXhrWrappers();

  // ─── Wrapper integrity check ───────────────────────────────────
  // If anything replaces our wrappers entirely (not just wraps on top of us),
  // re-install. CRITICAL: do NOT re-wrap if the current top-of-stack is a
  // function that one of OUR wrappers can be found inside via the WeakSet —
  // that means the page or another SDK correctly wrapped on top of us with
  // delegation intact. Re-wrapping in that case creates a leapfrog war
  // (their integrity check then sees a new outer layer and wraps again, ad
  // infinitum). Also bumped to 2000ms — late-init wrappers (Sentry/LogRocket)
  // typically install once, not continuously.
  function isCurrentFetchOurs(current: unknown): boolean {
    return typeof current === "function" && knownFetchWrappers.has(current as unknown as object);
  }
  function isCurrentXhrOpenOurs(current: unknown): boolean {
    return typeof current === "function" && knownXhrOpenWrappers.has(current as unknown as object);
  }
  function isCurrentXhrSendOurs(current: unknown): boolean {
    return typeof current === "function" && knownXhrSendWrappers.has(current as unknown as object);
  }
  setInterval(() => {
    // Fetch: only re-wrap if the slot is a function we've never seen.
    // Identity-equal to ourFetchWrapper → fine. Function we previously
    // installed (knownFetchWrappers) → page/SDK has us delegated, leave it.
    // Anything else → re-install on top.
    try {
      const currentFetch = window.fetch;
      if (currentFetch !== ourFetchWrapper && !isCurrentFetchOurs(currentFetch)) {
        installFetchWrapper();
      }
    } catch {
      // swallow
    }
    try {
      const currentOpen = XMLHttpRequest.prototype.open;
      const currentSend = XMLHttpRequest.prototype.send;
      if (
        (currentOpen !== ourOpen && !isCurrentXhrOpenOurs(currentOpen)) ||
        (currentSend !== ourSend && !isCurrentXhrSendOurs(currentSend))
      ) {
        installXhrWrappers();
      }
    } catch {
      // swallow
    }
  }, INTEGRITY_CHECK_INTERVAL_MS);

  // ─── postMessage bridge ────────────────────────────────────────
  // Heavy SPAs (Claude.ai Artifacts, ChatGPT plugin sandboxes) post hundreds
  // of cross-iframe messages per session. We bail as fast as possible on the
  // hot path before doing any structure validation, and require same-window +
  // same-origin to defeat targeted snapshot exfiltration from foreign frames.
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.origin !== "" && event.origin !== window.origin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    const typed = data as { type?: unknown };
    if (typeof typed.type !== "string" || !typed.type.startsWith("ECHLY_")) return;
    const msg = data as NetworkSnapshotRequest;
    if (
      msg.source === NETWORK_BRIDGE_SOURCE_ISOLATED &&
      msg.type === NETWORK_SNAPSHOT_REQUEST &&
      typeof msg.requestId === "string"
    ) {
      try {
        window.postMessage(
          {
            source: NETWORK_BRIDGE_SOURCE_MAIN,
            type: NETWORK_SNAPSHOT_RESPONSE,
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
          source: NETWORK_BRIDGE_SOURCE_MAIN,
          type: NETWORK_FLUSH_PUSH,
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
