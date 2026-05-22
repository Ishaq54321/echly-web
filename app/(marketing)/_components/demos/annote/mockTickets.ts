/**
 * Mock demo tickets for the interactive HeroCaptureDemo (v6).
 *
 * Marketing-only data — NOT a forklift. The real extension's tray is populated
 * from live session state (state.pointers in CaptureWidget.tsx). For the demo we
 * hardcode a believable in-progress session so the tray never reads as empty.
 *
 * v6 makes each ticket independently clickable: clicking a tray row opens the
 * EditModal pre-populated with that ticket's full data (description, tags, and a
 * type-specific mock screenshot). So every ticket now carries its complete
 * EditModal payload, not just the collapsed-row fields.
 *
 * Each ticket maps to a Lucide icon via the `type` field (see iconForType in
 * ./icons) and to a mock screenshot component via `screenshot.type` (see
 * ./screenshots/index).
 */

/** Drives the collapsed-row icon (iconForType) + EditModal header chip. */
export type DemoTicketType =
  | "bug"
  | "copy"
  | "ui"
  | "broken-link"
  | "content";

/** Which mock screenshot component renders inside the EditModal. */
export type ScreenshotType =
  | "mobile-login"
  | "landing-section"
  | "pricing-card"
  | "footer"
  | "demo-site-hero";

export interface ScreenshotData {
  type: ScreenshotType;
  /** Which region the captured highlight rectangle frames (per-screenshot key). */
  highlight: string;
}

export interface MockTicket {
  id: string;
  title: string;
  type: DemoTicketType;
  /** Collapsed row shows "<n> tags"; kept in sync with tags.length. */
  tagCount: number;
  /** When true, the row plays the success-flash glow (the freshly-captured one). */
  isNew?: boolean;

  // ── Full data for the EditModal ──
  description: string;
  tags: string[];
  screenshot: ScreenshotData;
  /** Metadata surfaced through the screenshot-info tooltip. */
  element: string;
  browser: string;
  url: string;
}

/** Five tickets already captured — the session-in-progress baseline. */
export const MOCK_DEMO_TICKETS: MockTicket[] = [
  {
    id: "t1",
    title: "[Annote] Login button not working on mobile",
    type: "bug",
    tagCount: 4,
    description:
      "Tapping the login button on mobile devices does not trigger any visible response. Users report the button appears tappable but no action occurs after multiple attempts. Likely related to event handler not firing on touch events.",
    tags: ["bug", "mobile", "auth", "critical"],
    screenshot: { type: "mobile-login", highlight: "submit-button" },
    element: "button.login-submit",
    browser: "Safari iOS 17 on iPhone 15",
    url: "https://app.example.com/login",
  },
  {
    id: "t2",
    title: '[Annote] Make "Three moments" section more skimmable',
    type: "copy",
    tagCount: 4,
    description:
      "The Three moments section currently has dense paragraphs of body copy under each heading. Consider breaking into bulleted lists or shorter sentences to improve scanability for first-time visitors.",
    tags: ["copy", "ux", "marketing", "scanability"],
    screenshot: { type: "landing-section", highlight: "three-blocks" },
    element: "section.three-moments",
    browser: "Chrome 120 on macOS",
    url: "https://example.com/",
  },
  {
    id: "t3",
    title: "[Annote] Pricing card hover state feels slow",
    type: "ui",
    tagCount: 4,
    description:
      "The pricing card lift animation on hover currently takes 400ms with a heavy easing curve. It feels sluggish compared to the rest of the site's interactions. Reduce to ~200ms with a snappier ease-out.",
    tags: ["ui", "polish", "animation", "pricing"],
    screenshot: { type: "pricing-card", highlight: "hover-state" },
    element: "div.pricing-card.is-pro",
    browser: "Chrome 120 on macOS",
    url: "https://example.com/pricing",
  },
  {
    id: "t4",
    title: '[Annote] Footer link "Status" goes to wrong URL',
    type: "broken-link",
    tagCount: 4,
    description:
      "The Status link in the footer currently redirects to /old-status which 404s. Should point to the new status page at status.annote.ai.",
    tags: ["bug", "broken-link", "footer", "low-effort"],
    screenshot: { type: "footer", highlight: "status-link" },
    element: "footer a[href='/old-status']",
    browser: "Firefox 121 on Windows",
    url: "https://example.com/",
  },
  {
    id: "t5",
    title: "[Annote] Add testimonial from agency customer",
    type: "content",
    tagCount: 4,
    description:
      "We have positive feedback from Northwind Studio and Studio Foreground but no testimonials section on the landing page. Adding 2-3 quotes near the pricing section could increase conversion.",
    tags: ["content", "social-proof", "conversion", "marketing"],
    screenshot: { type: "landing-section", highlight: "testimonial-slot" },
    element: "section.pricing",
    browser: "Chrome 120 on macOS",
    url: "https://example.com/pricing",
  },
];

/** The ticket captured live during a demo interaction (lands on top with a glow). */
export const DEMO_CAPTURE_TICKET: MockTicket = {
  id: "t6-new",
  title: "[Demo Site] Hero copy could be clearer about the value prop",
  type: "copy",
  tagCount: 4,
  isNew: true,
  description:
    "The current headline doesn't communicate the specific value proposition. Consider replacing with copy that mentions concrete differentiation or outcomes. The supporting paragraph below could also be tightened.",
  tags: ["copy", "ux", "hero", "messaging"],
  screenshot: { type: "demo-site-hero", highlight: "headline" },
  element: "h1.hero-headline",
  browser: "Chrome 120 on macOS",
  url: "https://example-site.com/",
};

/** Full (untruncated) session title; the tray truncates it via CSS ellipsis. */
export const DEMO_SESSION_TITLE = "Annote · Feedback At The Speed Of Seeing It";

/**
 * The transcript the SpeechCaption types out word-by-word during recording.
 *
 * v9: shorter, tighter dictation (~120 chars) — still natural-sounding (the
 * em-dash pause, the quoted phrase) but less to absorb. Wraps to 2 lines in the
 * 380px caption box and types out in ~3s at the current per-word pace. The
 * AI-polished short title is the separate DEMO_CAPTURE_TICKET.title; this is the
 * raw voice.
 */
export const DEMO_TRANSCRIPT =
  "the hero copy doesn't really say what we do — \"build better software\" could be anything. let's make it more specific";
