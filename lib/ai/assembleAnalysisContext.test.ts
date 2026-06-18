/**
 * Unit tests for the AI-analysis context assembler.
 * Run with: node --import tsx --test lib/ai/assembleAnalysisContext.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assembleAnalysisContext,
  type AnalyzableFeedback,
} from "./assembleAnalysisContext";
import type {
  ConsoleLogEntry,
  NetworkRequestEntry,
  UserAction,
} from "@/lib/domain/feedback";

const T0 = 1_700_000_000_000;

function makeAction(over: Partial<UserAction> & { timestamp: number }): UserAction {
  return { id: `a-${over.timestamp}`, type: "click", ...over };
}

function makeRequest(
  over: Partial<NetworkRequestEntry> & { timestamp: number }
): NetworkRequestEntry {
  return {
    id: `r-${over.timestamp}`,
    url: "https://app.example.com/api/data",
    method: "GET",
    status: 200,
    statusText: "OK",
    durationMs: 120,
    source: "fetch",
    requestHeaders: {},
    responseHeaders: {},
    requestBody: null,
    requestBodyOriginalSize: null,
    requestBodyTruncated: false,
    responseBody: null,
    responseBodyOriginalSize: null,
    responseBodyTruncated: false,
    responseContentType: "application/json",
    errored: false,
    errorMessage: null,
    initiatorPage: null,
    ...over,
  };
}

function makeConsoleError(
  over: Partial<ConsoleLogEntry> & { timestamp: number }
): ConsoleLogEntry {
  return { level: "error", message: "Boom", ...over };
}

function baseTicket(over: Partial<AnalyzableFeedback> = {}): AnalyzableFeedback {
  return {
    title: "Checkout total is wrong",
    description: "The total at checkout shows the wrong amount.",
    tags: ["bug", "checkout"],
    pageArea: "Checkout",
    url: "https://app.example.com/checkout",
    userAgent: "Mozilla/5.0 TestAgent",
    viewportWidth: 1280,
    viewportHeight: 800,
    screenWidth: 2560,
    screenHeight: 1440,
    devicePixelRatio: 2,
    clientTimestamp: T0 + 60_000,
    captureWindowStartAt: null,
    consoleLogs: [],
    exceptions: [],
    networkRequests: [],
    userActions: [],
    ...over,
  };
}

// ── No-anchor path ──────────────────────────────────────────────────────────

test("no-anchor ticket: hasAnchors false, but the context is rich (journey + slow summary + metadata)", () => {
  const ticket = baseTicket({
    userActions: [
      makeAction({ timestamp: T0, type: "navigation", url: "https://app.example.com/cart" }),
      makeAction({ timestamp: T0 + 5_000, element: { tag: "button", text: "Checkout" } }),
      makeAction({ timestamp: T0 + 9_000, type: "submit", element: { tag: "form" } }),
    ],
    networkRequests: [
      // Slow-ish but under the SLOW_REQUEST_MS anchor threshold — this stays a
      // genuine no-anchor ticket while still exercising the slow summary.
      makeRequest({ timestamp: T0 + 6_000, durationMs: 1_200, url: "https://app.example.com/api/cart" }),
      makeRequest({ timestamp: T0 + 7_000, durationMs: 150 }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);

  assert.equal(hasAnchors, false);
  assert.match(contextText, /USER JOURNEY/);
  assert.match(contextText, /\[TICKET FILED\]/);
  assert.match(contextText, /SLOWEST REQUESTS/);
  assert.match(contextText, /1200ms/);
  assert.match(contextText, /CAPTURE SIGNALS: No console errors/);
  // Metadata block carries the free context.
  assert.match(contextText, /Title: Checkout total is wrong/);
  assert.match(contextText, /Tags: bug, checkout/);
  assert.match(contextText, /Page area: Checkout/);
  assert.match(contextText, /Viewport: 1280×800/);
  assert.match(contextText, /Screen: 2560×1440 @2x/);
});

test("no-anchor ticket with zero capture: honest empty-journey statement, no slow section", () => {
  const { contextText, hasAnchors } = assembleAnalysisContext(baseTicket());
  assert.equal(hasAnchors, false);
  assert.match(contextText, /\(no user actions were captured\)/);
  assert.doesNotMatch(contextText, /SLOWEST REQUESTS/);
});

test("journey keeps clicks/navigations/submits/inputs and drops focus/blur noise", () => {
  const ticket = baseTicket({
    userActions: [
      makeAction({ timestamp: T0, type: "focus" }),
      makeAction({ timestamp: T0 + 1_000, type: "click", element: { tag: "button", text: "Save" } }),
      makeAction({ timestamp: T0 + 2_000, type: "blur" }),
      makeAction({ timestamp: T0 + 3_000, type: "input", fieldLabel: "email" }),
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /\[ACTION\] click/);
  assert.match(contextText, /\[ACTION\] input/);
  assert.doesNotMatch(contextText, /\[ACTION\] focus/);
  assert.doesNotMatch(contextText, /\[ACTION\] blur/);
});

test("masked actions stay masked in the journey", () => {
  const ticket = baseTicket({
    userActions: [
      makeAction({
        timestamp: T0,
        element: { tag: "input", masked: true, text: "should-not-appear" },
        fieldLabel: "password",
      }),
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /\(masked\)/);
  assert.doesNotMatch(contextText, /should-not-appear/);
  assert.doesNotMatch(contextText, /password/);
});

test("window-start stamp renders the prior-ticket framing on both paths", () => {
  const noAnchor = assembleAnalysisContext(
    baseTicket({ captureWindowStartAt: T0 - 30_000 })
  );
  assert.match(noAnchor.contextText, /begins after a prior ticket/i);

  const fault = assembleAnalysisContext(
    baseTicket({
      captureWindowStartAt: T0 - 30_000,
      consoleLogs: [makeConsoleError({ timestamp: T0 })],
    })
  );
  assert.equal(fault.hasAnchors, true);
  assert.match(fault.contextText, /begins after a prior ticket/i);
});

test("no window-start stamp → no prior-ticket framing", () => {
  const { contextText } = assembleAnalysisContext(baseTicket());
  assert.doesNotMatch(contextText, /prior ticket/i);
});

// ── Fault path ──────────────────────────────────────────────────────────────

test("fault ticket: hasAnchors true, correlated timeline with the trigger action and metadata", () => {
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 2_000, message: "TypeError: x is undefined" })],
    userActions: [
      makeAction({ timestamp: T0 + 1_000, element: { tag: "button", text: "Pay" } }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /CORRELATED TIMELINE/);
  assert.match(contextText, /TypeError: x is undefined/);
  assert.match(contextText, /\[ACTION\] click/); // the trigger survives windowing
  assert.match(contextText, /TICKET METADATA/);
  assert.match(contextText, /Title: Checkout total is wrong/);
});

test("a 500 response makes the ticket a fault ticket", () => {
  const ticket = baseTicket({
    networkRequests: [
      makeRequest({ timestamp: T0, status: 500, statusText: "Internal Server Error" }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /NETWORK FAIL/);
});

// ── Wave 2: slow anchors, correlated bodies, GraphQL, dedup, asymmetric window ──

test("a slow successful request is a weak anchor: performance tickets take the timeline path", () => {
  const ticket = baseTicket({
    userActions: [
      makeAction({ timestamp: T0, element: { tag: "a", text: "Orders" } }),
    ],
    networkRequests: [
      makeRequest({ timestamp: T0 + 500, durationMs: 7_500, url: "https://app.example.com/api/orders" }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /NETWORK SLOW/);
  assert.match(contextText, /7500ms/);
  assert.match(contextText, /\[ACTION\] click/); // the trigger survives windowing
});

test("action-correlated 2xx bodies are included (tight budget); uncorrelated 2xx bodies are not", () => {
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 2_000 })], // the anchor
    userActions: [makeAction({ timestamp: T0 + 500, element: { tag: "button", text: "Save" } })],
    networkRequests: [
      // Started 500ms after the click → correlated; body must appear.
      makeRequest({
        timestamp: T0 + 1_000,
        url: "https://app.example.com/api/cart",
        responseBody: '{"total":75,"expected":50}',
      }),
      // In-window but started BEFORE any action → background fetch; body withheld.
      makeRequest({
        timestamp: T0 + 250,
        url: "https://app.example.com/api/telemetry",
        responseBody: '{"background":"noise-body"}',
      }),
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /"total":75/);
  assert.doesNotMatch(contextText, /noise-body/);
});

test("action-correlated bodies respect the tight SUCCESS budget", () => {
  const bigBody = `{"data":"${"x".repeat(2_000)}"}`;
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 2_000 })],
    userActions: [makeAction({ timestamp: T0 + 500 })],
    networkRequests: [
      makeRequest({ timestamp: T0 + 1_000, responseBody: bigBody }),
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  const bodyLine = contextText.split("\n").find((l) => l.includes('response body: {"data"'));
  assert.ok(bodyLine, "correlated body line missing");
  // 300-char budget + the line prefix — far below the 2KB original.
  assert.ok(bodyLine.length < 400, `body not truncated to budget: ${bodyLine.length} chars`);
});

test("GraphQL errors-in-200 are treated as a network fault (parsed body)", () => {
  const ticket = baseTicket({
    networkRequests: [
      makeRequest({
        timestamp: T0,
        method: "POST",
        url: "https://app.example.com/graphql",
        responseBody: '{"data":null,"errors":[{"message":"Cannot query field x"}]}',
      }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /NETWORK FAIL/);
  assert.match(contextText, /GraphQL errors in 2xx body/);
  assert.match(contextText, /Cannot query field x/); // fault body included
});

test("a nested errors key (parseable, not top-level) is NOT a GraphQL fault", () => {
  const ticket = baseTicket({
    networkRequests: [
      makeRequest({
        timestamp: T0,
        responseBody: '{"data":{"validation":{"errors":[{"message":"too long"}]}}}',
      }),
    ],
  });
  const { hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, false);
});

test("truncated GraphQL body still matches via the narrow prefix fallback", () => {
  const truncated = '{"errors":[{"message":"Internal error","path":["checkout"]},{"mess'; // cut mid-JSON
  const ticket = baseTicket({
    networkRequests: [
      makeRequest({ timestamp: T0, url: "https://app.example.com/graphql", responseBody: truncated }),
    ],
  });
  const { hasAnchors, contextText } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /GraphQL errors in 2xx body/);
});

test("cascade dedup: repeats collapse to the first occurrence with ×N, and the user's distinct older error survives", () => {
  // The user's real error happens FIRST; then a cascading repeat floods the
  // buffer with newer entries. Pre-dedup, newest-first selection evicted the
  // real one; post-dedup the cascade takes ONE slot.
  const cascade = Array.from({ length: 30 }, (_, i) =>
    makeConsoleError({
      timestamp: T0 + 20_000 + i * 500,
      message: "ResizeObserver loop limit exceeded",
    })
  );
  const ticket = baseTicket({
    consoleLogs: [
      makeConsoleError({ timestamp: T0, message: "TypeError: cart.total is undefined" }),
      ...cascade,
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /TypeError: cart\.total is undefined/);
  assert.match(contextText, /\(×30 repeats\)/);
  // The cascade renders once, not thirty times.
  const occurrences = contextText.split("ResizeObserver loop limit exceeded").length - 1;
  assert.equal(occurrences, 1);
});

test("asymmetric window: a trigger 8s BEFORE the fault is kept; noise 5s AFTER is dropped", () => {
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 10_000, message: "save failed" })],
    userActions: [
      makeAction({ timestamp: T0 + 2_000, element: { tag: "button", text: "TriggerClick" } }), // −8s: kept now
      makeAction({ timestamp: T0 + 15_000, element: { tag: "button", text: "LateClick" } }), // +5s: outside lookahead
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  const timelinePart = contextText.slice(contextText.indexOf("CORRELATED TIMELINE"));
  assert.match(timelinePart, /TriggerClick/);
  assert.doesNotMatch(timelinePart, /LateClick/);
});

test("response-landing points render as one-line stubs, not full re-renders", () => {
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 1_500 })],
    networkRequests: [
      makeRequest({
        timestamp: T0,
        method: "POST",
        url: "https://app.example.com/api/save",
        status: 500,
        durationMs: 1_000,
        responseBody: '{"error":"boom-payload"}',
      }),
    ],
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /\[response landed\] POST https:\/\/app\.example\.com\/api\/save → 500/);
  // The body renders exactly once (at start time), not again at the landing stub.
  const bodyCount = contextText.split("boom-payload").length - 1;
  assert.equal(bodyCount, 1);
});

test("the journey section rides along on the anchor path", () => {
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0 + 50_000 })],
    userActions: [
      makeAction({ timestamp: T0, type: "navigation", url: "https://app.example.com/cart" }),
      makeAction({ timestamp: T0 + 49_000, element: { tag: "button", text: "Pay" } }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /USER JOURNEY/);
  assert.match(contextText, /\[TICKET FILED\]/);
  // The navigation 50s before the fault is outside every window — the journey
  // is the only section that carries it.
  assert.match(contextText, /to https:\/\/app\.example\.com\/cart/);
});

test("no-anchor wrong-data ticket: the action-correlated 2xx body reaches the context", () => {
  // Clean page, nothing errored, nothing slow — the wrong value in the response
  // body is the ONLY evidence. It must survive into the no-anchor context.
  const ticket = baseTicket({
    userActions: [
      makeAction({ timestamp: T0, element: { tag: "button", text: "View cart" } }),
    ],
    networkRequests: [
      makeRequest({
        timestamp: T0 + 300,
        url: "https://app.example.com/api/cart",
        responseBody: '{"items":[{"qty":2,"unitPrice":25}],"total":75}',
      }),
      // Background poll with a body, NOT after any action — withheld.
      makeRequest({
        timestamp: T0 + 20_000,
        url: "https://app.example.com/api/poll",
        responseBody: '{"poll":"uncorrelated-body"}',
      }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);
  assert.equal(hasAnchors, false);
  assert.match(contextText, /RESPONSES TO USER ACTIONS/);
  assert.match(contextText, /"total":75/);
  assert.doesNotMatch(contextText, /uncorrelated-body/);
});

// ── Fault invariant: no fault de-selected or budget-trimmed for noise ─────────

test("more than 8 DISTINCT faults all reach the timeline (no anchor cap drops faults)", () => {
  // 12 distinct console errors — formerly only 8 anchors survived selection.
  const faults = Array.from({ length: 12 }, (_, i) =>
    makeConsoleError({ timestamp: T0 + i * 400, message: `Distinct error number ${i}` })
  );
  const { contextText, hasAnchors } = assembleAnalysisContext(baseTicket({ consoleLogs: faults }));
  assert.equal(hasAnchors, true);
  for (let i = 0; i < 12; i++) {
    assert.match(contextText, new RegExp(`Distinct error number ${i}\\b`), `fault ${i} missing`);
  }
});

test("a fault is never dropped for budget while non-fault noise is present", () => {
  // One real fault, plus a flood of in-window successful (noise) requests that
  // would blow any shared budget. The fault must survive; noise is what's cut.
  const noise = Array.from({ length: 60 }, (_, i) =>
    makeRequest({
      timestamp: T0 + 100 + i * 20,
      status: 200,
      url: `https://app.example.com/api/noise-${i}`,
      responseBody: `{"pad":"${"y".repeat(400)}"}`,
    })
  );
  const ticket = baseTicket({
    consoleLogs: [makeConsoleError({ timestamp: T0, message: "THE REAL FAULT here" })],
    userActions: [makeAction({ timestamp: T0 - 200 })],
    networkRequests: noise,
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /THE REAL FAULT here/);
  // The omission marker proves noise was trimmed for budget — but the fault stayed.
  assert.match(contextText, /lower-signal entries omitted for length/);
});

test("slow (non-fault) anchors are capped and never displace faults", () => {
  // 10 slow successful requests (weak anchors) + 1 real fault. The fault is
  // always present; the slow anchors are bounded.
  const slow = Array.from({ length: 10 }, (_, i) =>
    makeRequest({
      timestamp: T0 + i * 300,
      durationMs: 6_000,
      url: `https://app.example.com/api/slow-${i}`,
    })
  );
  const ticket = baseTicket({
    exceptions: [
      {
        timestamp: T0 + 5_000,
        type: "error",
        message: "Uncaught TypeError: the real defect",
        stack: null,
        source: null,
        line: null,
        column: null,
      },
    ],
    networkRequests: slow,
  });
  const { contextText } = assembleAnalysisContext(ticket);
  assert.match(contextText, /Uncaught TypeError: the real defect/);
});

// ── Backward compatibility ──────────────────────────────────────────────────

test("legacy ticket shape (no new metadata fields) still assembles", () => {
  // Only `title` is required on Feedback; everything the overhaul added
  // (tags/pageArea/viewport/clientTimestamp/captureWindowStartAt) is absent here.
  const legacy: AnalyzableFeedback = {
    title: "Old ticket",
    description: "Old ticket",
    url: "https://app.example.com/x",
    userAgent: "UA",
    consoleLogs: [makeConsoleError({ timestamp: T0 })],
    exceptions: [],
    networkRequests: [],
    userActions: [],
  };
  const { contextText, hasAnchors } = assembleAnalysisContext(legacy);
  assert.equal(hasAnchors, true);
  assert.match(contextText, /CORRELATED TIMELINE/);
  assert.match(contextText, /URL: https:\/\/app\.example\.com\/x/);
});
