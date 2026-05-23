/**
 * sessionMockData — static demo content for the Phase 2C session-view forklift.
 *
 * One session ("Q2 client QA · May 18") framed as Studio Northwind's quarterly
 * design-QA pass across a portfolio of client products. 6 tickets (5 open + 1
 * resolved), matching the SESSION_PAGE_DESIGN_SPEC hero-card copy ("6 tickets in
 * this session"). Each ticket captures feedback on a different client surface
 * (fintech onboarding, analytics dashboard, e-commerce PDP, SaaS settings,
 * notification center, ticket upload) to show Annote works across any product.
 *
 * Shapes mirror the production domain types just enough for the forklifted
 * components to consume them via `useStaticFeedbackController`:
 *   - tickets carry the FeedbackItemShape fields the detail pane reads
 *     (id/title/type/isResolved/description/tags/screenshotId + capture meta)
 *   - comments carry the Comment fields CommentItem renders
 *     (id/userName/userAvatar/userId/message/createdAt/reactions/threadId)
 *
 * NO Firebase, NO providers — pure literals. `minutesAgo` on each comment is
 * resolved to a {seconds} pseudo-Timestamp in useStaticFeedbackController so the
 * human label renders without any live clock or date-fns drift.
 *
 * NOTE: screenshot.src paths currently reuse the original 6 placeholder images
 * while the per-ticket screenshots are regenerated. Once the new images land in
 * /public/marketing/screenshots/ (onboarding-back, dashboard-legend,
 * ecommerce-cart, settings-double-save, notification-badge, upload-stuck), swap
 * each src to its new filename and delete the old placeholders.
 */

export interface MockReaction {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface MockComment {
  id: string;
  authorName: string;
  authorInitials: string;
  /** uid-like seed; also the avatar fallback color seed. */
  userId: string;
  avatarColor: string;
  /** Real-photo URL for this commenter; falls back to color+initials if absent. */
  avatarUrl?: string;
  body: string;
  /** Minutes-ago offset used to derive a {seconds} pseudo-Timestamp. */
  minutesAgo: number;
  reactions: MockReaction[];
  /** When set, this comment is a reply under the root with this id. */
  threadId?: string;
}

export type MockTicketStatus = "open" | "resolved";

export interface MockScreenshot {
  /** Path to the real screenshot image under /public/marketing/screenshots/. */
  src: string;
  /** Single static pin position (percentage of frame) + display number. */
  pin: { x: number; y: number; number: number };
}

export interface MockTicket {
  id: string;
  index: number;
  title: string;
  status: MockTicketStatus;
  description: string;
  tags: string[];
  /** Marketing-only meta row (page URL · browser · OS). */
  pageMetadata: { url: string; browser: string; os: string };
  screenshot: MockScreenshot;
  comments: MockComment[];
  participants: string[];
}

export const MOCK_SESSION = {
  id: "demo-session-portfolio-qa",
  title: "Q2 client QA · May 18",
  workspaceName: "Studio Northwind",
  url: "multiple",
  shareUrl: "annote.app/s/q2-client-qa-may18",
  viewers: [
    { id: "v1", name: "Maya Anand", avatarUrl: "/marketing/people/maya-anand.jpg", initials: "MA" },
    { id: "v2", name: "Daniel Torres", avatarUrl: "/marketing/people/daniel-torres.jpg", initials: "DT" },
    { id: "v3", name: "Sarah Kim", avatarUrl: "/marketing/people/sarah-kim.jpg", initials: "SK" },
    { id: "v4", name: "Alex Nguyen", avatarUrl: "/marketing/people/alex-nguyen.jpg", initials: "AN" },
  ],
} as const;

export const MOCK_TICKETS: MockTicket[] = [
  {
    id: "t1",
    index: 1,
    title: "Onboarding step skips when user clicks back arrow",
    status: "open",
    description:
      "On the account setup flow, clicking the browser back arrow during step 3 (identity verification) skips the user forward to step 5 instead of returning to step 2. State is being mutated forward when it should pop. Tested on Chrome and Safari, same behavior.",
    tags: ["onboarding", "navigation", "state-bug", "critical"],
    pageMetadata: { url: "app.northcap.com/setup/verify", browser: "Chrome 121", os: "macOS Sonoma" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-tier-headers.jpg", pin: { x: 30, y: 38, number: 1 } },
    comments: [
      {
        id: "c1",
        authorName: "Maya Anand",
        authorInitials: "MA",
        userId: "u-maya",
        avatarColor: "#7C3AED",
        body: "Found this during the Northcap audit. Pretty critical — users who back-button get a confusing skip-forward and have no way to recover their step 2 inputs.",
        minutesAgo: 0,
        reactions: [],
      },
      {
        id: "c2",
        authorName: "Daniel Torres",
        authorInitials: "DT",
        userId: "u-daniel",
        avatarColor: "#0EA5E9",
        body: "Picking this up. Looks like the router push is overwriting history.replaceState. 30-min fix.",
        minutesAgo: 12,
        reactions: [{ emoji: "👀", count: 2, mine: false }],
      },
    ],
    participants: ["Maya Anand", "Daniel Torres"],
  },
  {
    id: "t2",
    index: 2,
    title: "Dashboard chart legend overlaps data on dark mode",
    status: "open",
    description:
      "On the metrics dashboard in dark mode, the chart legend in the top-right corner overlaps the rightmost data points on the line chart, making them unreadable. Light mode positions the legend below the chart correctly. Specific to dark mode rendering.",
    tags: ["dashboard", "dark-mode", "data-viz"],
    pageMetadata: { url: "app.heliograph.io/dashboard", browser: "Chrome 121", os: "macOS Sonoma" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-cta-overlap.jpg", pin: { x: 64, y: 42, number: 1 } },
    comments: [
      {
        id: "c3",
        authorName: "Sarah Kim",
        authorInitials: "SK",
        userId: "u-sarah",
        avatarColor: "#10B981",
        body: "Easy fix — the legend positioning logic has a dark-mode override that ships the wrong coordinates. Should match the light-mode positioning.",
        minutesAgo: 34,
        reactions: [],
      },
    ],
    participants: ["Sarah Kim"],
  },
  {
    id: "t3",
    index: 3,
    title: "Add to cart button stays disabled after stock returns",
    status: "open",
    description:
      "On a product detail page, when an out-of-stock product becomes available again (via stock webhook), the \"Add to cart\" button remains disabled. Page refresh fixes it, but the live state should update without refresh. Real-time inventory listener is missing.",
    tags: ["e-commerce", "state-sync", "real-time"],
    pageMetadata: { url: "shop.willowgrove.co/products/oak-table-04", browser: "Safari 17", os: "macOS Sonoma" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-toggle-focus.jpg", pin: { x: 64, y: 56, number: 1 } },
    comments: [
      {
        id: "c4",
        authorName: "Alex Nguyen",
        authorInitials: "AN",
        userId: "u-alex",
        avatarColor: "#F59E0B",
        body: "This is going to bite us during the next sale event. Backend already pushes the stock update but the frontend isn't listening on the right channel.",
        minutesAgo: 60,
        reactions: [{ emoji: "✅", count: 1, mine: false }],
      },
    ],
    participants: ["Alex Nguyen"],
  },
  {
    id: "t4",
    index: 4,
    title: "Settings save fires twice on Enter key",
    status: "open",
    description:
      "In the workspace settings panel, pressing Enter to submit the form fires the save handler twice — once for the form submit and once for the bound key handler. Results in two API calls. Should debounce or remove duplicate handler.",
    tags: ["settings", "form", "event-handlers"],
    pageMetadata: { url: "app.junction.dev/settings/workspace", browser: "Firefox 124", os: "macOS Sonoma" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-faq-chevron.jpg", pin: { x: 38, y: 72, number: 1 } },
    comments: [
      {
        id: "c5",
        authorName: "Daniel Torres",
        authorInitials: "DT",
        userId: "u-daniel",
        avatarColor: "#0EA5E9",
        body: "Standard form duplicate-handler bug. The keydown listener on the input is firing the save AND the form's onSubmit fires it again. Removing the keydown.",
        minutesAgo: 120,
        reactions: [],
      },
    ],
    participants: ["Daniel Torres"],
  },
  {
    id: "t5",
    index: 5,
    title: "Notification badge persists after marking all read",
    status: "open",
    description:
      "In the notification center, after clicking \"Mark all as read\", the red badge counter on the bell icon doesn't clear. Notifications themselves appear correctly marked read in the dropdown, but the badge count stays. Refresh fixes. State sync issue between dropdown and badge counter.",
    tags: ["notifications", "state-sync", "ui"],
    pageMetadata: { url: "app.stormwind.so/inbox", browser: "Chrome 121", os: "Windows 11" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-footer-404.jpg", pin: { x: 66, y: 34, number: 1 } },
    comments: [
      {
        id: "c6",
        authorName: "Maya Anand",
        authorInitials: "MA",
        userId: "u-maya",
        avatarColor: "#7C3AED",
        body: "The unread count is sourced from a separate hook that doesn't resubscribe when the bulk-mark-read mutation fires. Need to invalidate the count query too.",
        minutesAgo: 180,
        reactions: [],
      },
      {
        id: "c7",
        authorName: "Sarah Kim",
        authorInitials: "SK",
        userId: "u-sarah",
        avatarColor: "#10B981",
        body: "Will push the fix in this afternoon's deploy.",
        minutesAgo: 120,
        threadId: "c6",
        reactions: [{ emoji: "🎉", count: 1, mine: false }],
      },
    ],
    participants: ["Maya Anand", "Sarah Kim"],
  },
  {
    id: "t6",
    index: 6,
    title: "Image upload progress bar gets stuck at 99%",
    status: "resolved",
    description:
      "When attaching images to tickets, the upload progress bar reaches 99% and visually stalls there even after the upload completes successfully. The image appears in the ticket fine but the progress UI never reaches 100% before disappearing. Visual completeness issue.",
    tags: ["upload", "progress-ui", "polish"],
    pageMetadata: { url: "app.junction.dev/tickets/new", browser: "Chrome 121", os: "macOS Sonoma" },
    screenshot: { src: "/marketing/screenshots/ticket-screenshot-testimonial-gap.jpg", pin: { x: 50, y: 62, number: 1 } },
    comments: [
      {
        id: "c8",
        authorName: "Alex Nguyen",
        authorInitials: "AN",
        userId: "u-alex",
        avatarColor: "#F59E0B",
        body: "The progress event chain terminates at the last chunk's onProgress, never fires a final 100. Quick fix to force a final 100 emission on success callback.",
        minutesAgo: 1440,
        reactions: [],
      },
      {
        id: "c9",
        authorName: "Daniel Torres",
        authorInitials: "DT",
        userId: "u-daniel",
        avatarColor: "#0EA5E9",
        body: "Shipped the fix. Closing.",
        minutesAgo: 1440,
        threadId: "c8",
        reactions: [{ emoji: "✅", count: 2, mine: false }],
      },
    ],
    participants: ["Alex Nguyen", "Daniel Torres"],
  },
];

// Two workspace members (Maya = Owner, Daniel = Member). Sarah Kim remains a
// live viewer in MOCK_SESSION.viewers but is NOT a permanent member.
export const MOCK_WORKSPACE_MEMBERS = [
  { uid: "u-maya", displayName: "Maya Anand", email: "maya@studionorthwind.com", role: "OWNER" as const, avatarUrl: "/marketing/people/maya-anand.jpg" },
  { uid: "u-daniel", displayName: "Daniel Torres", email: "daniel@studionorthwind.com", role: "MEMBER" as const, avatarUrl: "/marketing/people/daniel-torres.jpg" },
];
