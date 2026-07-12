import { defineQuery } from "next-sanity";

/**
 * GROQ queries used by the blog pages. `defineQuery` is a plain tagged wrapper
 * that keeps the query as a typed string.
 *
 * Only PUBLISHED posts are returned: `defined(slug.current)` and
 * `publishedAt <= now()` guard against draft/scheduled documents leaking out.
 */

// Listing page — the fields the /blog index needs for each post (newest
// first; the index treats the first row as the featured hero post).
export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()]
    | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorAvatar": author->avatar,
      "categories": categories[]->{ _id, title },
      coverImage
    }
`);

// Single post page — everything one article needs to render.
export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    _updatedAt,
    coverImage,
    body,
    "author": author->{ name, role, avatar },
    "categories": categories[]->{ _id, title },
    metaTitle,
    metaDescription
  }
`);

// "Read more" strip at the end of an article — the 3 most recent published
// posts that aren't the one being read.
export const RELATED_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()
    && slug.current != $slug]
    | order(publishedAt desc)[0...3] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorAvatar": author->avatar,
      "categories": categories[]->{ _id, title },
      coverImage
    }
`);

// All published slugs — used to pre-generate the static post pages.
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()].slug.current
`);

// Slug + timestamps for every published post — used by app/sitemap.ts so new
// and edited posts get an accurate <lastmod> without hand-listing routes.
export const SITEMAP_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt <= now()] {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
`);
