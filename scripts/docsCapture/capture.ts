/**
 * Docs-screenshot CAPTURE harness (Playwright) — shoots the seeded sandbox.
 *
 * Auth strategy (two layers, both required):
 *   1. Middleware/server: inject signed `annote_session` + `email_verified` +
 *      `onboarded` cookies (jose, same SESSION_SECRET the app uses).
 *   2. Client Firestore listeners: sign in with a Firebase custom token in-page
 *      so the ID token carries the `workspaceIds` claim the security rules check.
 *      Persistence lands in the same IndexedDB store the app's own SDK reads.
 *
 * Usage:
 *   npx tsx scripts/docsCapture/capture.ts probe      # full-page shots of key surfaces
 *   npx tsx scripts/docsCapture/capture.ts <slotId>   # one slot
 *   npx tsx scripts/docsCapture/capture.ts            # all slots in the manifest
 */
import { config } from "dotenv";
import { mkdirSync } from "node:fs";
import { SignJWT } from "jose";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { chromium, type Page, type BrowserContext } from "playwright";
import { firebaseConfig } from "../../lib/firebase/config";

config({ path: ".env.local" });

const BASE = process.env.CAPTURE_BASE_URL || "http://localhost:3000";
const OUT = "public/docs/assets/shots";
const SESS = "zzz-docsseed-sess";
const OWNER = { uid: "zzz-docsseed-u-maya", email: "maya@northwind.studio", name: "Maya Anand" };
const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      })
    : getApps()[0];
const adminAuth = getAuth(app);

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET missing/too short");
  return new TextEncoder().encode(s);
}
const signJwt = (payload: Record<string, unknown>, days: number) =>
  new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt()
    .setExpirationTime(`${days * 24 * 60 * 60}s`).sign(secret());

async function seedCookies() {
  const sess = await signJwt({ uid: OWNER.uid, email: OWNER.email, name: OWNER.name }, 7);
  const ev = await signJwt({ uid: OWNER.uid }, 365);
  const ob = await signJwt({ uid: OWNER.uid }, 365);
  const url = new URL(BASE);
  const base = { domain: url.hostname, path: "/", httpOnly: true, secure: url.protocol === "https:", sameSite: "Lax" as const };
  return [
    { name: "annote_session", value: sess, ...base },
    { name: "email_verified", value: ev, ...base },
    { name: "onboarded", value: ob, ...base },
  ];
}

const SEED_PASSWORD = "DocsCapture!2026";

async function clientSignIn(page: Page) {
  // Drive the app's REAL login form so the app's own Firebase instance
  // authenticates natively — client Firestore listeners then pass the rules
  // with the workspaceIds custom claim already set on the user.
  await adminAuth.updateUser(OWNER.uid, { password: SEED_PASSWORD, emailVerified: true });
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').first().fill(OWNER.email);
  await page.locator('input[type="password"]').first().fill(SEED_PASSWORD);
  await page.getByRole("button", { name: /log in/i }).first().click();
  // App signs in via Firebase, POSTs /api/auth/session, then redirects off /login.
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 45000 });
  console.log(`[capture] logged in via form as ${OWNER.email} -> ${page.url()}`);
}

async function shoot(page: Page, name: string, opts: { selector?: string; clip?: { x: number; y: number; width: number; height: number }; fullPage?: boolean } = {}) {
  const path = `${OUT}/${name}.png`;
  if (opts.selector) {
    const el = page.locator(opts.selector).first();
    await el.waitFor({ state: "visible", timeout: 15000 });
    await el.screenshot({ path });
  } else {
    await page.screenshot({ path, fullPage: opts.fullPage ?? false, clip: opts.clip });
  }
  console.log(`[capture] wrote ${path}`);
}

async function probe(ctx: BrowserContext) {
  const page = await ctx.newPage();
  const surfaces: Array<[string, string]> = [
    ["probe-dashboard", `${BASE}/dashboard`],
    ["probe-session", `${BASE}/session/${SESS}`],
    ["probe-settings-workspace", `${BASE}/settings?tab=workspace`],
    ["probe-settings-billing", `${BASE}/settings?tab=billing`],
    ["probe-activity", `${BASE}/activity?sessionId=${SESS}`],
    ["probe-login", `${BASE}/login`],
  ];
  for (const [name, url] of surfaces) {
    try {
      // Realtime listeners keep the socket open, so "networkidle" never fires.
      // domcontentloaded + a generous settle handles both Turbopack first-compile
      // and client hydration/data load.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForLoadState("load", { timeout: 30000 }).catch(() => {});
      // Production-Firestore data APIs run in a ~6-9s waterfall; wait for real
      // seeded content to appear, then a short settle for animations/avatars.
      await page.getByText(/Northwind Studio|Acme storefront|Checkout button|Footer links|Maya Anand/i)
        .first().waitFor({ state: "visible", timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(3000);
      await shoot(page, name, { fullPage: true });
    } catch (e) { console.warn(`[capture] ${name} FAILED: ${String(e).slice(0, 200)}`); }
  }
  await page.close();
}

const SETTLE = 3000;
const T1_TITLE = "Checkout button overlaps promo banner at 375px";

async function openSessionWithTicket(ctx: BrowserContext): Promise<Page> {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/session/${SESS}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.getByText(T1_TITLE).first().waitFor({ state: "visible", timeout: 30000 });
  await page.getByText(T1_TITLE).first().click();
  await page.waitForTimeout(SETTLE);
  return page;
}

async function step(name: string, fn: () => Promise<void>) {
  try { await fn(); console.log(`[capture] ✓ ${name}`); }
  catch (e) { console.warn(`[capture] ✗ ${name}: ${String(e).slice(0, 160)}`); }
}

async function captureAll(ctx: BrowserContext, only: string | null) {
  const want = (id: string) => !only || only === id;

  // ── gs-connect: logged-out login page (no auth needed, but fine here) ──
  if (want("gs-connect")) await step("gs-connect", async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(SETTLE);
    await shoot(p, "gs-connect", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    await p.close();
  });

  // ── Session-derived slots (one page, sequential interactions) ──
  if (["gs-capture", "tic-1", "tic-2", "tic-3", "tic-4", "cap-3", "shr-1"].some(want)) {
    const page = await openSessionWithTicket(ctx);

    // tic-3: ticket header (title + Resolve + assignee + priority)
    if (want("tic-3")) await step("tic-3", async () => {
      await shoot(page, "tic-3", { selector: "header.sticky" });
    });

    // Open Dev Tools panel
    await page.getByRole("button", { name: /dev tools/i }).first().click().catch(() => {});
    await page.waitForTimeout(1500);

    // tic-1 + gs-capture: AI tab (green related verdict)
    if (want("tic-1") || want("gs-capture")) await step("tic-1/ai", async () => {
      await page.getByRole("tab", { name: /^AI$/i }).first().click().catch(async () => {
        await page.getByText(/^AI$/).first().click().catch(() => {});
      });
      await page.waitForTimeout(2000);
      if (want("tic-1")) await shoot(page, "tic-1", { selector: ".ticket-activity-panel" });
      if (want("gs-capture")) await shoot(page, "gs-capture", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    });

    // tic-2: Network tab with the failing request expanded
    if (want("tic-2")) await step("tic-2/network", async () => {
      await page.getByRole("tab", { name: /network/i }).first().click().catch(async () => {
        await page.getByText(/^Network$/).first().click().catch(() => {});
      });
      await page.waitForTimeout(1500);
      await page.locator(".nettab-row").filter({ hasText: /promo|500/i }).first().click().catch(() => {});
      await page.waitForTimeout(1200);
      await shoot(page, "tic-2", { selector: ".ticket-activity-panel" });
    });

    // cap-3: Console tab (captured logs incl. an error) — distinct from tic-2
    if (want("cap-3")) await step("cap-3/console", async () => {
      await page.getByRole("tab", { name: /console/i }).first().click().catch(async () => {
        await page.getByText(/^Console$/).first().click().catch(() => {});
      });
      await page.waitForTimeout(1800);
      await shoot(page, "cap-3", { selector: ".ticket-activity-panel" });
    });

    // tic-4: inline comment thread with @mention + pinned comment
    if (want("tic-4")) await step("tic-4", async () => {
      // Close the Dev Tools panel so the detail comments are in the main column.
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(500);
      const anchor = page.getByText(/can you take this one/i).first();
      await anchor.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const list = page.locator("div.flex.flex-col.gap-1.min-w-0").filter({ has: page.locator(".mention-chip") }).first();
      if (await list.count()) await list.screenshot({ path: `${OUT}/tic-4.png` });
      else await shoot(page, "tic-4", { selector: ".content-wrapper" });
      console.log(`[capture] wrote ${OUT}/tic-4.png`);
    });

    // shr-1: Share dialog (longer settle for the people list to resolve)
    if (want("shr-1")) await step("shr-1", async () => {
      await page.getByRole("button", { name: /^share/i }).first().click();
      const modal = page.locator(".share-modal").first();
      await modal.waitFor({ state: "visible", timeout: 8000 });
      await page.waitForTimeout(4500);
      await modal.screenshot({ path: `${OUT}/shr-1.png` });
      console.log(`[capture] wrote ${OUT}/shr-1.png`);
    });

    await page.close();
  }

  // ── shr-2: activity feed grouped by day + presence ──
  if (want("shr-2")) await step("shr-2", async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/activity?sessionId=${SESS}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.getByText(/Maya Anand|Daniel Torres|resolved|commented|reported/i).first().waitFor({ state: "visible", timeout: 25000 }).catch(() => {});
    await p.waitForTimeout(SETTLE);
    await shoot(p, "shr-2", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    await p.close();
  });

  // ── adm-1: members table + invite ──
  if (want("adm-1")) await step("adm-1", async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/settings?tab=workspace`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.getByRole("button", { name: /invite member/i }).first().waitFor({ state: "visible", timeout: 25000 });
    await p.getByText("Maya Anand").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(SETTLE);
    // bring the Members card to the top of the viewport for a tight crop
    await p.getByText(/^Members$/).first().evaluate((el) => el.scrollIntoView({ block: "start" })).catch(() => {});
    await p.evaluate(() => window.scrollBy(0, -110)).catch(() => {});
    await p.waitForTimeout(1000);
    await shoot(p, "adm-1", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    await p.close();
  });

  // ── adm-2: billing plan card + usage meter ──
  if (want("adm-2")) await step("adm-2", async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/settings?tab=billing`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.getByText(/plan|usage|business|billing/i).first().waitFor({ state: "visible", timeout: 25000 }).catch(() => {});
    await p.waitForTimeout(SETTLE);
    // crop above the (slow-loading) billing-history list to avoid skeletons
    await shoot(p, "adm-2", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: 670 } });
    await p.close();
  });

  // ── adm-3: settings account tabs ──
  if (want("adm-3")) await step("adm-3", async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/settings?tab=profile`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.getByText(/My account|Settings/i).first().waitFor({ state: "visible", timeout: 25000 }).catch(() => {});
    await p.waitForTimeout(SETTLE);
    await shoot(p, "adm-3", { clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height } });
    await p.close();
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const mode = process.argv[2] || "all";
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
  await ctx.addCookies(await seedCookies());
  const signinPage = await ctx.newPage();
  await clientSignIn(signinPage);
  await signinPage.close();

  if (mode === "probe") {
    await probe(ctx);
  } else {
    await captureAll(ctx, mode === "all" ? null : mode);
  }

  await browser.close();
  console.log("[capture] done.");
  process.exit(0);
}
main().catch((e) => { console.error("[capture] FAILED:", e); process.exit(1); });
