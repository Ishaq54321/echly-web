"use client";

/**
 * The interactive part of /blog: featured hero post + category filter row +
 * post grid. Filtering is client-side over the already-fetched list (blogs
 * are small; no round trip needed).
 *
 * Behavior: "All" shows the newest post as the big feature and the rest in
 * the grid. Picking a category swaps the feature out for a plain filtered
 * grid of every matching post — no duplication, and it degrades gracefully
 * with any number of posts.
 */

import { useMemo, useState } from "react";
import Link from "next/link";

import type { PostListItem } from "@/sanity/lib/types";
import { BlogCard, Byline, CoverMedia, categoryLabel } from "./BlogCard";

const ALL = "All";

export function BlogIndexList({ posts }: { posts: PostListItem[] }) {
  const [active, setActive] = useState(ALL);

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const post of posts) {
      for (const cat of post.categories ?? []) {
        if (cat.title && !seen.includes(cat.title)) seen.push(cat.title);
      }
    }
    return seen;
  }, [posts]);

  const featured = active === ALL ? posts[0] : null;
  const gridPosts =
    active === ALL
      ? posts.slice(1)
      : posts.filter((p) => p.categories?.some((c) => c.title === active));

  // One wide editorial row among standard cards, only when the grid is deep
  // enough that the alternation reads as rhythm rather than accident.
  const wideIndex = gridPosts.length >= 5 ? 3 : -1;

  return (
    <>
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="blg-feature">
          <div className="blg-feature-media">
            <CoverMedia
              image={featured.coverImage}
              title={featured.title}
              width={1200}
              height={675}
            />
          </div>
          <div className="blg-feature-body">
            {categoryLabel(featured) && (
              <span className="blg-kicker">{categoryLabel(featured)}</span>
            )}
            <h2 className="blg-feature-title">{featured.title}</h2>
            {featured.excerpt && (
              <p className="nv-body blg-feature-excerpt">{featured.excerpt}</p>
            )}
            <Byline
              name={featured.authorName}
              avatar={featured.authorAvatar}
              date={featured.publishedAt}
            />
          </div>
        </Link>
      )}

      {categories.length > 0 && (
        <div className="blg-filters" role="group" aria-label="Filter posts">
          {[ALL, ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`blg-filter${active === cat ? " is-active" : ""}`}
              aria-pressed={active === cat}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {gridPosts.length > 0 ? (
        <div className="blg-grid">
          {gridPosts.map((post, i) => (
            <BlogCard key={post._id} post={post} wide={i === wideIndex} />
          ))}
        </div>
      ) : (
        active !== ALL && (
          <div className="blg-grid">
            <p className="nv-caption" style={{ gridColumn: "1 / -1" }}>
              No posts in {active} yet — check back soon.
            </p>
          </div>
        )
      )}
    </>
  );
}
