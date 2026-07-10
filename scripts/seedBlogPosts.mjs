/**
 * Canonical content source for the 6-post blog set — REPOSITIONED copy
 * (2026-07-10): Annote as a direct Jam.dev competitor that does more —
 * every bug lands in ONE shared, collaborative session (assign, prioritize,
 * comment, resolve) for whole product teams. No "non-technical" framing.
 *
 * Modes:
 *   node scripts/seedBlogPosts.mjs
 *     Full seed: uploads covers from scripts/seed/covers/ and creates the
 *     posts (createIfNotExists — never clobbers existing docs).
 *
 *   PATCH_CONTENT=1 node scripts/seedBlogPosts.mjs
 *     Force-patches title/excerpt/metaTitle/metaDescription/body of all six
 *     EXISTING posts. Slug, cover, categories, author, and publishedAt are
 *     left untouched, so URLs and Studio edits to those fields survive.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── env ─────────────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const env = {};
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
  return { ...env, ...process.env };
}

const env = loadEnvLocal();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;
const apiBase = `https://${projectId}.api.sanity.io/v2026-02-01`;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

// ── markdown-ish → Portable Text ────────────────────────────────────────────
// Supports: "## " h2, "### " h3, "- " bullets, paragraphs, and inline
// **bold**, *italic*, [text](href). That covers everything in these bodies.

let keyCounter = 0;
const key = () => `s3${(keyCounter++).toString(36).padStart(4, "0")}`;

function parseInline(text) {
  const children = [];
  const markDefs = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  const pushText = (t) => {
    if (!t) return;
    // **bold** and *italic* in one pass (bold matched first)
    const emphRe = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let bl = 0;
    let bm;
    while ((bm = emphRe.exec(t))) {
      if (bm.index > bl)
        children.push({ _type: "span", _key: key(), text: t.slice(bl, bm.index), marks: [] });
      if (bm[1] !== undefined) {
        children.push({ _type: "span", _key: key(), text: bm[1], marks: ["strong"] });
      } else {
        children.push({ _type: "span", _key: key(), text: bm[2], marks: ["em"] });
      }
      bl = bm.index + bm[0].length;
    }
    if (bl < t.length)
      children.push({ _type: "span", _key: key(), text: t.slice(bl), marks: [] });
  };
  while ((m = linkRe.exec(text))) {
    pushText(text.slice(last, m.index));
    const defKey = key();
    markDefs.push({ _type: "link", _key: defKey, href: m[2] });
    children.push({ _type: "span", _key: key(), text: m[1], marks: [defKey] });
    last = m.index + m[0].length;
  }
  pushText(text.slice(last));
  return { children, markDefs };
}

function mdToBlocks(md) {
  const blocks = [];
  for (const rawLine of md.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    let style = "normal";
    let listItem;
    let text = line;
    if (line.startsWith("## ")) {
      style = "h2";
      text = line.slice(3);
    } else if (line.startsWith("### ")) {
      style = "h3";
      text = line.slice(4);
    } else if (line.startsWith("- ")) {
      listItem = "bullet";
      text = line.slice(2);
    }
    const { children, markDefs } = parseInline(text);
    const block = { _type: "block", _key: key(), style, markDefs, children };
    if (listItem) {
      block.listItem = listItem;
      block.level = 1;
    }
    blocks.push(block);
  }
  return blocks;
}

// ── content (repositioned: collaborative + organized bug workspace) ────────

const AUTHOR = { _type: "reference", _ref: "author-annote-team" };
const cat = (name) => [{ _type: "reference", _ref: `category-${name}`, _key: key() }];

const POSTS = [
  {
    _id: "post-jam-dev-alternatives",
    slug: "jam-dev-alternatives",
    title: "The best Jam.dev alternatives for 2026 (honest comparison)",
    excerpt:
      "Jam.dev is great at capturing a bug. But capturing is only half the job. Here's an honest look at the best Jam.dev alternatives in 2026 — and which ones turn a bug report into shared team work.",
    metaTitle: "The Best Jam.dev Alternatives for 2026 (Honest Comparison)",
    metaDescription:
      "Looking for a Jam.dev alternative? Compare the top bug reporting tools for 2026 on capture, collaboration, and workflow — and see which turns bug reports into a shared team workspace.",
    category: "guides",
    publishedAt: "2026-07-07T09:00:00Z",
    cover: "cover-1.png",
    coverAlt: "Choosing among bug reporting tool options — Annote blog cover",
    body: `
Jam.dev earned its 200,000+ users by making bug capture effortless: record the issue, and the console, network, and repro steps come attached. It's a genuinely good capture tool. But capturing a bug is only half the job — the other half is what your team *does* with it. Once a bug is captured, does it land in a shared workspace where your developers, PMs, and QA can assign it, prioritize it, discuss it, and resolve it together? Or does it become one more recording in a pile of scattered links? That question is where Jam alternatives start to separate.
## Capture is table stakes. Collaboration is the differentiator.
Most bug tools, Jam included, are built around the *individual report* — one person captures one bug and sends one link. That's fine until you're a team shipping real software, and then the cracks show:
- Feedback ends up **scattered** across recordings, Slack threads, and email, with no single place that holds it all.
- There's **no shared state** — no assignee, no priority, no status everyone can see.
- **Discussion happens elsewhere**, disconnected from the bug itself, so context gets lost.
The strongest Jam alternatives fix this by treating a bug report not as a one-off artifact but as an item in a shared, collaborative workspace.
## The best Jam.dev alternatives in 2026
### 1. Annote — best for turning bug reports into shared team work
Annote is a direct Jam competitor that does more with what it captures. You click the element that's broken and say what's wrong; Annote writes a structured ticket and attaches the screenshot plus the console, network, and your actions, with an AI that flags the likely cause. So far, comparable to Jam. The difference is what happens next.
Every capture lands in **one shared session** — an organized workspace, not a scattered pile of links — where your whole team collaborates:
- **Assign** each ticket to the right person.
- **Prioritize** with status and priority everyone can see.
- **Comment and discuss** directly on the ticket, with @mentions, so context stays attached to the bug.
- **Resolve** and track progress together, from open to resolved.
Instead of sending your team a dozen separate recordings, you send one link to a live session everyone works in together. That's the core edge: Jam captures the bug; Annote captures the bug *and* runs the workflow around it.
Best for: product teams (developers, PMs, and QA) who want their bug reports to live in one collaborative place.
### 2. Marker.io — best for pushing bugs into an existing tracker
Marker.io captures screenshots plus console and network data and syncs two-way into Jira, Linear, and similar. If your collaboration already lives in a formal issue tracker and you just want website feedback to flow into it, Marker.io fits.
### 3. BugHerd — best for a simple shared board
BugHerd pairs point-and-pin feedback with a built-in Kanban board and unlimited guests, giving teams a shared place to track issues. It's lighter on deep technical capture than Jam. (Weighing BugHerd itself? See our [BugHerd alternatives comparison](/blog/bugherd-alternatives).)
### 4. Userback — best for feedback beyond bugs
Userback broadens into product feedback — video feedback, session replay, and surveys — with shared boards. Choose it if you want feature feedback and bug capture together.
### 5. Bird Eats Bug — best for replayable recordings
Closest to Jam in spirit: screen recordings plus technical logs, good for intermittent bugs captured as a replayable trace.
## How to choose
Ask two questions, not one. First: *how good is the capture?* Second, and more important for a team: *what happens to the bug after it's captured?* If your team's bugs currently scatter across recordings and threads, the tool that consolidates them into one collaborative session — where you assign, prioritize, comment, and resolve together — will save you more time than a marginally better recording. That's the axis Annote competes on — we break the whole market down along it in [our bug reporting tools comparison](/blog/visual-bug-reporting-tools).
The honest test is quick: capture the same bug in two tools, then watch your team try to *act* on it. Which one keeps everyone on the same page? [Try Annote free](https://annote.ai) and see the shared-session workflow for yourself.
`,
  },
  {
    _id: "post-bugherd-alternatives",
    slug: "bugherd-alternatives",
    title: "BugHerd alternatives: 5 tools worth trying in 2026",
    excerpt:
      "BugHerd gives teams a shared board for client feedback — but it's not the only option, or the deepest. Here are five BugHerd alternatives worth trying in 2026, compared on how well they help teams collaborate.",
    metaTitle: "5 BugHerd Alternatives Worth Trying in 2026 (Compared)",
    metaDescription:
      "Comparing BugHerd alternatives? Here are five bug tracking and website feedback tools for 2026 — compared on capture, collaboration, and how well each keeps your team's bugs in one place.",
    category: "guides",
    publishedAt: "2026-06-30T09:00:00Z",
    cover: "cover-2.png",
    coverAlt: "Five tool options in a grid, one highlighted — Annote blog cover",
    body: `
BugHerd made its name giving teams a shared place to track website feedback: pin a comment to an element, manage it on a board, invite guests. The shared-board idea is exactly right — but teams often want more capture depth, AI diagnosis, or a tighter collaboration loop than BugHerd emphasizes. If that's you, here are five BugHerd alternatives worth trying in 2026, judged on the thing that actually matters for a team: how well they keep everyone working the same bugs in one place.
## 1. Annote
Annote takes BugHerd's shared-workspace instinct and deepens both halves — the capture *and* the collaboration. You click the broken element and say what's wrong; Annote writes a structured ticket and attaches the screenshot plus the console, network, and your actions, with an AI flagging the likely cause. Then every ticket lands in **one shared session** where your whole product team assigns, prioritizes, comments (with @mentions), and resolves together — no scattering across threads. Sessions open by a single link and can carry your logo. Where BugHerd is light on technical capture, Annote gives developers a complete, already-diagnosed ticket while keeping the whole team collaborating in one place. Best for product teams (devs, PMs, QA) who want organized *and* collaborative.
## 2. Marker.io
Strong two-way sync into Jira, Linear, and similar, with screenshot plus console/network capture. Best when your collaboration already lives in a formal tracker.
## 3. Userback
Broadens into product feedback — video, session replay, surveys — with shared boards. Good for feedback beyond bugs.
## 4. Jam
Developer-first capture with automatic console/network logs and AI repro steps. Excellent capture; lighter on the shared-workspace collaboration layer, since it centers on individual recordings.
## 5. Bird Eats Bug
Screen recordings plus technical logs — good for intermittent bugs as a replayable trace.
## Picking the right one
BugHerd's strength is a simple shared board. If you also want deep technical capture, AI diagnosis, and a real collaboration loop — assign, prioritize, comment, resolve, all in one session — look hardest at Annote and Marker.io. The fastest way to decide is to run one real bug through two tools and watch your *team* work it, not just the person who filed it. For the same analysis centered on Jam, see [the best Jam.dev alternatives](/blog/jam-dev-alternatives) — or take the market-wide view in [our bug reporting tools comparison](/blog/visual-bug-reporting-tools).
`,
  },
  {
    _id: "post-why-most-bug-reports-waste-20-minutes",
    slug: "why-most-bug-reports-waste-20-minutes",
    title: "Why scattered bug reports slow your team down (and what to do instead)",
    excerpt:
      "A bug report isn't just a message to a developer — it's shared work for your whole team. When reports scatter across recordings and threads, everyone slows down. Here's why, and what to do instead.",
    metaTitle: "Why Scattered Bug Reports Slow Your Team Down (And the Fix)",
    metaDescription:
      "Bug reports scattered across recordings, Slack, and email quietly slow your whole team down. Here's why — and how one shared, collaborative session fixes it.",
    category: "product",
    publishedAt: "2026-07-09T19:25:00Z",
    cover: "cover-3.png",
    coverAlt: "The cost of a vague bug report turning into a clean, diagnosed ticket — Annote blog cover",
    body: `
A bug report isn't really a message from one person to one developer. It's a piece of work your whole team touches — someone reports it, someone triages it, someone gets assigned, someone reviews it, someone resolves it. So when bug reports scatter across recordings, Slack threads, and email, you're not just losing a report — you're breaking the workflow around it. Here's why that quietly slows teams down, and how to fix it.
## The real cost isn't a bad report — it's a broken workflow
A single vague report costs a developer some reproduction time, sure. But the bigger, hidden cost is what happens across the *team*:
- **No shared source of truth.** When feedback lives in five places, nobody knows the full list of what's open. Bugs get missed, duplicated, or forgotten.
- **No shared state.** Without a visible assignee, priority, and status, two people work the same bug — or nobody does, because each assumes the other has it.
- **Disconnected discussion.** The conversation about a bug happens in a thread far from the bug itself, so context evaporates and gets re-explained.
Individually these are small frictions. Across a backlog and a team, they're the difference between a QA cycle that flows and one that stalls.
## What "organized" actually looks like
An organized bug workflow has three properties scattered reports lack:
- **One place.** Every bug for a project lives in a single shared session, so the whole team sees the same list.
- **Shared state.** Each bug has a visible assignee, priority, and status everyone can trust.
- **Attached discussion.** Comments and @mentions live *on* the bug, so context never leaves it.
## From capture to collaboration
Getting there starts with capture, but it doesn't end there. The reporter clicks the broken element and describes it in plain words; the tool captures the technical context automatically — screenshot, console, network, actions — and an AI flags the likely cause. Then, crucially, that ticket lands in a shared, collaborative session where the team takes over: assign it, prioritize it, comment on it, resolve it — together, in one place everyone can see.
That's the model Annote is built on: not a scattered pile of individual reports, but one organized session your whole team collaborates in. Capture the bug, then actually work it together. [See how it works](https://annote.ai). And if your feedback comes from clients and stakeholders too, here's [how to keep website feedback in one place your whole team can work from](/blog/collect-client-feedback-website).
`,
  },
  {
    _id: "post-manual-vs-automation-testing",
    slug: "manual-vs-automation-testing",
    title: "Manual vs automation testing: which does your team actually need?",
    excerpt:
      "Manual or automated testing? It's not either/or. Here's a practical breakdown of when each earns its place — and why, whichever you use, the bugs they find need one shared home your team can work from.",
    metaTitle: "Manual vs Automation Testing: Which Does Your Team Actually Need?",
    metaDescription:
      "Manual vs automation testing isn't either/or. Here's a clear breakdown of the pros, cons, and when to use each — plus why both need one shared place for the bugs they find.",
    category: "engineering",
    publishedAt: "2026-06-18T09:00:00Z",
    cover: "cover-4.png",
    coverAlt: "Split composition of exploratory manual testing vs repeatable automated checks — Annote blog cover",
    body: `
"Should we do manual or automated testing?" is slightly the wrong question. The two aren't rivals; they're tools for different jobs, and most healthy teams use both. Here's a practical breakdown — and a note on what they share, which is where a lot of teams actually lose time.
## What manual testing is good at
Manual testing means a human using the product — clicking, exploring, noticing. It shines at:
- **Exploratory testing** — following a hunch to the weird edge case no script covers.
- **Usability and visual judgment** — whether a layout feels broken or a flow is confusing.
- **New, fast-changing features** — where writing automation would be wasted effort.
Tradeoff: slow to repeat, hard to scale, inconsistent across runs.
## What automation testing is good at
Automated testing means scripts running checks for you. It shines at:
- **Regression testing** — re-running the same checks every release so nothing silently breaks.
- **Scale and speed** — thousands of checks in minutes across browsers.
- **Consistency** — the same thing every time, no fatigue.
Tradeoff: expensive to build and maintain, brittle when the UI changes, blind to what nobody thought to check.
## When to use each
- **Automate** the stable, repetitive, high-value paths — login, checkout, core flows — that must never break.
- **Test manually** the new, the exploratory, and the "does this feel right" work that needs judgment.
Use automation as the safety net and manual testing as the human eye. They cover each other's blind spots.
## What both have in common — and where teams lose time
Here's the part that gets overlooked: whether a bug comes from a manual pass or a human reviewing a failed automated run, someone has to report it *and the whole team has to act on it*. If those bugs scatter — a stack trace in the CI log, a note in Slack, a screenshot in email — your QA process stalls no matter how good your testing is. (We dig into that failure mode in [why scattered bug reports slow your team down](/blog/why-most-bug-reports-waste-20-minutes).)
The fix is a shared home for what testing finds. When every bug (manual or automated) lands in one collaborative session — captured with full context, then assigned, prioritized, discussed, and resolved together — your testing effort actually turns into shipped fixes instead of a scattered backlog. That's the workflow [Annote](https://annote.ai) gives teams: one organized, collaborative place for the bugs your testing surfaces.
`,
  },
  {
    _id: "post-visual-bug-reporting-tools",
    slug: "visual-bug-reporting-tools",
    title: "Bug reporting tools compared: capture is easy, collaboration is the hard part",
    excerpt:
      "Most bug reporting tools are good at capture now. The real difference is what your team can do *after* — assign, prioritize, discuss, resolve. Here's how the top tools compare on the part that matters.",
    metaTitle: "Bug Reporting Tools Compared: Why Collaboration Matters Most",
    metaDescription:
      "Most bug reporting tools nail capture. Fewer help your team collaborate on what they capture. Here's how the top tools compare — and why the collaboration layer is what saves teams time.",
    category: "product",
    publishedAt: "2026-07-03T09:00:00Z",
    cover: "cover-5.png",
    coverAlt: "A cursor pointing at a highlighted element with a voice capture pill — Annote blog cover",
    body: `
Bug reporting tools have largely solved capture. Screenshots, console logs, network requests, repro steps — most modern tools grab all of it automatically. So if capture is a solved problem, what actually separates one tool from another for a team? The answer is everything that happens *after* the capture: whether your team can work the bug together, in one place, or whether it becomes another scattered report. Here's how the top tools compare on that axis.
## Capture: mostly a solved problem
The leading tools — Jam, Marker.io, Annote, and others — all capture strong technical context automatically. Some add AI that reads the evidence and flags the likely cause, which is a real step up. But capture alone just produces an artifact. A team needs more than an artifact; it needs a workflow.
## Collaboration: where tools actually differ
This is the part that decides whether your bugs get *fixed* or just *filed*. Look for:
- **One shared place.** Do all your bugs for a project live in a single session everyone can see, or scattered across separate links and threads?
- **Assignment and priority.** Can the team assign an owner and set a priority everyone trusts?
- **Discussion on the bug.** Can people comment and @mention directly on the ticket, so context stays attached?
- **Shared resolution.** Can the team move a bug from open to resolved together, with visible status?
Tools built around *individual reports* (a recording, a one-off link) are light here by design. Tools built around a *shared workspace* are where collaboration lives.
## How the leading tools compare
**Annote** captures like the best of them — click the element, describe it, get a structured ticket with screenshot, console, network, actions, and an AI-flagged likely cause — and then puts every ticket into **one shared, collaborative session** where the whole team assigns, prioritizes, comments, and resolves together. It's built for the collaboration half, not just the capture half.
**Jam** is excellent at developer-first capture and sharing individual recordings; collaboration centers on the recording rather than a shared team workspace.
**Marker.io** captures well and pushes bugs into your existing tracker, so collaboration happens in Jira/Linear rather than in the tool itself.
**BugHerd** offers a simple shared board — good collaboration, lighter capture.
## The bottom line
If capture is solved, choose your bug reporting tool on collaboration. The one that keeps your whole team working the same bugs in one organized session will save you far more time than a marginally better screenshot. That's the gap Annote is built to fill. [Try it free](https://annote.ai). For tool-by-tool breakdowns, see our [Jam.dev alternatives](/blog/jam-dev-alternatives) and [BugHerd alternatives](/blog/bugherd-alternatives) comparisons.
`,
  },
  {
    _id: "post-collect-client-feedback-website",
    slug: "collect-client-feedback-website",
    title: "How to keep website feedback in one place your whole team can work from",
    excerpt:
      "Website feedback usually arrives scattered across email, Slack, and screenshots — and stalls there. Here's how to keep it in one shared session your whole team can assign, discuss, and resolve together.",
    metaTitle: "How to Keep Website Feedback in One Place Your Team Can Work From",
    metaDescription:
      "Website feedback scattered across email, Slack, and screenshots slows everyone down. Here's how to keep it in one shared session your whole team can assign, discuss, and resolve together.",
    category: "company",
    publishedAt: "2026-06-24T09:00:00Z",
    cover: "cover-6.png",
    coverAlt: "Scattered feedback notes converging into one organized shared session — Annote blog cover",
    body: `
Whether feedback comes from a client, a stakeholder, or your own QA pass, it tends to arrive the same way: scattered. A Slack message here, an email with a screenshot there, a comment on a call about something "off" on a page. Collecting it is annoying; turning it into work your team can act on together is worse. The fix isn't more discipline — it's keeping all of it in one shared place your whole team works from. Here's how.
## Why feedback gets scattered (and why it stalls)
- **Too many channels.** Feedback lands wherever's convenient, and no single place holds it all.
- **No shared state.** Without a visible owner, priority, and status, feedback sits in limbo — everyone assumes someone else has it.
- **Disconnected discussion.** The conversation about a piece of feedback happens away from the feedback itself, so context gets lost and re-explained.
## Keep feedback in one shared session
The single biggest improvement is giving all feedback for a project one home — a shared session your whole team (and, when relevant, your client) can see and work in:
**1. One place, not five.** Every piece of feedback lands in the same session, so nobody hunts across threads.
**2. Capture context automatically.** When feedback comes in, the technical detail — page, screenshot, console, network — comes with it, so it's a real ticket, not a vague note.
**3. Collaborate on it.** Assign an owner, set a priority, comment and @mention on the ticket, and resolve it together — all visible to the team.
**4. Share without friction.** A single link opens the session in the browser — no signup for viewers — so stakeholders and clients can follow along and comment without learning a new tool.
## Feedback becomes a queue, not a mess
When feedback is captured with context and lands in one collaborative session, it stops being scattered noise and becomes an organized queue your team works through together. Everyone sees the same list. Everyone knows who owns what. The discussion stays attached to the bug.
That's the workflow [Annote](https://annote.ai) is built for: one shared, collaborative session where the whole team — developers, PMs, QA — captures, assigns, discusses, and resolves feedback together, instead of chasing it across five tools. (The same principle applies to internal bug reports — here's [why scattered reports slow teams down](/blog/why-most-bug-reports-waste-20-minutes).)
`,
  },
];

// ── api ─────────────────────────────────────────────────────────────────────

async function uploadImage(file) {
  const png = readFileSync(resolve(root, "scripts/seed/covers", file));
  const res = await fetch(
    `${apiBase}/assets/images/${dataset}?filename=${encodeURIComponent(file)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/png" },
      body: png,
    },
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`upload ${file}: ${JSON.stringify(json)}`);
  return json.document._id;
}

async function mutate(mutations) {
  const res = await fetch(`${apiBase}/data/mutate/${dataset}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`mutate: ${JSON.stringify(json)}`);
  return json;
}

// ── run ─────────────────────────────────────────────────────────────────────

if (process.env.PATCH_CONTENT === "1") {
  console.log(`Patching content of ${POSTS.length} posts in ${projectId}/${dataset} …`);
  await mutate(
    POSTS.map((p) => ({
      patch: {
        id: p._id,
        set: {
          title: p.title,
          excerpt: p.excerpt,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          body: mdToBlocks(p.body),
        },
      },
    })),
  );
  console.log("  ✓ titles, excerpts, meta, and bodies patched (slugs/covers untouched)");
  process.exit(0);
}

console.log(`Seeding 6 posts into ${projectId}/${dataset} …`);

const mutations = [];
for (const p of POSTS) {
  const assetId = await uploadImage(p.cover);
  console.log(`  ✓ ${p.cover} uploaded`);
  mutations.push({
    createIfNotExists: {
      _id: p._id,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      author: AUTHOR,
      categories: cat(p.category),
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        alt: p.coverAlt,
      },
      body: mdToBlocks(p.body),
    },
  });
}

await mutate(mutations);
console.log("  ✓ posts created");
