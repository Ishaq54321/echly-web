/**
 * Live verification harness for the AI ticket-analysis pipeline.
 *
 * Runs the REAL assembler + system prompt + model (same model id, schema, and
 * call parameters as the analyze route) against synthetic tickets shaped like
 * the ticket types real users file, and prints the verdicts. No Firestore, no
 * auth — this exercises exactly the input-pipeline + model layers the route
 * wires together, so wave-gate checks are reproducible.
 *
 * Run with: npx tsx scripts/verifyAiAnalysis.ts [scenario...]
 * (no args = all scenarios; requires OPENAI_API_KEY in .env.local)
 */

import { config } from "dotenv";
import OpenAI from "openai";
import {
  assembleAnalysisContext,
  type AnalyzableFeedback,
} from "@/lib/ai/assembleAnalysisContext";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts/analysisPrompt";
import {
  SIGNAL_RELATIONS,
  sanitizeOut,
  sanitizeRelation,
  sanitizeSteps,
  clampConfidence,
} from "@/lib/ai/analysisSanitize";
import type { NetworkRequestEntry, UserAction, ConsoleLogEntry } from "@/lib/domain/feedback";

config({ path: ".env.local" });

// Mirrors the route (AI_ANALYSIS_MODEL / ANALYSIS_JSON_SCHEMA / call params).
const MODEL = "gpt-5.4-nano";
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    aiSummary: { type: "string" },
    aiSignalRelation: { type: "string", enum: SIGNAL_RELATIONS as unknown as string[] },
    aiCause: { type: "string" },
    aiFixSteps: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
    aiConfidence: { type: "number" },
  },
  required: ["aiSummary", "aiSignalRelation", "aiCause", "aiFixSteps", "aiConfidence"],
} as const;

const T0 = Date.now() - 90_000;

function req(over: Partial<NetworkRequestEntry> & { timestamp: number }): NetworkRequestEntry {
  return {
    id: `r-${over.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
    url: "https://shop.example.com/api/data",
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

function act(over: Partial<UserAction> & { timestamp: number }): UserAction {
  return { id: `a-${over.timestamp}-${Math.random().toString(36).slice(2, 6)}`, type: "click", ...over };
}

function cerr(over: Partial<ConsoleLogEntry> & { timestamp: number }): ConsoleLogEntry {
  return { level: "error", message: "Boom", ...over };
}

function base(over: Partial<AnalyzableFeedback>): AnalyzableFeedback {
  return {
    title: "",
    description: "",
    tags: [],
    pageArea: null,
    url: "https://shop.example.com/checkout",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126",
    viewportWidth: 1440,
    viewportHeight: 900,
    screenWidth: 2560,
    screenHeight: 1440,
    devicePixelRatio: 2,
    clientTimestamp: T0 + 75_000,
    captureWindowStartAt: null,
    consoleLogs: [],
    exceptions: [],
    networkRequests: [],
    userActions: [],
    ...over,
  };
}

interface Scenario {
  expect: string;
  ticket: AnalyzableFeedback;
  /** When set, rendered to PNG (via sharp) and attached as a low-detail image — mirrors the route's screenshot path. */
  screenshotSvg?: string;
}

const SCENARIOS: Record<string, Scenario> = {
  design: {
    expect: "design_request, high confidence, no fabricated cause",
    ticket: base({
      title: "Change the checkout button color to brand red",
      description:
        "The Place Order button is yellow which doesn't match our brand. Please change it to the red we use on the homepage hero.",
      tags: ["design", "color-theme"],
      pageArea: "Checkout",
      userActions: [
        act({ timestamp: T0, type: "navigation", url: "https://shop.example.com/checkout" }),
        act({ timestamp: T0 + 20_000, element: { tag: "button", text: "Place Order" } }),
      ],
    }),
  },
  performance: {
    expect: "NOT design-observation framing; perf reasoning from slow requests (related or no_signal acceptable pre-Wave-2)",
    ticket: base({
      title: "Orders page takes forever to load",
      description:
        "Opening the Orders page is painfully slow, I sit there for several seconds staring at a spinner before anything shows up.",
      tags: ["bug", "performance"],
      pageArea: "Orders",
      url: "https://shop.example.com/orders",
      userActions: [
        act({ timestamp: T0, type: "navigation", url: "https://shop.example.com/orders" }),
        act({ timestamp: T0 + 9_000, element: { tag: "a", text: "Orders" } }),
      ],
      networkRequests: [
        req({ timestamp: T0 + 1_000, url: "https://shop.example.com/api/orders?page=1", durationMs: 7_800 }),
        req({ timestamp: T0 + 1_050, url: "https://shop.example.com/api/account", durationMs: 240 }),
        req({ timestamp: T0 + 9_200, url: "https://shop.example.com/api/orders?page=1", durationMs: 8_400 }),
      ],
    }),
  },
  wrongdata: {
    expect: "Wave 2 gate: the 200 body (total:75) reaches the model and the analysis cites it",
    ticket: base({
      title: "Cart total is calculated wrong",
      description:
        "I have two items at $25 each but the cart total says $75. No error appears, the number is just wrong.",
      tags: ["bug", "checkout"],
      pageArea: "Cart",
      url: "https://shop.example.com/cart",
      userActions: [
        act({ timestamp: T0, element: { tag: "button", text: "Add to cart" } }),
        act({ timestamp: T0 + 4_000, element: { tag: "button", text: "Add to cart" } }),
        act({ timestamp: T0 + 8_000, element: { tag: "a", text: "View cart" } }),
        act({ timestamp: T0 + 8_050, type: "navigation", url: "https://shop.example.com/cart" }),
      ],
      networkRequests: [
        req({
          timestamp: T0 + 8_200,
          url: "https://shop.example.com/api/cart",
          durationMs: 310,
          responseBody: '{"items":[{"sku":"A1","qty":2,"unitPrice":25}],"total":75}',
        }),
      ],
    }),
  },
  cascade: {
    expect: "Wave 2 gate: the user's real error (cart.total undefined) survives a 40-deep newer cascade and is the cited cause",
    ticket: base({
      title: "Cart page crashes when opening",
      description: "When I open the cart the page goes blank for a second and the total never renders.",
      tags: ["bug", "cart"],
      pageArea: "Cart",
      url: "https://shop.example.com/cart",
      userActions: [
        act({ timestamp: T0 + 4_000, element: { tag: "a", text: "Cart" } }),
      ],
      consoleLogs: [
        cerr({ timestamp: T0 + 5_000, message: "TypeError: Cannot read properties of undefined (reading 'total') at CartSummary.render" }),
        ...Array.from({ length: 40 }, (_, i) =>
          cerr({ timestamp: T0 + 20_000 + i * 800, message: "ResizeObserver loop completed with undelivered notifications." })
        ),
      ],
    }),
  },
  empty: {
    expect: "no_signal — honest insufficient-evidence verdict, not 'probably not a bug'",
    ticket: base({
      title: "Search is broken",
      description: "Search is broken.",
      tags: ["bug"],
      pageArea: "Search",
      url: "https://shop.example.com/search",
    }),
  },
  defect: {
    expect: "related, confident diagnosis citing the 500 (regression check)",
    ticket: base({
      title: "Payment fails when I click Pay",
      description: "When I click Pay on checkout nothing happens and the order never goes through.",
      tags: ["bug", "checkout"],
      pageArea: "Checkout",
      userActions: [
        act({ timestamp: T0 + 10_000, element: { tag: "button", text: "Pay" }, type: "click" }),
      ],
      networkRequests: [
        req({
          timestamp: T0 + 10_300,
          url: "https://shop.example.com/api/payments/charge",
          method: "POST",
          status: 500,
          statusText: "Internal Server Error",
          durationMs: 950,
          responseBody: '{"error":"PaymentProviderTimeout: charge attempt did not complete"}',
        }),
      ],
      consoleLogs: [
        cerr({ timestamp: T0 + 11_400, message: "Uncaught (in promise) Error: charge failed" }),
      ],
    }),
  },
  brokenimage: {
    expect: "Wave 3 gate: the synthetic resource-failure entry is the cited evidence (related)",
    ticket: base({
      title: "Profile pictures are broken on the team page",
      description: "On the team page every member's photo shows the broken-image icon instead of their picture.",
      tags: ["bug", "image-media"],
      pageArea: "Team",
      url: "https://shop.example.com/team",
      userActions: [
        act({ timestamp: T0, type: "navigation", url: "https://shop.example.com/team" }),
      ],
      consoleLogs: [
        // Exactly what the new capture-phase resource-error listener emits.
        cerr({
          timestamp: T0 + 800,
          message: "Failed to load resource: <img> https://cdn.example.com/avatars/u42.png",
          source: "https://shop.example.com/team",
        }),
        cerr({
          timestamp: T0 + 820,
          message: "Failed to load resource: <img> https://cdn.example.com/avatars/u57.png",
          source: "https://shop.example.com/team",
        }),
      ],
    }),
  },
  visual: {
    expect: "Wave 3 gate: the screenshot is attached and the analysis references what is visible (overlapping text/button)",
    screenshotSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
      <rect width="640" height="400" fill="#ffffff"/>
      <text x="24" y="48" font-family="Arial" font-size="28" fill="#111">Your Cart</text>
      <text x="24" y="120" font-family="Arial" font-size="16" fill="#333">Wireless Headphones — $129.00</text>
      <text x="24" y="150" font-family="Arial" font-size="16" fill="#333">USB-C Cable — $19.00</text>
      <!-- The bug: the total label and the checkout button overlap -->
      <text x="380" y="330" font-family="Arial" font-size="20" fill="#111">Total: $148.00</text>
      <rect x="360" y="305" width="220" height="48" rx="8" fill="#155DFC" fill-opacity="0.85"/>
      <text x="395" y="336" font-family="Arial" font-size="18" fill="#fff">Checkout now</text>
    </svg>`,
    ticket: base({
      title: "Checkout button covers the cart total",
      description: "On the cart page the blue Checkout button sits on top of the total amount so I can't read what I'm paying.",
      tags: ["bug", "layout", "visual-design"],
      pageArea: "Cart",
      url: "https://shop.example.com/cart",
      viewportWidth: 640,
      viewportHeight: 400,
      userActions: [
        act({ timestamp: T0, type: "navigation", url: "https://shop.example.com/cart" }),
      ],
    }),
  },
  watermark: {
    expect: "no_signal with prior-ticket window framing (not 'nothing was captured')",
    ticket: base({
      title: "The discount banner flashed an error earlier",
      description:
        "A few minutes ago the discount banner showed an error when the page loaded. Filing this now so you can look at it.",
      tags: ["bug"],
      pageArea: "Home",
      url: "https://shop.example.com/",
      captureWindowStartAt: T0 + 60_000,
      clientTimestamp: T0 + 75_000,
      userActions: [act({ timestamp: T0 + 70_000, element: { tag: "button", text: "File ticket" } })],
    }),
  },
};

async function run(name: string, scenario: Scenario) {
  const { contextText, hasAnchors } = assembleAnalysisContext(scenario.ticket);

  // Mirror the route's screenshot attach (low-detail image content part + the
  // attachment note). The harness renders its SVG fixture to PNG via sharp and
  // inlines it as a data URL — the route uses a signed Storage URL instead.
  let userContent: OpenAI.Chat.ChatCompletionContentPart[];
  if (scenario.screenshotSvg) {
    const { default: sharp } = await import("sharp");
    const png = await sharp(Buffer.from(scenario.screenshotSvg)).png().toBuffer();
    userContent = [
      {
        type: "text",
        text: `${contextText}\n\nATTACHED SCREENSHOT: the full-page screenshot taken when the ticket was filed (the capture widget's own tray may be visible in it — ignore that overlay).`,
      },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${png.toString("base64")}`, detail: "low" },
      },
    ];
  } else {
    userContent = [{ type: "text", text: contextText }];
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create(
    {
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 600,
      response_format: {
        type: "json_schema",
        json_schema: { name: "ticket_analysis", schema: SCHEMA as Record<string, unknown>, strict: true },
      },
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    },
    { timeout: 30_000, maxRetries: 0 }
  );
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const verdict = sanitizeRelation(parsed.aiSignalRelation, hasAnchors);

  console.log(`\n${"═".repeat(70)}`);
  console.log(
    `SCENARIO: ${name}  (hasAnchors=${hasAnchors}, context=${contextText.length} chars${scenario.screenshotSvg ? ", screenshot attached" : ""})`
  );
  console.log(`EXPECT:   ${scenario.expect}`);
  console.log(`${"─".repeat(70)}`);
  console.log(`VERDICT:    ${verdict}   confidence=${clampConfidence(parsed.aiConfidence)}`);
  console.log(`SUMMARY:    ${sanitizeOut(parsed.aiSummary, 600)}`);
  console.log(`CAUSE:      ${sanitizeOut(parsed.aiCause, 400)}`);
  console.log(`STEPS:      ${JSON.stringify(sanitizeSteps(parsed.aiFixSteps, 5, 300), null, 2)}`);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY missing — load .env.local");
    process.exit(1);
  }
  const picked = process.argv.slice(2);
  const names = picked.length > 0 ? picked : Object.keys(SCENARIOS);
  for (const name of names) {
    const s = SCENARIOS[name];
    if (!s) {
      console.error(`Unknown scenario: ${name} (have: ${Object.keys(SCENARIOS).join(", ")})`);
      continue;
    }
    await run(name, s);
  }
}

void main();
