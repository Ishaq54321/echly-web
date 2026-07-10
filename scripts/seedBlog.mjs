/**
 * Seeds the blog with its first real post (plus the author, the standard
 * categories, and a branded placeholder cover image).
 *
 * Usage:
 *   node scripts/seedBlog.mjs
 *
 * Requires a token with WRITE access in .env.local:
 *   SANITY_API_WRITE_TOKEN=sk...   (create at sanity.io/manage → project
 *                                   xjuqsanl → API → Tokens → role "Editor")
 * Falls back to SANITY_API_READ_TOKEN in case that token was created with
 * Editor rights.
 *
 * Idempotent: every document is createIfNotExists, so re-running never
 * clobbers content you've since edited in the Studio.
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
    /* .env.local optional if vars are already exported */
  }
  return { ...env, ...process.env };
}

const env = loadEnvLocal();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN;
const apiVersion = "2026-02-01";

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_API_WRITE_TOKEN in .env.local.\n" +
      "Create one at https://www.sanity.io/manage → project → API → Tokens → role 'Editor'.",
  );
  process.exit(1);
}

const apiBase = `https://${projectId}.api.sanity.io/v${apiVersion}`;

// ── portable text helpers ───────────────────────────────────────────────────

let keyCounter = 0;
const key = () => `seed${(keyCounter++).toString(36).padStart(4, "0")}`;

function block(text, style = "normal", listItem) {
  const b = {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
}

// ── the post body (exact copy, no lorem) ────────────────────────────────────

const body = [
  block(
    'Most bug reports arrive as a mystery. "The checkout button doesn\'t work." No page. No steps. No idea what the user did. Before anyone can fix it, someone has to become a detective — and that detective work is where the time goes.',
  ),
  block("The hidden cost of a vague report", "h2"),
  block(
    "When a report has no context, an engineer has to reproduce the bug from scratch: figure out which page, which browser, which sequence of actions. Studies of engineering time put reproduction as one of the single biggest barriers to fixing a defect — not the fix itself, but figuring out what actually happened. Twenty minutes per bug, spent before a single line of code is written, adds up fast across a team.",
  ),
  block("Why it keeps happening", "h2"),
  block(
    "The person reporting the bug usually isn't the person fixing it. A client, a PM, a designer, or a QA tester sees something wrong and describes it in plain words — because that's all they can do. They don't have the console open. They don't know which network call failed. The context that would make the report useful is exactly the context they can't see.",
  ),
  block("What a useful report actually contains", "h2"),
  block(
    "A report a developer can act on immediately has a few things the vague one doesn't:",
  ),
  block("The exact element and page where it happened", "normal", "bullet"),
  block("A screenshot of what the reporter was looking at", "normal", "bullet"),
  block("The console errors at that moment", "normal", "bullet"),
  block("The network requests behind the failure", "normal", "bullet"),
  block("The steps the user took leading up to it", "normal", "bullet"),
  block("Closing the gap", "h2"),
  block(
    "This is the gap Annote was built to close. The reporter still describes the bug in plain words — they click the element and say what's wrong. But Annote captures the full technical context automatically: the screenshot, the console, the network, and the user's actions. An AI reads that evidence and flags the likely cause before an engineer opens the ticket.",
  ),
  block(
    "The reporter says it in plain words. The AI does the engineering. And nobody spends twenty minutes reproducing a mystery.",
  ),
];

// ── api calls ───────────────────────────────────────────────────────────────

async function uploadCoverImage() {
  const png = readFileSync(resolve(root, "scripts/seed/blog-cover-placeholder.png"));
  const res = await fetch(
    `${apiBase}/assets/images/${dataset}?filename=blog-cover-placeholder.png`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "image/png",
      },
      body: png,
    },
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Image upload failed: ${JSON.stringify(json)}`);
  }
  return json.document._id;
}

async function mutate(mutations) {
  const res = await fetch(`${apiBase}/data/mutate/${dataset}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Mutation failed: ${JSON.stringify(json)}`);
  }
  return json;
}

// ── seed ────────────────────────────────────────────────────────────────────

console.log(`Seeding blog content into ${projectId}/${dataset} …`);

const coverAssetId = await uploadCoverImage();
console.log(`  ✓ cover image uploaded (${coverAssetId})`);

const categories = ["Product", "Engineering", "Guides", "Company"].map(
  (title) => ({
    createIfNotExists: {
      _id: `category-${title.toLowerCase()}`,
      _type: "category",
      title,
      slug: { _type: "slug", current: title.toLowerCase() },
    },
  }),
);

await mutate([
  ...categories,
  {
    createIfNotExists: {
      _id: "author-annote-team",
      _type: "author",
      name: "The Annote Team",
      role: "Annote",
    },
  },
  {
    createIfNotExists: {
      _id: "post-why-most-bug-reports-waste-20-minutes",
      _type: "post",
      title:
        "Why most bug reports waste 20 minutes before anyone fixes anything",
      slug: {
        _type: "slug",
        current: "why-most-bug-reports-waste-20-minutes",
      },
      excerpt:
        "The average bug report is a mystery, not a report. Here's why 'the button doesn't work' costs your team half an hour every time — and how to end it.",
      publishedAt: new Date().toISOString(),
      author: { _type: "reference", _ref: "author-annote-team" },
      categories: [
        { _type: "reference", _ref: "category-product", _key: key() },
      ],
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: coverAssetId },
        alt: "Annote brand artwork — placeholder cover",
      },
      body,
    },
  },
]);

console.log("  ✓ categories, author, and post created");
console.log(
  "\nDone. The post is live at /blog/why-most-bug-reports-waste-20-minutes " +
    "(within ~60s if a page was already cached).",
);
