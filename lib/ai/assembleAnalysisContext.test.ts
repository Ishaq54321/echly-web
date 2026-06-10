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
      makeRequest({ timestamp: T0 + 6_000, durationMs: 4_200, url: "https://app.example.com/api/cart" }),
      makeRequest({ timestamp: T0 + 7_000, durationMs: 150 }),
    ],
  });
  const { contextText, hasAnchors } = assembleAnalysisContext(ticket);

  assert.equal(hasAnchors, false);
  assert.match(contextText, /USER JOURNEY/);
  assert.match(contextText, /\[TICKET FILED\]/);
  assert.match(contextText, /SLOWEST REQUESTS/);
  assert.match(contextText, /4200ms/);
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
