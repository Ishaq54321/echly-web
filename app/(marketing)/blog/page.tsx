import Link from "next/link";
import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import type { PostListItem } from "@/sanity/lib/types";
import { BlogIndexList } from "./_components/BlogIndexList";
import { SubscribeBand } from "./_components/SubscribeBand";

export const metadata: Metadata = {
  title: "Blog — Annote",
  description:
    "Product updates, engineering notes, and guides from the Annote team on shipping web software without the bug-report guesswork.",
  openGraph: {
    title: "The Annote blog",
    description:
      "Product updates, engineering notes, and guides from the Annote team.",
    type: "website",
  },
};

// Safety net for "publish → appears live with no redeploy": even if the live
// connection (<SanityLive />) doesn't fire, this page re-fetches at most every
// 60 seconds, so a newly published post shows up within a minute regardless.
export const revalidate = 60;

export default async function BlogIndexPage() {
  const { data } = await sanityFetch({ query: POSTS_QUERY });
  const posts = (data ?? []) as PostListItem[];

  return (
    <main>
      <header className="blg-head">
        <div className="blg-container">
          <p className="nv-eyebrow">The Annote blog</p>
          <h1 className="nv-h3 blg-head-title">
            Notes from the team
            <span className="nv-dim"> ending the bug-report mystery.</span>
          </h1>
          <p className="nv-body blg-head-sub">
            Product updates, engineering notes, and guides on shipping web
            software without the guesswork.
          </p>
        </div>
      </header>

      <section className="blg-container blg-index-body">
        {posts.length > 0 ? (
          <BlogIndexList posts={posts} />
        ) : (
          <div className="blg-empty">
            <p className="nv-mono">
              No posts yet. Publish one in the{" "}
              <Link href="/studio">Studio</Link> and it appears here within a
              minute.
            </p>
          </div>
        )}
      </section>

      <SubscribeBand />
    </main>
  );
}
