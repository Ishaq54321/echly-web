/**
 * Interpreter verification harness — the voice/text → ticket twin of verifyAiAnalysis.ts.
 *
 * Runs fixture transcripts × fixture DOM contexts through the LIVE interpreter
 * pipeline (same model, same prompt, same budget path as production) and asserts
 * on GROUNDING quality: is the element named concretely, do current values appear
 * when referenced, do the recorder's words/hedges survive, does page-general
 * feedback avoid false grounding in a random clicked element, do long notes
 * survive without truncation fallback.
 *
 * Usage:
 *   npx tsx scripts/verifyInterpreter.ts              # all scenarios
 *   npx tsx scripts/verifyInterpreter.ts deictic-leaf page-general
 *
 * Requires OPENAI_API_KEY in .env.local. Scenarios that fail are the measured
 * gap, not necessarily bugs — run before and after capture/prompt changes and
 * compare.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import OpenAI from "openai";
import {
  buildDomContextForPipeline,
  extractStructuredFeedback,
  type VoiceTicket,
} from "@/lib/ai/voiceToTicketPipeline";
import { whitelistTags } from "@/lib/constants/ticketTags";

/* ===== scenario model ===== */

interface Check {
  name: string;
  /** Pass/fail against the final ticket. `raw` is the unparsed model output. */
  test: (ticket: VoiceTicket, raw: string) => boolean;
}

interface Scenario {
  name: string;
  /** Utterance type from the review's verdict table. */
  kind: string;
  expect: string;
  transcript: string;
  /** Raw context exactly as the client would POST it (null = dashboard no-context path). */
  context: Record<string, unknown> | null;
  checks: Check[];
}

/** Shared fixture base: a realistic extension CaptureContext POST body. */
function ctx(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    url: "https://acme.com/pricing",
    scrollX: 0,
    scrollY: 850,
    viewportWidth: 1440,
    viewportHeight: 900,
    devicePixelRatio: 2,
    pageTitle: "Pricing — Acme",
    pageH1: "Pricing that scales with you",
    elementTag: null,
    ancestorTrail: null,
    siblingsList: null,
    subtreeText: null,
    semanticIdentifier: null,
    computedStyles: null,
    childrenList: null,
    elementState: null,
    semanticType: null,
    disabledState: null,
    modalContext: null,
    inputValue: null,
    capturedAt: 0,
    ...overrides,
  };
}

const hasAny = (s: string, needles: string[]) =>
  needles.some((n) => s.toLowerCase().includes(n.toLowerCase()));

/* ===== scenarios — one per utterance type in the review verdict table ===== */

const SCENARIOS: Scenario[] = [
  {
    name: "deictic-leaf",
    kind: "Deictic on a labeled leaf",
    expect:
      "Names 'Get Started' concretely; grounds size change in current 14px; no invention.",
    transcript: "make this bigger, it's way too small to be the main CTA",
    context: ctx({
      elementTag: "button",
      ancestorTrail: 'main > section "Hero"',
      subtreeText: "Get Started",
      semanticIdentifier: "Get Started",
      semanticType: "button",
      computedStyles:
        "color: #FFFFFF; font-size: 14px; font-weight: 600; background: #1C1C1C; padding: 12px 24px; border-radius: 8px; size: 160x44px",
    }),
    checks: [
      {
        name: "element named concretely (not 'this element')",
        test: (t) => hasAny(t.title + " " + t.description, ["get started"]),
      },
      {
        name: "current value grounded (14px referenced)",
        test: (t) => t.description.includes("14px"),
      },
      {
        name: "user's judgment preserved (CTA / too small)",
        test: (t) =>
          hasAny(t.description + " " + t.title, ["cta", "too small", "small"]),
      },
    ],
  },
  {
    name: "deictic-wrapper",
    kind: "Deictic on an unlabeled wrapper",
    expect:
      "User clicked the padding around the signup button: identifier is empty, wrapper styles stripped. Should ground in the named child from childrenList, not 'the section'.",
    transcript:
      "this sign up button is barely visible, it needs way more contrast",
    context: ctx({
      elementTag: "div",
      ancestorTrail: 'main > section "Get started"',
      subtreeText: "Sign up free No credit card required",
      semanticIdentifier: "",
      semanticType: null,
      computedStyles: "padding: 24px; size: 320x96px",
      childrenList:
        '(2 meaningful descendants)\n1. button: "Sign up free" (color: #8A8096; bg: #F4F2F7; font: 14px; padding: 12px 24px; size: 180x44px)\n2. p: "No credit card required" (color: #B5AEBE; font: 12px; size: 200x16px)',
    }),
    checks: [
      {
        name: "grounds in the named child button ('Sign up free')",
        test: (t) => hasAny(t.title + " " + t.description, ["sign up free", "sign up"]),
      },
      {
        name: "not deflected to a generic 'section/element/area'",
        test: (t) =>
          !hasAny(t.title, ["the section", "this element", "the area", "the container"]),
      },
      {
        name: "current contrast values grounded (text #8A8096 or bg #F4F2F7)",
        test: (t) => hasAny(t.description, ["#8A8096", "#F4F2F7"]),
      },
    ],
  },
  {
    name: "spatial",
    kind: "Relative/spatial reference",
    expect:
      "Clicked the price; talks about the button NEXT TO it. Spatial words preserved verbatim; must not claim the price element is the button.",
    transcript:
      "the button next to this price is misaligned, it sits like five pixels too low",
    context: ctx({
      elementTag: "h2",
      ancestorTrail: 'main > section "Plans" > div "Pro plan"',
      siblingsList: 'button "Choose Pro", p "per month"',
      subtreeText: "$29",
      semanticIdentifier: "$29",
      semanticType: "heading",
      computedStyles: "color: #15101F; font-size: 36px; font-weight: 700; size: 80x44px",
    }),
    checks: [
      {
        name: "spatial reference preserved (next to)",
        test: (t) => hasAny(t.description, ["next to"]),
      },
      {
        name: "user's measurement hedge survives (five pixels / 5px ... 'like')",
        test: (t) => hasAny(t.description, ["five pixels", "5 pixels", "5px", "~5"]),
      },
      {
        name: "doesn't recast the clicked $29 price as the misaligned element",
        test: (t) => !hasAny(t.title, ["price is misaligned", "$29 is misaligned"]),
      },
      {
        name: "names the matching sibling button ('Choose Pro') [Wave 2 target]",
        test: (t) => hasAny(t.title + " " + t.description, ["choose pro"]),
      },
    ],
  },
  {
    name: "multi-element",
    kind: "Multi-element (clicked the common parent)",
    expect:
      "Clicked the plans grid; childrenList carries the three cards. Should speak about the cards (plural), ideally naming them.",
    transcript:
      "these three plan cards all have different padding, they should be identical",
    context: ctx({
      elementTag: "div",
      ancestorTrail: "main",
      subtreeText:
        "Starter For individuals $9 Choose Starter Pro For growing teams $29 Choose Pro Enterprise For large orgs Custom Contact us",
      semanticIdentifier: "",
      semanticType: "section",
      computedStyles: "size: 1180x420px",
      childrenList:
        '(3 meaningful descendants)\n1. div: "(no label)" (bg: #FFFFFF; border: 1px #E5E1EC; padding: 24px; size: 380x400px)\n2. div: "(no label)" (bg: #FFFFFF; border: 1px #E5E1EC; padding: 32px; size: 380x400px)\n3. div: "(no label)" (bg: #FFFFFF; border: 1px #E5E1EC; padding: 28px; size: 380x400px)',
    }),
    checks: [
      {
        name: "speaks about plan cards (plural)",
        test: (t) => hasAny(t.title + " " + t.description, ["plan cards", "pricing cards", "cards"]),
      },
      {
        name: "grounds the inconsistency in captured values (24/32/28px)",
        test: (t) =>
          ["24px", "32px", "28px"].filter((v) => t.description.includes(v)).length >= 2,
      },
      {
        name: "preserves the ask (identical/consistent padding)",
        test: (t) => hasAny(t.description, ["identical", "consistent", "same padding", "match"]),
      },
    ],
  },
  {
    name: "property-from-to",
    kind: "Property-specific 'from X to Y'",
    expect:
      "Grounds 'from #1C1C1C' in the description; title stays value-free.",
    transcript:
      "this headline color is too harsh, change it from this dark color to something warmer",
    context: ctx({
      elementTag: "h1",
      ancestorTrail: 'main > section "Hero"',
      subtreeText: "Pricing that scales with you",
      semanticIdentifier: "Pricing that scales with you",
      semanticType: "heading",
      computedStyles: "color: #1C1C1C; font-size: 48px; font-weight: 700; size: 720x56px",
    }),
    checks: [
      {
        name: "current color #1C1C1C grounded in description",
        test: (t) => t.description.includes("#1C1C1C"),
      },
      {
        name: "title is value-free (no hex)",
        test: (t) => !/#[0-9A-Fa-f]{3,8}/.test(t.title),
      },
      {
        name: "target stays the recorder's word ('warmer'), not an invented hex",
        test: (t) =>
          hasAny(t.description, ["warmer"]) &&
          (t.description.match(/#[0-9A-Fa-f]{6}/g) ?? []).every((h) => h === "#1C1C1C"),
      },
    ],
  },
  {
    name: "copy-edit",
    kind: "Copy edit on static text",
    expect:
      "Preserves the exact replacement copy and references the current text.",
    transcript:
      "change this to say Start your free trial today instead of what it says now",
    context: ctx({
      elementTag: "p",
      ancestorTrail: 'main > section "Hero"',
      subtreeText: "Start a trial today",
      semanticIdentifier: "Start a trial today",
      semanticType: "paragraph",
      computedStyles: "color: #54495F; font-size: 16px; size: 220x24px",
    }),
    checks: [
      {
        name: "exact target copy preserved",
        test: (t) => t.description.includes("Start your free trial today"),
      },
      {
        name: "current text referenced for the developer",
        test: (t) => t.description.includes("Start a trial today"),
      },
    ],
  },
  {
    name: "page-general",
    kind: "Page-general feedback, irrelevant clicked element",
    expect:
      "Whole-page feedback; the clicked random paragraph must NOT become the subject. Ground at page level.",
    transcript:
      "honestly this whole page feels dated, the layout looks like it's from 2015, nothing wrong with any one thing it's just the overall vibe",
    context: ctx({
      elementTag: "p",
      ancestorTrail: "main > footer",
      subtreeText: "All prices in USD. Taxes may apply.",
      semanticIdentifier: "All prices in USD. Taxes may apply.",
      semanticType: "paragraph",
      computedStyles: "color: #B5AEBE; font-size: 12px; size: 240x16px",
    }),
    checks: [
      {
        name: "clicked element NOT falsely grounded (no USD/taxes line in output)",
        test: (t) =>
          !hasAny(t.title + " " + t.description, ["usd", "taxes", "prices in usd"]),
      },
      {
        name: "grounded at page level (page/layout as subject)",
        test: (t) => hasAny(t.title, ["page", "layout", "pricing"]),
      },
      {
        name: "user's judgment preserved (dated / 2015 / vibe)",
        test: (t) => hasAny(t.description, ["dated", "2015", "vibe", "old"]),
      },
    ],
  },
  {
    name: "technical-dictation",
    kind: "Technical dictation (hex codes, class names)",
    expect:
      "Every technical token survives exactly: #5A49BF, #4F46E5, btn-primary.",
    transcript:
      "the focus ring on this is using #5A49BF but our brand token is #4F46E5, and the class btn-primary is missing its hover state entirely",
    context: ctx({
      elementTag: "button",
      ancestorTrail: 'main > section "Plans" > div "Pro plan"',
      subtreeText: "Choose Pro",
      semanticIdentifier: "Choose Pro",
      semanticType: "button",
      computedStyles:
        "color: #FFFFFF; font-size: 14px; background: #5A49BF; padding: 12px 24px; size: 280x44px",
    }),
    checks: [
      {
        name: "#5A49BF survives exactly",
        test: (t) => t.description.toUpperCase().includes("#5A49BF"),
      },
      {
        name: "#4F46E5 survives exactly",
        test: (t) => t.description.toUpperCase().includes("#4F46E5"),
      },
      {
        name: "btn-primary survives exactly",
        test: (t) => t.description.includes("btn-primary"),
      },
      {
        name: "element named concretely ('Choose Pro')",
        test: (t) => hasAny(t.title + " " + t.description, ["choose pro"]),
      },
    ],
  },
  {
    name: "messy-multi-issue",
    kind: "Messy multi-issue voice note (long)",
    expect:
      "Six distinct issues; must not truncate-fallback to the raw transcript; structure with bullets/headings; most issues represented.",
    transcript:
      "okay so I have a bunch of notes on this pricing page so bear with me. first the get started button, it's way too small compared to everything else on the page, the font looks like 14 pixels and it should probably be at least 18, and the contrast feels off. second thing, the pricing cards themselves, the pro plan card has this weird shadow that the starter card doesn't have, it makes the page look inconsistent, and the enterprise card's contact us link is buried at the bottom in tiny grey text. third, when you toggle between monthly and yearly billing the prices jump around without any animation and for a split second you see the wrong price which is really confusing. fourth the FAQ section below the cards, the questions don't expand on the first click sometimes, you have to click twice, and one of the answers about refunds still references the old 30 day policy but we changed it to 14 days last quarter. fifth, the testimonial carousel at the bottom auto-advances way too fast, you can't finish reading a quote, and the pause button doesn't actually pause it. oh and the whole page feels slow to load, the cards pop in one by one which looks janky.",
    context: ctx({
      elementTag: "button",
      ancestorTrail: 'main > section "Hero"',
      subtreeText: "Get Started",
      semanticIdentifier: "Get Started",
      semanticType: "button",
      computedStyles:
        "color: #FFFFFF; font-size: 14px; background: #1C1C1C; padding: 12px 24px; size: 160x44px",
    }),
    checks: [
      {
        name: "no raw-transcript fallback (title not empty/'Untitled')",
        test: (t) => t.title !== "Untitled feedback" && t.title.length > 0,
      },
      {
        name: "structured output (bullets present)",
        test: (t) => /(^|\n)\s*- /.test(t.description),
      },
      {
        name: ">=5 of 6 issues represented",
        test: (t) => {
          const issues = [
            ["button", "small", "14"],
            ["shadow", "inconsisten"],
            ["toggle", "jump", "monthly", "yearly"],
            ["faq", "expand", "twice", "refund"],
            ["carousel", "auto-advance", "pause"],
            ["slow", "pop in", "janky", "load"],
          ];
          const d = t.description.toLowerCase();
          return issues.filter((words) => hasAny(d, words)).length >= 5;
        },
      },
      {
        name: "corrected policy fact survives (30 day -> 14 day)",
        test: (t) => hasAny(t.description, ["30 day", "30-day"]) && hasAny(t.description, ["14 day", "14-day", "14 days"]),
      },
    ],
  },
  {
    name: "hedged",
    kind: "Hedged/uncertain note",
    expect:
      "Hedges carry meaning for the analysis AI's verdict logic — 'I think' / 'maybe' / 'not sure' must survive polishing.",
    transcript:
      "I think the spacing in this card is off, maybe like 20 pixels too tight at the top, but I'm not sure, it just looks cramped to me",
    context: ctx({
      elementTag: "div",
      ancestorTrail: 'main > section "Plans"',
      subtreeText: "Pro For growing teams $29 Choose Pro",
      semanticIdentifier: "",
      semanticType: "card",
      computedStyles: "bg: #FFFFFF; padding: 32px; border-radius: 12px; size: 380x400px",
      childrenList:
        '(3 meaningful descendants)\n1. h3: "Pro" (color: #15101F; font: 20px; font-weight: 600; size: 320x28px)\n2. p: "For growing teams" (color: #54495F; font: 14px; size: 320x20px)\n3. button: "Choose Pro" (color: #FFFFFF; bg: #5A49BF; font: 14px; size: 320x44px)',
    }),
    checks: [
      {
        name: "hedge survives (uncertainty language preserved, not stated as fact)",
        test: (t) =>
          hasAny(t.description, [
            "i think", "maybe", "not sure", "not certain", "may be",
            "seems", "looks", "feels", "around", "about", "possibly",
          ]),
      },
      {
        name: "estimate kept as estimate (~20px, not stated as fact-from-DOM)",
        test: (t) => hasAny(t.description, ["20"]),
      },
      {
        name: "user's qualitative word survives (cramped)",
        test: (t) => hasAny(t.description + " " + t.title, ["cramped", "tight"]),
      },
    ],
  },
  {
    name: "ancestor-grounding",
    kind: "Deictic on an unlabeled container — only the ancestor is named [Wave 2 target]",
    expect:
      "Clicked an anonymous div whose children are also unnamed; the breadcrumb names the 'Customer testimonials' section. Should qualify the subject via the ancestor instead of a bare 'section'.",
    transcript:
      "this whole section feels way too crowded, everything is fighting for attention",
    context: ctx({
      elementTag: "div",
      ancestorTrail: 'main > section "Customer testimonials"',
      subtreeText:
        "Echly changed how we ship UI fixes Sarah K Design Lead The fastest feedback loop we have ever had Marcus T Engineering",
      semanticIdentifier: "",
      semanticType: "section",
      computedStyles: "size: 1180x520px",
      childrenList:
        '(2 meaningful descendants)\n1. div: "(no label)" (bg: #FFFFFF; padding: 24px; size: 560x240px)\n2. div: "(no label)" (bg: #FFFFFF; padding: 24px; size: 560x240px)',
    }),
    checks: [
      {
        name: "subject qualified via ancestor name ('Customer testimonials'/testimonials)",
        test: (t) => hasAny(t.title + " " + t.description, ["testimonial"]),
      },
      {
        name: "user's judgment preserved (crowded / fighting for attention)",
        test: (t) =>
          hasAny(t.description, ["crowded", "fighting for attention", "too much"]),
      },
      {
        name: "no invented specifics (no hex/px values — none were referenced)",
        test: (t) => !/#[0-9A-Fa-f]{6}|\d+px/.test(t.description),
      },
    ],
  },
  {
    name: "tray-minimal-context",
    kind: "Extension tray add-feedback: page-level context only [Wave 2 target]",
    expect:
      "No element clicked — the new fallback sends URL + page title/h1 + viewport. Should ground at page level without inventing an element.",
    transcript:
      "the invoices tab takes forever to load, like ten seconds sometimes",
    context: {
      url: "https://acme.com/settings/billing",
      scrollX: 0,
      scrollY: 0,
      viewportWidth: 1440,
      viewportHeight: 900,
      devicePixelRatio: 2,
      pageTitle: "Billing — Acme",
      pageH1: "Billing & plans",
      capturedAt: 0,
    },
    checks: [
      {
        name: "grounded at page level (billing referenced)",
        test: (t) => hasAny(t.title + " " + t.pageArea, ["billing"]),
      },
      {
        name: "subject preserved (invoices tab)",
        test: (t) => hasAny(t.title + " " + t.description, ["invoices"]),
      },
      {
        name: "user's estimate preserved (ten seconds)",
        test: (t) => hasAny(t.description, ["ten seconds", "10 seconds", "10s"]),
      },
    ],
  },
  {
    name: "no-context-dashboard",
    kind: "Dashboard path: no context at all",
    expect:
      "Transcript only. Must not invent a page or element; bracket omitted; claim preserved.",
    transcript:
      "the onboarding emails are going out twice to new workspace members, two identical welcome emails within a minute",
    context: null,
    checks: [
      {
        name: "no invented page bracket in title",
        test: (t) => !t.title.startsWith("["),
      },
      {
        name: "claim preserved (twice / duplicate)",
        test: (t) => hasAny(t.description, ["twice", "two identical", "duplicate"]),
      },
      {
        name: "specifics survive (within a minute)",
        test: (t) => hasAny(t.description, ["minute"]),
      },
    ],
  },
];

/* ===== runner ===== */

async function runScenario(
  client: OpenAI,
  s: Scenario
): Promise<{ name: string; passed: number; failed: string[]; ticket: VoiceTicket }> {
  const domContext = buildDomContextForPipeline(s.context);
  const { json, raw } = await extractStructuredFeedback(client, s.transcript, domContext);
  const ticket: VoiceTicket = {
    title: (json.title ?? "").trim() || "Untitled feedback",
    description: (json.description ?? "").trim(),
    pageArea: (json.pageArea ?? "").trim(),
    tags: whitelistTags(json.tags),
  };

  const failed: string[] = [];
  let passed = 0;
  console.log(`\n${"=".repeat(72)}`);
  console.log(`SCENARIO  ${s.name}  (${s.kind})`);
  console.log(`EXPECT    ${s.expect}`);
  console.log(`${"-".repeat(72)}`);
  console.log(`TITLE     ${ticket.title}`);
  console.log(`PAGEAREA  ${ticket.pageArea}`);
  console.log(`TAGS      ${ticket.tags.join(", ")}`);
  console.log(`DESC      ${ticket.description.replace(/\n/g, "\n          ")}`);
  console.log(`${"-".repeat(72)}`);
  for (const c of s.checks) {
    let ok = false;
    try {
      ok = c.test(ticket, raw);
    } catch {
      ok = false;
    }
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${c.name}`);
    if (ok) passed++;
    else failed.push(c.name);
  }
  return { name: s.name, passed, failed, ticket };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY missing (.env.local)");
    process.exitCode = 1;
    return;
  }
  const requested = process.argv.slice(2);
  const scenarios =
    requested.length > 0
      ? SCENARIOS.filter((s) => requested.includes(s.name))
      : SCENARIOS;
  if (scenarios.length === 0) {
    console.error(
      `No matching scenarios. Available: ${SCENARIOS.map((s) => s.name).join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results: Array<{ name: string; passed: number; failed: string[] }> = [];
  for (const s of scenarios) {
    try {
      results.push(await runScenario(client, s));
    } catch (err) {
      console.error(`SCENARIO ${s.name} errored:`, err);
      results.push({ name: s.name, passed: 0, failed: ["(scenario errored)"] });
    }
  }

  console.log(`\n${"=".repeat(72)}`);
  console.log("SUMMARY");
  console.log(`${"-".repeat(72)}`);
  let totalPass = 0;
  let totalFail = 0;
  for (const r of results) {
    totalPass += r.passed;
    totalFail += r.failed.length;
    const status = r.failed.length === 0 ? "PASS" : "FAIL";
    console.log(`  ${status}  ${r.name}  (${r.passed} passed, ${r.failed.length} failed)`);
    for (const f of r.failed) console.log(`          - ${f}`);
  }
  console.log(`${"-".repeat(72)}`);
  console.log(`TOTAL: ${totalPass} passed, ${totalFail} failed across ${results.length} scenarios`);
  process.exitCode = totalFail === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
