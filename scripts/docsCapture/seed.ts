/**
 * Docs-screenshot SEED harness  (Route 2 — live seed into production echly-b74cc).
 *
 * Writes ONE isolated, clearly-marked sandbox workspace + session + tickets +
 * members + comments + activity + presence so the docs-capture Playwright run
 * (scripts/docsCapture/capture.ts) can shoot real, fully-rendered product UI.
 *
 * SAFETY / REVERSIBILITY
 *  - Every doc id is prefixed `zzz-docsseed-` so it sorts to the bottom of every
 *    collection and is trivially greppable in the console.
 *  - Every doc carries `_seedTag: SEED_TAG`.
 *  - One Firebase Auth user is created (the capture owner), id `zzz-docsseed-u-maya`.
 *  - scripts/docsCapture/teardown.ts deletes EXACTLY this set (by id + by _seedTag)
 *    and removes the auth user + storage objects. Nothing else is touched.
 *
 * Run:  npx tsx scripts/docsCapture/seed.ts
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

config({ path: ".env.local" });

export const SEED_TAG = "docs-capture-v1";
export const WS = "zzz-docsseed-ws";
export const SESS = "zzz-docsseed-sess";
export const SHOT = "zzz-docsseed-shot1";
const BASE = process.env.CAPTURE_BASE_URL || "http://localhost:3000";

// ── Admin init (standalone — cannot import the `server-only` admin modules) ──
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    : getApps()[0];
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });
const auth = getAuth(app);
const bucket = getStorage(app).bucket();

const tag = <T extends Record<string, unknown>>(o: T) => ({ ...o, _seedTag: SEED_TAG });
const av = (file: string) => `${BASE}/marketing/people/${file}`;
const now = Date.now();
const ago = (ms: number) => Timestamp.fromMillis(now - ms);
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

// ── People ───────────────────────────────────────────────────────────────────
const U = {
  maya: { uid: "zzz-docsseed-u-maya", name: "Maya Anand", email: "maya@northwind.studio", avatar: av("Maya.jpg") },
  sarah: { uid: "zzz-docsseed-u-sarah", name: "Sarah Kim", email: "sarah@northwind.studio", avatar: av("Sarah.jpg") },
  daniel: { uid: "zzz-docsseed-u-daniel", name: "Daniel Torres", email: "daniel@northwind.studio", avatar: av("Daniel.jpg") },
  anya: { uid: "zzz-docsseed-u-anya", name: "Anya Petrova", email: "anya@northwind.studio", avatar: av("Anya.jpg") },
  jordan: { uid: "zzz-docsseed-u-jordan", name: "Jordan Lee", email: "jordan@northwind.studio", avatar: av("Jordan.jpg") },
};
const members = [
  { ...U.maya, role: "OWNER" as const, joinedAt: ago(120 * DAY) },
  { ...U.sarah, role: "MEMBER" as const, joinedAt: ago(96 * DAY) },
  { ...U.daniel, role: "MEMBER" as const, joinedAt: ago(54 * DAY) },
  { ...U.anya, role: "MEMBER" as const, joinedAt: ago(20 * DAY) },
  { ...U.jordan, role: "MEMBER" as const, joinedAt: ago(6 * DAY) },
];

// ── Captured evidence for the hero ticket (T1) ────────────────────────────────
const t1Console = [
  { timestamp: now - 95 * MIN, level: "error", message: "Uncaught TypeError: Cannot read properties of null (reading 'getBoundingClientRect')", source: "promo-banner.js:142" },
  { timestamp: now - 95 * MIN, level: "warn", message: "[layout] Forced reflow while calculating sticky offset", source: "layout.js:88" },
  { timestamp: now - 96 * MIN, level: "info", message: "Promo banner A/B variant: sticky-top", source: "experiments.js:30" },
];
const t1Network = [
  net({ id: "n1", t: now - 96 * MIN, method: "GET", url: "https://shop.northwind.studio/api/cart", status: 200, ct: "application/json", dur: 88 }),
  net({ id: "n2", t: now - 95.6 * MIN, method: "POST", url: "https://shop.northwind.studio/api/promo/apply", status: 500, statusText: "Internal Server Error", ct: "application/json", dur: 612, errored: true, errorMessage: "500 Internal Server Error", kind: "http-5xx", reqBody: '{"code":"SPRING25","cartId":"c_8842"}', resBody: '{"error":"promo_engine_timeout","ref":"e_5f3a"}' }),
  net({ id: "n3", t: now - 95.4 * MIN, method: "GET", url: "https://shop.northwind.studio/assets/banner-bg.webp", status: 200, ct: "image/webp", dur: 41 }),
  net({ id: "n4", t: now - 95.2 * MIN, method: "GET", url: "https://shop.northwind.studio/api/inventory?sku=NW-204", status: 404, statusText: "Not Found", ct: "application/json", dur: 73, errored: true, errorMessage: "404 Not Found", kind: "http-4xx" }),
];
const t1Actions = [
  { id: "a1", type: "navigation", timestamp: now - 97 * MIN, url: "https://shop.northwind.studio/cart", navigationMethod: "load", viewport: { width: 375, height: 812 } },
  { id: "a2", type: "click", timestamp: now - 96 * MIN, element: { tag: "button", semanticType: "button", text: "Apply promo" } },
  { id: "a3", type: "input", timestamp: now - 95.8 * MIN, fieldLabel: "Promo code", element: { tag: "input", masked: false } },
  { id: "a4", type: "click", timestamp: now - 95.5 * MIN, element: { tag: "button", text: "Checkout", masked: false } },
];

function net(o: any) {
  return {
    id: o.id, timestamp: o.t, url: o.url, method: o.method,
    status: o.status ?? null, statusText: o.statusText ?? "OK", durationMs: o.dur ?? null,
    source: "fetch", kind: o.kind, replayed: false,
    requestHeaders: { accept: "application/json" }, responseHeaders: { "content-type": o.ct ?? "application/json" },
    requestBody: o.reqBody ?? null, requestBodyOriginalSize: o.reqBody ? o.reqBody.length : null, requestBodyTruncated: false,
    responseBody: o.resBody ?? null, responseBodyOriginalSize: o.resBody ? o.resBody.length : null, responseBodyTruncated: false,
    responseContentType: o.ct ?? "application/json", errored: !!o.errored, errorMessage: o.errorMessage ?? null,
    initiatorPage: "https://shop.northwind.studio/cart",
  };
}

// ── Tickets ───────────────────────────────────────────────────────────────────
const tickets = [
  {
    id: "zzz-docsseed-t1", title: "Checkout button overlaps promo banner at 375px",
    type: "bug", isResolved: false, status: "open", priority: "high",
    createdAt: ago(95 * MIN), assignee: U.sarah, creator: U.maya,
    description: "On iPhone (375px) the sticky promo banner covers the Checkout button — you can't tap it. Started after the spring-sale banner went live.",
    tags: ["mobile", "checkout", "regression"], url: "https://shop.northwind.studio/cart",
    screenshot: true,
    ai: {
      aiSignalRelation: "related", aiAnalysisStatus: "complete", aiConfidence: 0.82,
      aiSummary: "A null-reference in the promo banner's sticky-offset code stops the layout from reserving space, so the banner sits on top of the checkout button on narrow viewports.",
      aiCause: "promo-banner.js calls getBoundingClientRect() on a checkout node that isn't mounted yet at 375px, throwing before it can set the banner's reserved height.",
      aiFixSteps: [
        "Guard the getBoundingClientRect() call in promo-banner.js:142 against a null target.",
        "Reserve the banner height via CSS (padding-top on the cart container) instead of measuring at runtime.",
        "Add a 375px regression check to the checkout visual test.",
      ],
    },
    console: t1Console, network: t1Network, actions: t1Actions,
  },
  {
    id: "zzz-docsseed-t2", title: "Footer links 404 after the Tuesday deploy",
    type: "bug", isResolved: false, status: "open", priority: "medium",
    createdAt: ago(1 * DAY - 3 * HOUR), assignee: U.daniel, creator: U.jordan,
    description: "Every footer link (Privacy, Terms, Careers) returns a 404. Looks like the route prefix changed.",
    tags: ["routing", "regression"], url: "https://shop.northwind.studio/",
    ai: {
      aiSignalRelation: "related", aiAnalysisStatus: "complete", aiConfidence: 0.74,
      aiSummary: "Footer hrefs point at /pages/* but the deploy moved those routes under /legal/*, so every request 404s.",
      aiCause: "Stale hardcoded /pages/ prefix in the footer component after the routing refactor.",
      aiFixSteps: ["Update footer links to the /legal/* prefix.", "Add a redirect from /pages/* to /legal/* for shared links."],
    },
  },
  {
    id: "zzz-docsseed-t3", title: "Testimonial cards have uneven spacing on tablet",
    type: "design", isResolved: false, status: "open", priority: "low",
    createdAt: ago(2 * DAY - 2 * HOUR), assignee: null, creator: U.anya,
    description: "On iPad the three testimonial cards have different gaps between them — middle one looks cramped.",
    tags: ["design", "tablet"], url: "https://shop.northwind.studio/#testimonials",
    ai: {
      aiSignalRelation: "design_request", aiAnalysisStatus: "complete", aiConfidence: 0.6,
      aiSummary: "This is a spacing/visual-polish request on the testimonial grid, not a code fault — nothing in the capture indicates an error.",
      aiFixSuggestion: "Even out the column gap on the testimonial grid at the tablet breakpoint (use a single gap token rather than per-card margins).",
    },
  },
  {
    id: "zzz-docsseed-t4", title: "Onboarding welcome email never arrives",
    type: "bug", isResolved: false, status: "open", priority: "medium",
    createdAt: ago(3 * DAY), assignee: U.sarah, creator: U.daniel,
    description: "New signups say the welcome email doesn't show up. I signed up with a test address and waited 20 min — nothing.",
    tags: ["email"], url: "https://shop.northwind.studio/signup",
    ai: {
      aiSignalRelation: "unrelated", aiAnalysisStatus: "complete", aiConfidence: 0.55,
      aiSummary: "The capture shows the signup POST returning 200, so the front-end path is healthy. Email delivery happens server-side and isn't visible in this capture.",
      aiCause: null,
      aiFixSuggestion: "Captured signals look healthy on the client; the issue is likely server-side email delivery. Next: check the email provider logs and the welcome-email queue for this address.",
    },
  },
  {
    id: "zzz-docsseed-t5", title: "Pricing tier headers misaligned in Safari",
    type: "bug", isResolved: true, status: "resolved", priority: "medium",
    createdAt: ago(5 * DAY), assignee: U.daniel, creator: U.maya,
    description: "The three pricing tier headers don't line up in Safari — middle one sits a few px lower.",
    tags: ["css", "safari"], url: "https://shop.northwind.studio/pricing",
    ai: {
      aiSignalRelation: "related", aiAnalysisStatus: "complete", aiConfidence: 0.8,
      aiSummary: "A flexbox baseline difference in Safari drops the featured tier header.",
      aiCause: "align-items: baseline on the tier header row renders differently in Safari for the badge-bearing column.",
      aiFixSteps: ["Switch the tier header row to align-items: flex-start.", "Pin the badge with absolute positioning so it doesn't shift the baseline."],
    },
  },
  {
    id: "zzz-docsseed-t6", title: "Mobile nav toggle loses its focus ring",
    type: "bug", isResolved: false, status: "open", priority: "low",
    createdAt: ago(4 * DAY - 5 * HOUR), assignee: null, creator: U.jordan,
    description: "Keyboard users can't see where focus is when tabbing to the hamburger menu.",
    tags: ["a11y"], url: "https://shop.northwind.studio/",
    ai: {
      aiSignalRelation: "no_signal", aiAnalysisStatus: "complete", aiConfidence: 0.5,
      aiSummary: "Nothing in the capture confirms or rules out the missing focus ring — there were no errors and no relevant network or console activity. The report still stands; the evidence just doesn't point at a cause.",
    },
  },
];

// ── Comments on T1 (thread + @mention + pinned-on-screenshot) ─────────────────
const comments = [
  { id: "zzz-docsseed-c1", feedbackId: "zzz-docsseed-t1", user: U.maya, message: "Reproduced on a real iPhone 13 mini. The Checkout button is completely under the banner.", createdAt: ago(92 * MIN), type: "text" },
  { id: "zzz-docsseed-c2", feedbackId: "zzz-docsseed-t1", user: U.sarah, message: "Pinned the exact overlap on the screenshot — the banner's bottom edge cuts right through the button.", createdAt: ago(70 * MIN), type: "pin", position: { xPercent: 50, yPercent: 78 } },
  { id: "zzz-docsseed-c3", feedbackId: "zzz-docsseed-t1", user: U.maya, message: "@Daniel Torres can you take this one? It's the spring-sale banner you shipped Monday.", createdAt: ago(40 * MIN), type: "text", mentioned: [U.daniel.uid] },
  { id: "zzz-docsseed-c4", feedbackId: "zzz-docsseed-t1", user: U.daniel, message: "On it — guarding the rect call and reserving the height in CSS. PR up shortly.", createdAt: ago(18 * MIN), type: "text" },
];

// ── Activity events (grouped-by-day feed) ─────────────────────────────────────
const activity = [
  { eventType: "comment.added", actor: U.daniel, feedbackId: "zzz-docsseed-t1", createdAt: ago(18 * MIN) },
  { eventType: "comment.added", actor: U.maya, feedbackId: "zzz-docsseed-t1", createdAt: ago(40 * MIN) },
  { eventType: "feedback.created", actor: U.maya, feedbackId: "zzz-docsseed-t1", createdAt: ago(95 * MIN) },
  { eventType: "feedback.created", actor: U.jordan, feedbackId: "zzz-docsseed-t2", createdAt: ago(1 * DAY - 3 * HOUR) },
  { eventType: "feedback.resolved", actor: U.daniel, feedbackId: "zzz-docsseed-t5", createdAt: ago(1 * DAY - 6 * HOUR) },
  { eventType: "feedback.created", actor: U.anya, feedbackId: "zzz-docsseed-t3", createdAt: ago(2 * DAY - 2 * HOUR) },
  { eventType: "feedback.created", actor: U.daniel, feedbackId: "zzz-docsseed-t4", createdAt: ago(3 * DAY) },
  { eventType: "feedback.created", actor: U.jordan, feedbackId: "zzz-docsseed-t6", createdAt: ago(4 * DAY - 5 * HOUR) },
];

async function main() {
  console.log(`\n[seed] Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`[seed] Avatars base URL: ${BASE}`);
  console.log(`[seed] Tag: ${SEED_TAG}\n`);

  // 1) Owner auth user + claims (only the owner signs in).
  await auth.updateUser(U.maya.uid, { email: U.maya.email, displayName: U.maya.name, emailVerified: true })
    .catch(() => auth.createUser({ uid: U.maya.uid, email: U.maya.email, displayName: U.maya.name, emailVerified: true }));
  await auth.setCustomUserClaims(U.maya.uid, { workspaceId: WS, workspaceIds: [WS] });
  console.log(`[seed] auth user + claims set: ${U.maya.uid}`);

  // 2) Screenshot object in Storage (sessions/{sid}/screenshots/{id}.png).
  const shotSrc = "public/marketing/screenshots/ticket-screenshot-cta-overlap.jpg";
  await bucket.file(`sessions/${SESS}/screenshots/${SHOT}.png`).save(readFileSync(shotSrc), {
    contentType: "image/png", metadata: { metadata: { seedTag: SEED_TAG } },
  });
  console.log(`[seed] screenshot uploaded -> sessions/${SESS}/screenshots/${SHOT}.png`);

  const batch = db.batch();

  // 3) Workspace.
  batch.set(db.doc(`workspaces/${WS}`), tag({
    id: WS, name: "Northwind Studio", slug: "northwind-studio", ownerId: U.maya.uid,
    createdAt: ago(120 * DAY), updatedAt: ago(1 * HOUR),
    logoUrl: null, brandLogoUrl: null,
    appearance: { logoOnFeedbackScreen: true, accentColor: "#5A49BF", removeEchlyBranding: false },
    billing: { plan: "business", billingCycle: "monthly", seats: 5, nextBilledAt: ago(-12 * DAY) },
    usage: { sessionsCreated: 14, feedbackCreated: 122, feedbackCreatedThisMonth: 38, feedbackResetDate: new Date(now).toISOString().slice(0, 8) + "01", members: 5 },
    sessionCount: 14, archivedCount: 3,
  }));

  // 4) Members subcollection + userProfiles + owner user doc.
  for (const m of members) {
    batch.set(db.doc(`workspaces/${WS}/members/${m.uid}`), tag({
      uid: m.uid, email: m.email, displayName: m.name, avatarUrl: m.avatar, role: m.role,
      joinedAt: m.joinedAt, invitedBy: m.role === "OWNER" ? null : U.maya.uid,
    }));
    batch.set(db.doc(`userProfiles/${m.uid}`), tag({ uid: m.uid, displayName: m.name, avatarUrl: m.avatar }));
  }
  batch.set(db.doc(`users/${U.maya.uid}`), tag({
    uid: U.maya.uid, firstName: "Maya", lastName: "Anand", email: U.maya.email, avatarUrl: U.maya.avatar,
    workspaceId: WS, workspaceMemberships: [WS], onboardingCompleted: true,
  }));

  // 5) Session.
  batch.set(db.doc(`sessions/${SESS}`), tag({
    id: SESS, workspaceId: WS, title: "Acme storefront — pre-launch QA pass",
    createdByUserId: U.maya.uid, creatorName: U.maya.name,
    createdAt: ago(4 * DAY), updatedAt: ago(18 * MIN),
    accessLevel: "view", generalAccess: "restricted",
    viewCount: 9, openCount: 5, resolvedCount: 1, totalCount: 6, feedbackCount: 6, commentCount: 4,
    recentViewers: [
      { id: U.sarah.uid, displayName: U.sarah.name, avatarUrl: U.sarah.avatar, isAnonymous: false, viewedAt: now - 12 * MIN },
      { id: U.daniel.uid, displayName: U.daniel.name, avatarUrl: U.daniel.avatar, isAnonymous: false, viewedAt: now - 22 * MIN },
      { id: U.maya.uid, displayName: U.maya.name, avatarUrl: U.maya.avatar, isAnonymous: false, viewedAt: now - 4 * MIN },
    ],
  }));

  // 6) Session members + sessionAccess mirror. Populates the Share dialog's
  //    "People with access" list and unlocks session-scoped listeners.
  const sessionPeople = [
    { u: U.maya, access: "resolve" as const },
    { u: U.sarah, access: "resolve" as const },
    { u: U.daniel, access: "view" as const },
  ];
  for (const { u, access } of sessionPeople) {
    batch.set(db.doc(`sessions/${SESS}/members/${u.uid}`), tag({
      userId: u.uid, email: u.email, access, addedBy: U.maya.uid, createdAt: ago(4 * DAY),
    }));
    batch.set(db.doc(`sessionAccess/${u.uid}_${SESS}`), tag({
      userId: u.uid, sessionId: SESS, workspaceId: WS, accessLevel: access, addedBy: U.maya.uid, createdAt: ago(4 * DAY),
    }));
  }

  // 7) Tickets.
  for (const t of tickets) {
    const cl = (t as any).console as any[] | undefined;
    const nr = (t as any).network as any[] | undefined;
    const ua = (t as any).actions as any[] | undefined;
    batch.set(db.doc(`feedback/${t.id}`), tag({
      id: t.id, workspaceId: WS, sessionId: SESS, userId: t.creator.uid, title: t.title, type: t.type,
      isResolved: t.isResolved, status: t.status, priority: t.priority, createdAt: t.createdAt,
      description: t.description, tags: t.tags, url: t.url,
      viewportWidth: 375, viewportHeight: 812, devicePixelRatio: 3,
      assigneeId: t.assignee?.uid ?? null, assigneeName: t.assignee?.name ?? null, assigneeAvatarUrl: t.assignee?.avatar ?? null,
      creatorName: t.creator.name, creatorAvatarUrl: t.creator.avatar,
      screenshotId: (t as any).screenshot ? SHOT : null,
      screenshotStatus: (t as any).screenshot ? "attached" : "none",
      mentionedUserIds: t.id === "zzz-docsseed-t1" ? [U.daniel.uid] : null,
      commentCount: t.id === "zzz-docsseed-t1" ? comments.length : 0,
      lastCommentAt: t.id === "zzz-docsseed-t1" ? ago(18 * MIN) : null,
      lastCommentByName: t.id === "zzz-docsseed-t1" ? U.daniel.name : null,
      consoleLogs: cl ?? null, consoleLogCount: cl?.length ?? 0,
      errorCount: cl?.filter((c) => c.level === "error").length ?? 0,
      warningCount: cl?.filter((c) => c.level === "warn").length ?? 0,
      networkRequests: nr ?? null, networkRequestCount: nr?.length ?? 0,
      networkErrorCount: nr?.filter((n) => n.errored || (n.status ?? 0) >= 400).length ?? 0,
      userActions: ua ?? null, userActionCount: ua?.length ?? 0,
      ...t.ai, aiGeneratedAt: ago(90 * MIN),
    }));
  }

  // 8) Comments.
  for (const c of comments) {
    batch.set(db.doc(`comments/${c.id}`), tag({
      id: c.id, workspaceId: WS, sessionId: SESS, feedbackId: c.feedbackId,
      userId: c.user.uid, userName: c.user.name, userAvatar: c.user.avatar,
      message: c.message, createdAt: c.createdAt, type: c.type,
      ...(c.position ? { position: c.position } : {}),
      ...(c.mentioned ? { mentionedUserIds: c.mentioned } : {}),
    }));
  }

  // 9) Activity events. metadata.feedbackTitle/sessionTitle drive the feed copy
  //    (components/activity/ActivityItem.tsx) — without them rows read "untitled
  //    ticket" / "a session".
  const SESSION_TITLE = "Acme storefront — pre-launch QA pass";
  const titleOf = Object.fromEntries(tickets.map((t) => [t.id, t.title]));
  for (let i = 0; i < activity.length; i++) {
    const e = activity[i];
    batch.set(db.doc(`workspaces/${WS}/activityEvents/zzz-docsseed-ae-${i}`), tag({
      id: `zzz-docsseed-ae-${i}`, eventType: e.eventType, workspaceId: WS, sessionId: SESS, feedbackId: e.feedbackId,
      actor: { id: e.actor.uid, name: e.actor.name, photoURL: e.actor.avatar },
      metadata: { feedbackTitle: titleOf[e.feedbackId], sessionTitle: SESSION_TITLE },
      createdAt: e.createdAt,
    }));
  }

  // 10) Presence (live viewers on the session).
  for (const m of [U.maya, U.sarah, U.daniel]) {
    batch.set(db.doc(`sessions/${SESS}/presence/${m.uid}`), tag({
      userId: m.uid, displayName: m.name, photoURL: m.avatar, lastSeen: ago(1 * MIN),
    }));
  }

  await batch.commit();
  console.log(`\n[seed] DONE.`);
  console.log(`[seed]   workspace : ${WS}`);
  console.log(`[seed]   session   : ${SESS}  ->  ${BASE}/session/${SESS}  (and /dashboard)`);
  console.log(`[seed]   tickets   : ${tickets.length}, comments ${comments.length}, members ${members.length}, activity ${activity.length}`);
  console.log(`[seed]   owner uid : ${U.maya.uid}  (sign in via custom token)\n`);
  process.exit(0);
}

main().catch((e) => { console.error("[seed] FAILED:", e); process.exit(1); });
