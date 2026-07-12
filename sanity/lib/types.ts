import type { Image, PortableTextBlock } from "sanity";

/**
 * Hand-written shapes for what the GROQ queries in queries.ts return. These are
 * intentionally simple (no auto-generated types / Sanity TypeGen step needed for
 * this setup pass). The blog pages cast the fetch results to these.
 */

// Cover/inline images carry an optional alt string alongside the asset ref.
export type SanityImageWithAlt = Image & { alt?: string };

export type PostCategory = { _id: string; title: string | null };

// One row on the /blog listing (POSTS_QUERY / RELATED_POSTS_QUERY).
export type PostListItem = {
  _id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  publishedAt: string | null;
  authorName: string | null;
  authorAvatar: Image | null;
  categories: PostCategory[] | null;
  coverImage: SanityImageWithAlt | null;
};

// A full article (POST_QUERY).
export type PostDetail = {
  _id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  publishedAt: string | null;
  _updatedAt: string | null;
  coverImage: SanityImageWithAlt | null;
  body: PortableTextBlock[] | null;
  author: {
    name: string | null;
    role: string | null;
    avatar: Image | null;
  } | null;
  categories: PostCategory[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};
