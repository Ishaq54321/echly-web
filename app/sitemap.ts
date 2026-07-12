import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { SITEMAP_POSTS_QUERY } from "@/sanity/lib/queries";

const DEFAULT_BASE_URL = "https://annote.ai";

// Refetch hourly so newly-published posts appear in the sitemap without a
// redeploy (mirrors the 60s pattern on /blog itself, just less aggressive
// since a new sitemap entry isn't as time-sensitive as the blog index).
export const revalidate = 3600;

// Every statically-routed, indexable marketing page. Blog posts are appended
// dynamically below since new ones publish without a deploy (see
// app/(marketing)/blog/[slug]/page.tsx's revalidate/generateStaticParams).
const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/use-cases/agencies", changeFrequency: "monthly", priority: 0.8 },
  { path: "/use-cases/client-feedback", changeFrequency: "monthly", priority: 0.8 },
  { path: "/use-cases/design-review", changeFrequency: "monthly", priority: 0.8 },
  { path: "/use-cases/qa-testing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/use-cases/teams", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/getting-started", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/capturing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/tickets", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/sharing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/privacy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/privacy-markers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/admin", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/troubleshooting", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/marketing/terms.html", changeFrequency: "yearly", priority: 0.3 },
  { path: "/marketing/privacy.html", changeFrequency: "yearly", priority: 0.3 },
  { path: "/marketing/trust.html", changeFrequency: "yearly", priority: 0.4 },
];

type SitemapPostRow = {
  slug: string;
  publishedAt: string | null;
  _updatedAt: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Sitemap generation must not 500 the whole route if Sanity is briefly
  // unreachable — fall back to the static pages alone.
  let posts: SitemapPostRow[] = [];
  try {
    posts = (await client.fetch<SitemapPostRow[]>(SITEMAP_POSTS_QUERY)) ?? [];
  } catch {
    posts = [];
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt || post.publishedAt || now),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
