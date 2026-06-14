/**
 * devtoolsMockData — static per-ticket Dev Tools content for the marketing
 * session demo (the "Send one link" section).
 *
 * Each of the 6 MOCK_TICKETS (sessionMockData.ts) gets a full devtools payload —
 * user actions, console logs, exceptions, network requests, an AI second-opinion,
 * and a browser/device metadata fingerprint — conforming to the real domain types
 * in @/lib/domain/feedback so the imported (real) DevToolsPanel renders them
 * unchanged. SessionDemoStage combines a ticket's base fields with MOCK_DEVTOOLS
 * at render time and passes the result to DevToolsPanel.feedback.
 *
 * NARRATIVE: every ticket tells one coherent debugging story across the streams —
 * the same click that fires a network request also produces the console error and
 * the exception, with timestamps that ascend logically (user actions → request →
 * failure → exception). The AI tab summarizes that story.
 *
 * NO Firebase, NO providers — pure literals. Timestamps are static epoch-ms anchored
 * to BASE_TS; relative "Nm ago" labels in the panel drift over real wall-clock time,
 * which is acceptable for a demo (matching useStaticFeedbackController's comment
 * timestamps).
 */
import type {
  ConsoleLogEntry,
  ExceptionEntry,
  NetworkRequestEntry,
  UserAction,
} from "@/lib/domain/feedback";
import type { DemoActivityEvent } from "./DemoActivityPanel";

/**
 * Fixed anchor: 2026-05-18 14:30:00 local-ish epoch (ms). All per-ticket
 * timestamps are BASE_TS + offset so the streams interleave coherently. Chosen to
 * sit ~2h before the session's "May 18" framing so the capture window reads as the
 * QA pass itself.
 */
export const BASE_TS = 1_747_578_600_000; // 2026-05-18T14:30:00Z

const sec = 1000;

export interface DevToolsDemoData {
  consoleLogs: ConsoleLogEntry[];
  exceptions: ExceptionEntry[];
  networkRequests: NetworkRequestEntry[];
  userActions: UserAction[];
  aiSummary: string;
  aiCause: string;
  aiFixSteps: string[];
  aiSignalRelation: "related" | "unrelated" | "design_request" | "no_signal";
  aiConfidence: number;
  aiAnalysisStatus: "complete";
  url: string;
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  clientTimestamp: number;
}

/* ─── Common user-agent strings (current-ish, May 2026) ─────────────────── */
const UA_CHROME_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
const UA_SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";
const UA_FIREFOX_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0";
const UA_CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

/* ─── Network-request factory (keeps the literals readable) ─────────────── */
function req(
  partial: Partial<NetworkRequestEntry> &
    Pick<NetworkRequestEntry, "id" | "url" | "method" | "timestamp">
): NetworkRequestEntry {
  return {
    status: 200,
    statusText: "OK",
    durationMs: 80,
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
    ...partial,
  };
}

/* ════════════════════════════════════════════════════════════════════════
   t1 — Onboarding step skips when user clicks the browser back arrow
   app.northcap.com/setup/verify · Chrome · macOS
   Story: user fills step 3, hits browser Back → popstate → router pushes step 5
   instead of popping to step 2. State machine advances on a back nav.
   ════════════════════════════════════════════════════════════════════════ */
const t1: DevToolsDemoData = {
  url: "https://app.northcap.com/setup/verify",
  userAgent: UA_CHROME_MAC,
  viewportWidth: 1440,
  viewportHeight: 900,
  screenWidth: 2560,
  screenHeight: 1440,
  devicePixelRatio: 2,
  clientTimestamp: BASE_TS,
  aiSummary:
    "A browser back-navigation during identity verification advances the setup wizard forward (step 3 → step 5) instead of returning to the previous step. The popstate handler is treating a back event as a forward transition.",
  aiCause:
    "The wizard's popstate listener calls router.push(nextStep) unconditionally on history changes, so a back-button popstate is interpreted as a step advance. History state is being mutated forward when it should pop.",
  aiFixSteps: [
    "In the popstate handler, read event.state to determine the target step rather than computing currentStep + 1.",
    "Store each wizard step in history.state via pushState({ step }) so popstate can restore it directly.",
    "Guard the advance path so it only fires from explicit Next clicks, never from popstate.",
    "Add a regression test that navigates step 1→2→3, fires popstate, and asserts the user lands on step 2.",
  ],
  aiSignalRelation: "related",
  aiConfidence: 0.91,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t1-a1", type: "navigation", timestamp: BASE_TS - 90 * sec, url: "https://app.northcap.com/setup/verify", navigationMethod: "load" },
    { id: "t1-a2", type: "click", timestamp: BASE_TS - 78 * sec, element: { tag: "input", id: "legal-name", attributes: { type: "text", "aria-label": "Legal name" } } },
    { id: "t1-a3", type: "input", timestamp: BASE_TS - 72 * sec, fieldLabel: "Legal name" },
    { id: "t1-a4", type: "input", timestamp: BASE_TS - 60 * sec, fieldLabel: "Date of birth" },
    { id: "t1-a5", type: "click", timestamp: BASE_TS - 44 * sec, element: { tag: "button", classes: ["wizard-next"], text: "Continue" } },
    { id: "t1-a6", type: "navigation", timestamp: BASE_TS - 43 * sec, url: "https://app.northcap.com/setup/verify?step=3", navigationMethod: "pushState" },
    { id: "t1-a7", type: "navigation", timestamp: BASE_TS - 8 * sec, url: "https://app.northcap.com/setup/verify?step=5", fromUrl: "https://app.northcap.com/setup/verify?step=3", navigationMethod: "popstate" },
    { id: "t1-a8", type: "click", timestamp: BASE_TS - 2 * sec, element: { tag: "button", classes: ["wizard-back"], text: "Back" } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS - 89 * sec, level: "info", message: "[wizard] mounted step 3 (identity verification)", source: "setup/verify" },
    { timestamp: BASE_TS - 43 * sec, level: "debug", message: "[wizard] transition step 2 → step 3", source: "wizard.ts" },
    { timestamp: BASE_TS - 8 * sec, level: "warn", message: "[wizard] popstate received with no state.step — recomputing from index", source: "wizard.ts" },
    { timestamp: BASE_TS - 8 * sec, level: "error", message: "[wizard] illegal transition: step 3 → step 5 (skipped 4)", args: ["{ from: 3, to: 5, trigger: 'popstate' }"], source: "wizard.ts" },
  ],
  exceptions: [
    {
      timestamp: BASE_TS - 7 * sec,
      type: "error",
      message: "Invariant: cannot enter step 5 before completing step 4",
      source: "wizard.ts",
      line: 142,
      column: 17,
      stack:
        "Error: Invariant: cannot enter step 5 before completing step 4\n    at assertStepOrder (wizard.ts:142:17)\n    at enterStep (wizard.ts:88:5)\n    at onPopState (wizard.ts:61:7)\n    at HTMLWindow.dispatchEvent",
    },
  ],
  networkRequests: [
    req({ id: "t1-n1", url: "https://app.northcap.com/api/setup/state", method: "GET", timestamp: BASE_TS - 89 * sec, durationMs: 112 }),
    req({ id: "t1-n2", url: "https://app.northcap.com/api/setup/verify/start", method: "POST", timestamp: BASE_TS - 43 * sec, status: 201, statusText: "Created", durationMs: 204 }),
    req({ id: "t1-n3", url: "https://cdn.northcap.com/assets/wizard.chunk.js", method: "GET", timestamp: BASE_TS - 88 * sec, status: 304, statusText: "Not Modified", durationMs: 14, responseContentType: "application/javascript", source: "xhr" }),
    req({ id: "t1-n4", url: "https://app.northcap.com/api/setup/step/5", method: "GET", timestamp: BASE_TS - 8 * sec, status: 409, statusText: "Conflict", durationMs: 96, errored: true, errorMessage: "Step 5 not reachable: step 4 incomplete" }),
    req({ id: "t1-n5", url: "https://app.northcap.com/api/telemetry", method: "POST", timestamp: BASE_TS - 6 * sec, status: 202, statusText: "Accepted", durationMs: 41 }),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   t2 — Dashboard chart legend overlaps data on dark mode
   app.heliograph.io/dashboard · Chrome · macOS
   Story: pure presentation bug. Dark-mode legend coords are wrong; no API
   failure — the network is clean and there's a layout warning, not an exception.
   ════════════════════════════════════════════════════════════════════════ */
const t2: DevToolsDemoData = {
  url: "https://app.heliograph.io/dashboard",
  userAgent: UA_CHROME_MAC,
  viewportWidth: 1920,
  viewportHeight: 1080,
  screenWidth: 1920,
  screenHeight: 1080,
  devicePixelRatio: 1,
  clientTimestamp: BASE_TS + 22 * 60 * sec,
  aiSummary:
    "In dark mode the chart legend renders at hard-coded top-right coordinates and overlaps the rightmost data points. Light mode positions the legend below the chart. No network or runtime error — this is a CSS/layout defect specific to the dark theme.",
  aiCause:
    "A dark-mode style override sets the legend to position:absolute with a top/right offset intended for an older layout, instead of inheriting the light-mode flow (legend below the plot). The override ships the wrong coordinates.",
  aiFixSteps: [
    "Remove the dark-mode-only absolute positioning on .chart-legend and let it inherit the shared flow layout.",
    "If the legend must float, compute its offset from the plot's measured bounds rather than a fixed pixel value.",
    "Snapshot-test the chart in both themes to catch theme-specific layout drift.",
  ],
  aiSignalRelation: "design_request",
  aiConfidence: 0.78,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t2-a1", type: "navigation", timestamp: BASE_TS + 1300 * sec, url: "https://app.heliograph.io/dashboard", navigationMethod: "load" },
    { id: "t2-a2", type: "click", timestamp: BASE_TS + 1312 * sec, element: { tag: "button", id: "theme-toggle", attributes: { "aria-label": "Switch to dark mode" } } },
    { id: "t2-a3", type: "click", timestamp: BASE_TS + 1318 * sec, element: { tag: "div", classes: ["range-picker"], text: "Last 30 days" } },
    { id: "t2-a4", type: "click", timestamp: BASE_TS + 1326 * sec, element: { tag: "canvas", classes: ["chart-surface"] } },
    { id: "t2-a5", type: "resize", timestamp: BASE_TS + 1340 * sec, viewport: { width: 1920, height: 1080 } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS + 1301 * sec, level: "info", message: "[charts] hydrated 1 line chart, 247 points", source: "dashboard" },
    { timestamp: BASE_TS + 1312 * sec, level: "debug", message: "[theme] applied theme=dark", source: "theme.ts" },
    { timestamp: BASE_TS + 1313 * sec, level: "warn", message: "[charts] legend box (x:1604,y:24,w:188,h:96) intersects plot area — clipping likely", args: ["{ theme: 'dark', overlapPx: 41 }"], source: "legend.ts" },
  ],
  exceptions: [],
  networkRequests: [
    req({ id: "t2-n1", url: "https://app.heliograph.io/api/metrics/timeseries?range=30d", method: "GET", timestamp: BASE_TS + 1300 * sec, durationMs: 318, responseBodyOriginalSize: 84213 }),
    req({ id: "t2-n2", url: "https://app.heliograph.io/api/me/preferences", method: "GET", timestamp: BASE_TS + 1300 * sec, durationMs: 72 }),
    req({ id: "t2-n3", url: "https://app.heliograph.io/api/me/preferences", method: "PUT", timestamp: BASE_TS + 1312 * sec, durationMs: 88, requestBody: '{"theme":"dark"}', requestBodyOriginalSize: 16 }),
    req({ id: "t2-n4", url: "https://cdn.heliograph.io/fonts/inter-var.woff2", method: "GET", timestamp: BASE_TS + 1300 * sec, status: 304, statusText: "Not Modified", durationMs: 9, responseContentType: "font/woff2", source: "xhr" }),
    req({ id: "t2-n5", url: "https://app.heliograph.io/api/metrics/annotations?range=30d", method: "GET", timestamp: BASE_TS + 1318 * sec, durationMs: 134 }),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   t3 — Add to cart stays disabled after stock returns
   shop.willowgrove.co/products/oak-table-04 · Safari · macOS
   Story: stock webhook updates backend, but the PDP has no realtime listener;
   the WS connection that should push the update never opens (errored request).
   ════════════════════════════════════════════════════════════════════════ */
const t3: DevToolsDemoData = {
  url: "https://shop.willowgrove.co/products/oak-table-04",
  userAgent: UA_SAFARI_MAC,
  viewportWidth: 1440,
  viewportHeight: 900,
  screenWidth: 2880,
  screenHeight: 1800,
  devicePixelRatio: 2,
  clientTimestamp: BASE_TS + 38 * 60 * sec,
  aiSummary:
    "When an out-of-stock product is restocked server-side, the product page keeps the Add to cart button disabled until a full refresh. The page never receives the live inventory update — the realtime channel failed to connect.",
  aiCause:
    "The inventory WebSocket subscription to /inventory/live failed to open (handshake errored) and there is no polling fallback, so the client's stock state stays frozen at its initial server-rendered value of 0.",
  aiFixSteps: [
    "Verify the /inventory/live WebSocket endpoint is reachable from the storefront origin and not blocked by CORS/upgrade headers.",
    "Add a reconnect-with-backoff loop so a dropped inventory socket re-subscribes automatically.",
    "Add a slow-poll fallback (e.g. GET /inventory every 30s) when the socket is unavailable so stock still updates without a refresh.",
    "Re-enable the Add to cart button reactively from the live stock count, not only on mount.",
  ],
  aiSignalRelation: "related",
  aiConfidence: 0.86,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t3-a1", type: "navigation", timestamp: BASE_TS + 2240 * sec, url: "https://shop.willowgrove.co/products/oak-table-04", navigationMethod: "load" },
    { id: "t3-a2", type: "click", timestamp: BASE_TS + 2256 * sec, element: { tag: "button", classes: ["notify-restock"], text: "Notify me" } },
    { id: "t3-a3", type: "click", timestamp: BASE_TS + 2360 * sec, element: { tag: "button", id: "add-to-cart", attributes: { disabled: "true", "aria-label": "Add to cart" }, text: "Out of stock" } },
    { id: "t3-a4", type: "click", timestamp: BASE_TS + 2372 * sec, element: { tag: "button", id: "add-to-cart", attributes: { disabled: "true" }, text: "Out of stock" } },
    { id: "t3-a5", type: "navigation", timestamp: BASE_TS + 2400 * sec, url: "https://shop.willowgrove.co/products/oak-table-04", navigationMethod: "load" },
    { id: "t3-a6", type: "click", timestamp: BASE_TS + 2406 * sec, element: { tag: "button", id: "add-to-cart", text: "Add to cart" } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS + 2241 * sec, level: "info", message: "[pdp] product oak-table-04 rendered (stock=0)", source: "products" },
    { timestamp: BASE_TS + 2242 * sec, level: "warn", message: "[inventory] opening realtime channel /inventory/live", source: "inventory.ts" },
    { timestamp: BASE_TS + 2244 * sec, level: "error", message: "[inventory] WebSocket handshake failed (1006) — falling back to NONE", args: ["{ url: 'wss://shop.willowgrove.co/inventory/live', code: 1006 }"], source: "inventory.ts" },
    { timestamp: BASE_TS + 2360 * sec, level: "warn", message: "[pdp] add-to-cart clicked while disabled; stock state is stale (0)", source: "products" },
  ],
  exceptions: [
    {
      timestamp: BASE_TS + 2244 * sec,
      type: "unhandledrejection",
      message: "WebSocket connection to 'wss://shop.willowgrove.co/inventory/live' failed",
      source: "inventory.ts",
      line: 53,
      column: 11,
      stack:
        "Error: WebSocket connection failed\n    at InventoryChannel.connect (inventory.ts:53:11)\n    at ProductPage.subscribeStock (products.tsx:204:9)\n    at async ProductPage.componentDidMount (products.tsx:131:5)",
    },
  ],
  networkRequests: [
    req({ id: "t3-n1", url: "https://shop.willowgrove.co/api/products/oak-table-04", method: "GET", timestamp: BASE_TS + 2240 * sec, durationMs: 142, source: "xhr" }),
    req({ id: "t3-n2", url: "wss://shop.willowgrove.co/inventory/live", method: "GET", timestamp: BASE_TS + 2242 * sec, status: null, statusText: null, durationMs: null, errored: true, errorMessage: "WebSocket handshake failed (1006)", responseContentType: null }),
    req({ id: "t3-n3", url: "https://shop.willowgrove.co/api/restock-alerts", method: "POST", timestamp: BASE_TS + 2256 * sec, status: 201, statusText: "Created", durationMs: 168, requestBody: '{"sku":"oak-table-04","email":"<redacted>"}', requestBodyOriginalSize: 64, requestBodyTruncated: false }),
    req({ id: "t3-n4", url: "https://shop.willowgrove.co/api/cart/add", method: "POST", timestamp: BASE_TS + 2360 * sec, status: 422, statusText: "Unprocessable Entity", durationMs: 110, errored: true, errorMessage: "Item out of stock", source: "xhr" }),
    req({ id: "t3-n5", url: "https://shop.willowgrove.co/api/products/oak-table-04", method: "GET", timestamp: BASE_TS + 2400 * sec, durationMs: 138, source: "xhr" }),
    req({ id: "t3-n6", url: "https://shop.willowgrove.co/api/cart/add", method: "POST", timestamp: BASE_TS + 2406 * sec, status: 200, durationMs: 121, source: "xhr" }),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   t4 — Settings save fires twice on Enter key
   app.junction.dev/settings/workspace · Firefox · macOS
   Story: Enter triggers both the form onSubmit and a bound keydown handler →
   two PUT requests; the second 409s on the optimistic-lock version.
   ════════════════════════════════════════════════════════════════════════ */
const t4: DevToolsDemoData = {
  url: "https://app.junction.dev/settings/workspace",
  userAgent: UA_FIREFOX_MAC,
  viewportWidth: 1440,
  viewportHeight: 900,
  screenWidth: 2560,
  screenHeight: 1440,
  devicePixelRatio: 2,
  clientTimestamp: BASE_TS + 56 * 60 * sec,
  aiSummary:
    "Pressing Enter in the workspace settings form fires the save twice — once from the form's submit and once from a bound keydown handler — sending two PUT requests. The second request fails the optimistic version check.",
  aiCause:
    "An onKeyDown handler on the input calls save() on Enter, and the surrounding <form> also calls save() on submit. Enter does both, so two identical PUT /settings requests race; the second carries a now-stale version and is rejected.",
  aiFixSteps: [
    "Remove the manual Enter handling on the input and rely solely on the form's onSubmit.",
    "If keydown handling is required, call event.preventDefault() and do NOT also submit the form.",
    "Debounce or in-flight-guard save() so concurrent identical writes collapse to one.",
    "Surface the 409 to the user as a benign no-op rather than a hard error when the payload is unchanged.",
  ],
  aiSignalRelation: "related",
  aiConfidence: 0.93,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t4-a1", type: "navigation", timestamp: BASE_TS + 3320 * sec, url: "https://app.junction.dev/settings/workspace", navigationMethod: "load" },
    { id: "t4-a2", type: "focus", timestamp: BASE_TS + 3332 * sec, element: { tag: "input", id: "workspace-name", attributes: { "aria-label": "Workspace name" } } },
    { id: "t4-a3", type: "input", timestamp: BASE_TS + 3338 * sec, fieldLabel: "Workspace name" },
    { id: "t4-a4", type: "blur", timestamp: BASE_TS + 3344 * sec, element: { tag: "input", id: "workspace-name", attributes: { "aria-label": "Workspace name" } } },
    { id: "t4-a5", type: "focus", timestamp: BASE_TS + 3346 * sec, element: { tag: "input", id: "workspace-name", attributes: { "aria-label": "Workspace name" } } },
    { id: "t4-a6", type: "submit", timestamp: BASE_TS + 3352 * sec, element: { tag: "form", id: "workspace-settings-form" } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS + 3321 * sec, level: "info", message: "[settings] loaded workspace settings (version=7)", source: "settings/workspace" },
    { timestamp: BASE_TS + 3352 * sec, level: "debug", message: "[settings] save() invoked via keydown handler", source: "settingsForm.tsx" },
    { timestamp: BASE_TS + 3352 * sec, level: "debug", message: "[settings] save() invoked via form submit", source: "settingsForm.tsx" },
    { timestamp: BASE_TS + 3353 * sec, level: "warn", message: "[settings] duplicate save detected within 12ms — two PUTs in flight", args: ["{ count: 2, gapMs: 12 }"], source: "settingsForm.tsx" },
    { timestamp: BASE_TS + 3353 * sec, level: "error", message: "[settings] PUT /settings rejected: version conflict (expected 8, got 7)", source: "settingsForm.tsx" },
  ],
  exceptions: [
    {
      timestamp: BASE_TS + 3353 * sec,
      type: "error",
      message: "VersionConflictError: settings were modified concurrently",
      source: "settingsForm.tsx",
      line: 88,
      column: 23,
      stack:
        "VersionConflictError: settings were modified concurrently\n    at handleSaveResponse (settingsForm.tsx:88:23)\n    at async save (settingsForm.tsx:64:5)\n    at HTMLFormElement.onSubmit (settingsForm.tsx:201:7)",
    },
  ],
  networkRequests: [
    req({ id: "t4-n1", url: "https://app.junction.dev/api/settings/workspace", method: "GET", timestamp: BASE_TS + 3320 * sec, durationMs: 96 }),
    req({ id: "t4-n2", url: "https://app.junction.dev/api/settings/workspace", method: "PUT", timestamp: BASE_TS + 3352 * sec, status: 200, durationMs: 174, requestBody: '{"name":"Junction Dev","version":7}', requestBodyOriginalSize: 36 }),
    req({ id: "t4-n3", url: "https://app.junction.dev/api/settings/workspace", method: "PUT", timestamp: BASE_TS + 3352 * sec + 12, status: 409, statusText: "Conflict", durationMs: 132, errored: true, errorMessage: "Version conflict (expected 8, got 7)", requestBody: '{"name":"Junction Dev","version":7}', requestBodyOriginalSize: 36 }),
    req({ id: "t4-n4", url: "https://app.junction.dev/api/audit-log", method: "POST", timestamp: BASE_TS + 3353 * sec, status: 202, statusText: "Accepted", durationMs: 38 }),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   t5 — Notification badge persists after "Mark all as read"
   app.stormwind.so/inbox · Chrome · Windows 11
   Story: bulk mark-read mutates the list but the unread-count query isn't
   invalidated; the count hook keeps a stale cached value.
   ════════════════════════════════════════════════════════════════════════ */
const t5: DevToolsDemoData = {
  url: "https://app.stormwind.so/inbox",
  userAgent: UA_CHROME_WIN,
  viewportWidth: 1536,
  viewportHeight: 864,
  screenWidth: 1920,
  screenHeight: 1080,
  devicePixelRatio: 1.25,
  clientTimestamp: BASE_TS + 74 * 60 * sec,
  aiSummary:
    "After clicking Mark all as read the notification dropdown shows everything read, but the red bell badge keeps its old count until refresh. The unread-count data source isn't refreshed by the bulk-read action.",
  aiCause:
    "The badge count comes from a separate cached query (useUnreadCount) that the bulk mark-read mutation never invalidates. The dropdown list and the count are two independent caches; only the list is updated optimistically.",
  aiFixSteps: [
    "Invalidate / refetch the unread-count query in the mark-all-read mutation's onSuccess.",
    "Or derive the badge count from the same notifications cache the dropdown reads, so there is a single source of truth.",
    "Optimistically set the unread count to 0 on mark-all-read for instant feedback, then reconcile on the server response.",
  ],
  aiSignalRelation: "related",
  aiConfidence: 0.84,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t5-a1", type: "navigation", timestamp: BASE_TS + 4400 * sec, url: "https://app.stormwind.so/inbox", navigationMethod: "load" },
    { id: "t5-a2", type: "click", timestamp: BASE_TS + 4412 * sec, element: { tag: "button", id: "bell", attributes: { "aria-label": "Notifications, 6 unread" } } },
    { id: "t5-a3", type: "click", timestamp: BASE_TS + 4420 * sec, element: { tag: "button", classes: ["mark-all-read"], text: "Mark all as read" } },
    { id: "t5-a4", type: "click", timestamp: BASE_TS + 4432 * sec, element: { tag: "button", id: "bell", attributes: { "aria-label": "Notifications, 6 unread" } } },
    { id: "t5-a5", type: "click", timestamp: BASE_TS + 4440 * sec, element: { tag: "span", classes: ["bell-badge"], text: "6" } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS + 4401 * sec, level: "info", message: "[inbox] loaded 6 unread / 41 total", source: "inbox" },
    { timestamp: BASE_TS + 4420 * sec, level: "debug", message: "[inbox] mutation markAllRead → optimistic update on notifications list", source: "useNotifications.ts" },
    { timestamp: BASE_TS + 4420 * sec, level: "warn", message: "[inbox] markAllRead did not invalidate query ['notifications','unreadCount']", args: ["{ invalidated: ['notifications','list'], stale: ['notifications','unreadCount'] }"], source: "useNotifications.ts" },
    { timestamp: BASE_TS + 4432 * sec, level: "warn", message: "[inbox] badge re-rendered from cache: unreadCount=6 (expected 0)", source: "BellBadge.tsx" },
  ],
  exceptions: [],
  networkRequests: [
    req({ id: "t5-n1", url: "https://app.stormwind.so/api/notifications?status=unread", method: "GET", timestamp: BASE_TS + 4400 * sec, durationMs: 156 }),
    req({ id: "t5-n2", url: "https://app.stormwind.so/api/notifications/unread-count", method: "GET", timestamp: BASE_TS + 4400 * sec, durationMs: 44, responseBody: '{"count":6}', responseBodyOriginalSize: 11 }),
    req({ id: "t5-n3", url: "https://app.stormwind.so/api/notifications/mark-all-read", method: "POST", timestamp: BASE_TS + 4420 * sec, status: 200, durationMs: 188 }),
    req({ id: "t5-n4", url: "https://app.stormwind.so/api/notifications?status=unread", method: "GET", timestamp: BASE_TS + 4421 * sec, durationMs: 142, responseBody: "[]", responseBodyOriginalSize: 2 }),
    req({ id: "t5-n5", url: "https://cdn.stormwind.so/sprite.svg", method: "GET", timestamp: BASE_TS + 4400 * sec, status: 304, statusText: "Not Modified", durationMs: 7, responseContentType: "image/svg+xml", source: "xhr" }),
  ],
};

/* ════════════════════════════════════════════════════════════════════════
   t6 — Image upload progress bar gets stuck at 99% (RESOLVED)
   app.junction.dev/tickets/new · Chrome · macOS
   Story: upload succeeds but progress never emits a final 100; resolved ticket,
   so the AI verdict reflects a clean fix. No exception — purely a UI-completeness
   issue surfaced by the progress events stopping at the last chunk.
   ════════════════════════════════════════════════════════════════════════ */
const t6: DevToolsDemoData = {
  url: "https://app.junction.dev/tickets/new",
  userAgent: UA_CHROME_MAC,
  viewportWidth: 1440,
  viewportHeight: 900,
  screenWidth: 2560,
  screenHeight: 1440,
  devicePixelRatio: 2,
  clientTimestamp: BASE_TS + 1440 * 60 * sec,
  aiSummary:
    "Image uploads complete successfully but the progress bar visually stalls at 99% and never reaches 100% before disappearing. The upload itself is fine — only the final progress emission is missing.",
  aiCause:
    "The progress event chain terminates on the last chunk's onProgress callback, which fires at <100% for the final partial chunk. No explicit 100% emission happens on the success callback, so the bar never visually completes.",
  aiFixSteps: [
    "Emit a final onProgress(100) in the upload success handler regardless of the last chunk's reported value.",
    "Clamp the rendered percentage to 100 once the response resolves.",
    "Delay the progress bar's unmount by one frame so the completed state is visible before it fades.",
  ],
  aiSignalRelation: "related",
  aiConfidence: 0.72,
  aiAnalysisStatus: "complete",
  userActions: [
    { id: "t6-a1", type: "navigation", timestamp: BASE_TS + 86_300 * sec, url: "https://app.junction.dev/tickets/new", navigationMethod: "load" },
    { id: "t6-a2", type: "click", timestamp: BASE_TS + 86_312 * sec, element: { tag: "button", classes: ["attach-image"], text: "Attach screenshot" } },
    { id: "t6-a3", type: "input", timestamp: BASE_TS + 86_316 * sec, fieldLabel: "Attachment" },
    { id: "t6-a4", type: "click", timestamp: BASE_TS + 86_340 * sec, element: { tag: "button", classes: ["upload-cancel"], text: "Cancel" } },
  ],
  consoleLogs: [
    { timestamp: BASE_TS + 86_316 * sec, level: "info", message: "[upload] started screenshot.png (2.4 MB, 5 chunks)", source: "tickets/new" },
    { timestamp: BASE_TS + 86_320 * sec, level: "debug", message: "[upload] progress 20% · 40% · 60% · 80%", source: "uploader.ts" },
    { timestamp: BASE_TS + 86_323 * sec, level: "debug", message: "[upload] last chunk onProgress reported 99% (partial chunk)", source: "uploader.ts" },
    { timestamp: BASE_TS + 86_324 * sec, level: "warn", message: "[upload] success fired but progress never reached 100 — bar will stall", args: ["{ lastProgress: 99, status: 'complete' }"], source: "uploader.ts" },
    { timestamp: BASE_TS + 86_324 * sec, level: "info", message: "[upload] complete: asset_8b21f attached", source: "tickets/new" },
  ],
  exceptions: [],
  networkRequests: [
    req({ id: "t6-n1", url: "https://app.junction.dev/api/uploads/sign", method: "POST", timestamp: BASE_TS + 86_316 * sec, status: 200, durationMs: 92, responseBody: '{"uploadUrl":"https://uploads.junction.dev/...","assetId":"asset_8b21f"}', responseBodyOriginalSize: 220, responseBodyTruncated: true }),
    req({ id: "t6-n2", url: "https://uploads.junction.dev/v1/asset_8b21f", method: "PUT", timestamp: BASE_TS + 86_317 * sec, status: 200, durationMs: 6420, responseContentType: "text/plain", requestBodyOriginalSize: 2_516_582, requestBodyTruncated: true, source: "xhr" }),
    req({ id: "t6-n3", url: "https://app.junction.dev/api/uploads/complete", method: "POST", timestamp: BASE_TS + 86_324 * sec, status: 200, durationMs: 84, requestBody: '{"assetId":"asset_8b21f"}', requestBodyOriginalSize: 26 }),
    req({ id: "t6-n4", url: "https://cdn.junction.dev/thumb/asset_8b21f.webp", method: "GET", timestamp: BASE_TS + 86_325 * sec, durationMs: 210, responseContentType: "image/webp", source: "xhr" }),
  ],
};

export const MOCK_DEVTOOLS: Record<string, DevToolsDemoData> = {
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
};

/* ════════════════════════════════════════════════════════════════════════
   Per-ticket Activity timeline (feeds DemoActivityPanel).

   Each ticket carries a small, believable lifecycle — created → priority set →
   assigned → (resolved). Actors are the four demo collaborators (uids match the
   comment authors / DEMO_MEMBERS so avatar colors stay consistent across the
   panels). Events are ordered NEWEST-FIRST, matching the source panel's desc
   ordering; the panel buckets them by day. `min` offsets are minutes before now,
   resolved to absolute epoch by deriving from the ticket's clientTimestamp.
   ════════════════════════════════════════════════════════════════════════ */
const MAYA = { id: "u-maya", name: "Maya Anand", avatarUrl: "/marketing/people/maya-anand.jpg" };
const DANIEL = { id: "u-daniel", name: "Daniel Torres", avatarUrl: "/marketing/people/daniel-torres.jpg" };
const SARAH = { id: "u-sarah", name: "Sarah Kim", avatarUrl: "/marketing/people/sarah-kim.jpg" };
const ALEX = { id: "u-alex", name: "Alex Nguyen", avatarUrl: "/marketing/people/alex-nguyen.jpg" };

const min = 60 * 1000;

export const MOCK_ACTIVITY: Record<string, DemoActivityEvent[]> = {
  // t1 — created by Maya, set High, assigned to Daniel (matches initial state).
  t1: [
    { id: "t1-e3", eventType: "ticket.assignment.changed", actor: MAYA, createdAt: BASE_TS - 10 * min, metadata: { from: null, to: { uid: "u-daniel", name: "Daniel Torres" } } },
    { id: "t1-e2", eventType: "ticket.priority.changed", actor: MAYA, createdAt: BASE_TS - 11 * min, metadata: { from: null, to: "high" } },
    { id: "t1-e1", eventType: "feedback.created", actor: MAYA, createdAt: BASE_TS - 12 * min },
  ],
  // t2 — created by Sarah, medium priority.
  t2: [
    { id: "t2-e2", eventType: "ticket.priority.changed", actor: SARAH, createdAt: BASE_TS + 22 * 60 * 1000 - 30 * min, metadata: { from: null, to: "medium" } },
    { id: "t2-e1", eventType: "feedback.created", actor: SARAH, createdAt: BASE_TS + 22 * 60 * 1000 - 34 * min },
  ],
  // t3 — created by Alex, high, assigned to Alex himself.
  t3: [
    { id: "t3-e3", eventType: "ticket.assignment.changed", actor: ALEX, createdAt: BASE_TS + 38 * 60 * 1000 - 55 * min, metadata: { from: null, to: { uid: "u-alex", name: "Alex Nguyen" } } },
    { id: "t3-e2", eventType: "ticket.priority.changed", actor: ALEX, createdAt: BASE_TS + 38 * 60 * 1000 - 58 * min, metadata: { from: null, to: "high" } },
    { id: "t3-e1", eventType: "feedback.created", actor: ALEX, createdAt: BASE_TS + 38 * 60 * 1000 - 60 * min },
  ],
  // t4 — created by Daniel.
  t4: [
    { id: "t4-e1", eventType: "feedback.created", actor: DANIEL, createdAt: BASE_TS + 56 * 60 * 1000 - 120 * min },
  ],
  // t5 — created by Maya, assigned to Sarah, priority bumped low → medium.
  t5: [
    { id: "t5-e3", eventType: "ticket.assignment.changed", actor: MAYA, createdAt: BASE_TS + 74 * 60 * 1000 - 170 * min, metadata: { from: null, to: { uid: "u-sarah", name: "Sarah Kim" } } },
    { id: "t5-e2", eventType: "ticket.priority.changed", actor: SARAH, createdAt: BASE_TS + 74 * 60 * 1000 - 175 * min, metadata: { from: "low", to: "medium" } },
    { id: "t5-e1", eventType: "feedback.created", actor: MAYA, createdAt: BASE_TS + 74 * 60 * 1000 - 180 * min },
  ],
  // t6 — created by Alex, assigned to Daniel, then RESOLVED by Daniel (resolved ticket).
  t6: [
    { id: "t6-e4", eventType: "feedback.resolved", actor: DANIEL, createdAt: BASE_TS + 1440 * 60 * 1000 - 1430 * min },
    { id: "t6-e3", eventType: "ticket.assignment.changed", actor: ALEX, createdAt: BASE_TS + 1440 * 60 * 1000 - 1438 * min, metadata: { from: null, to: { uid: "u-daniel", name: "Daniel Torres" } } },
    { id: "t6-e2", eventType: "ticket.priority.changed", actor: ALEX, createdAt: BASE_TS + 1440 * 60 * 1000 - 1439 * min, metadata: { from: null, to: "low" } },
    { id: "t6-e1", eventType: "feedback.created", actor: ALEX, createdAt: BASE_TS + 1440 * 60 * 1000 - 1440 * min },
  ],
};
