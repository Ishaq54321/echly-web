/**
 * Mock data for SessionsDemo. Extracted from the inline data that lived in
 * Phase 2A's SessionsDetail.tsx, with copy adjusted to reference the canonical
 * marketing universe (Northwind Studio reviewing the Loomly pricing flow).
 */

export type DemoTicketStatus = "open" | "progress" | "review" | "resolved";

export type DemoComment = {
  avatar: "a1" | "a2" | "a3";
  name: string;
  text: string;
};

export type DemoSessionTicket = {
  title: string;
  page: string;
  browser: string;
  os: string;
  status: DemoTicketStatus;
  statusLabel: string;
  comments: ReadonlyArray<DemoComment>;
};

export const SESSIONS_DEMO_SHARE_URL =
  "annote.app/s/loomly-pricing-may18";

export const SESSIONS_DEMO_NAME = "Loomly · pricing QA · May 18";

export const SESSIONS_DEMO_TICKETS: ReadonlyArray<DemoSessionTicket> = [
  {
    title: "Get Started CTA overlaps pricing card on iPhone (<480px)",
    page: "loomly.com/pricing",
    browser: "Safari 17",
    os: "iOS 17",
    status: "open",
    statusLabel: "Open",
    comments: [
      {
        avatar: "a1",
        name: "Maya",
        text: "Repro on iPhone 14 — the gradient pushes the CTA into the first tier card. Suggested fix: bump bottom margin to 24px below 480px.",
      },
      {
        avatar: "a2",
        name: "Daniel",
        text: "Picking this up — looks like the sm: breakpoint is missing on the hero wrapper. 30-min fix.",
      },
    ],
  },
  {
    title: "Hero gradient washes brand-pink out on Safari mobile",
    page: "loomly.com/pricing",
    browser: "Safari 17",
    os: "iOS 17",
    status: "progress",
    statusLabel: "In progress",
    comments: [
      {
        avatar: "a3",
        name: "Sarah",
        text: "Same gradient renders fine on Chrome iOS — feels like a color-space interpretation issue.",
      },
      {
        avatar: "a1",
        name: "Maya",
        text: "Tested with explicit sRGB stops, looking better. PR up.",
      },
    ],
  },
  {
    title: "Build card type drops below brand minimum at md",
    page: "loomly.com/pricing",
    browser: "Chrome 124",
    os: "macOS",
    status: "review",
    statusLabel: "In review",
    comments: [
      {
        avatar: "a2",
        name: "Daniel",
        text: "Bumped body to 14px and re-stacked the grid so it still resolves 3-up.",
      },
      {
        avatar: "a3",
        name: "Sarah",
        text: "Reads much better. Ready to ship.",
      },
    ],
  },
  {
    title: "Pricing card stack overlapped below 480px viewport",
    page: "loomly.com/pricing",
    browser: "Safari 17",
    os: "iOS 17",
    status: "resolved",
    statusLabel: "Resolved",
    comments: [
      {
        avatar: "a1",
        name: "Maya",
        text: "Stacked at sm with a 16px gap. Verified on iPhone SE viewport.",
      },
      {
        avatar: "a3",
        name: "Sarah",
        text: "Confirmed — closing out.",
      },
    ],
  },
  {
    title: "Footer link spacing inconsistent vs top nav",
    page: "loomly.com/pricing",
    browser: "Chrome 124",
    os: "macOS",
    status: "open",
    statusLabel: "Open",
    comments: [
      {
        avatar: "a3",
        name: "Sarah",
        text: "Footer uses 12px rhythm, top nav uses 16px. Pick one — recommend 16px throughout.",
      },
    ],
  },
  {
    title: "Mobile menu animation jitters on iOS Safari",
    page: "loomly.com/pricing",
    browser: "Safari 17",
    os: "iOS 17",
    status: "progress",
    statusLabel: "In progress",
    comments: [
      {
        avatar: "a2",
        name: "Daniel",
        text: "Switching the slide-in to transform3d to get GPU acceleration. Will push tonight.",
      },
    ],
  },
];
