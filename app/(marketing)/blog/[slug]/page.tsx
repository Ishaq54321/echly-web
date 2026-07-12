import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  POST_QUERY,
  POST_SLUGS_QUERY,
  RELATED_POSTS_QUERY,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import type { PostDetail, PostListItem } from "@/sanity/lib/types";
import { BlogCard, CoverMedia } from "../_components/BlogCard";
import { PortableBody } from "../_components/PortableBody";
import {
  authorInitials,
  formatDate,
  readingTimeMinutes,
} from "../_components/format";

type PageProps = { params: Promise<{ slug: string }> };

// See /blog for rationale: 60s ISR fallback backs up the live connection so
// edits go live within a minute without a redeploy.
export const revalidate = 60;

// Pre-render every published post at build time; new slugs still resolve on
// demand thanks to the default dynamicParams behavior.
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(POST_SLUGS_QUERY);
  return (slugs ?? []).map((slug) => ({ slug }));
}

// Browser-tab / social title, description, and OG image from the post,
// honoring the editor's SEO overrides when set.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: POST_QUERY,
    params: { slug },
    // Metadata doesn't need the live connection.
    stega: false,
  });
  const post = data as PostDetail | null;

  if (!post) return {};

  const title = post.metaTitle || post.title || undefined;
  const description = post.metaDescription || post.excerpt || undefined;
  const coverImageUrl = post.coverImage?.asset
    ? urlForImage(post.coverImage).width(1200).height(630).fit("crop").url()
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
              width: 1200,
              height: 630,
              alt: post.coverImage?.alt || post.title || "",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data }, { data: relatedData }] = await Promise.all([
    sanityFetch({ query: POST_QUERY, params: { slug } }),
    sanityFetch({ query: RELATED_POSTS_QUERY, params: { slug } }),
  ]);
  const post = data as PostDetail | null;
  const related = (relatedData ?? []) as PostListItem[];

  if (!post) notFound();

  const category = post.categories?.find((c) => c.title)?.title ?? null;
  const minutes = readingTimeMinutes(post.body);

  const baseUrl = "https://annote.ai";
  const postUrl = `${baseUrl}/blog/${slug}`;
  const coverImageUrl = post.coverImage?.asset
    ? urlForImage(post.coverImage).width(1200).height(630).fit("crop").url()
    : undefined;

  // BlogPosting — only fields we actually have data for; no invented values.
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: coverImageUrl ? [coverImageUrl] : undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post._updatedAt || post.publishedAt || undefined,
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name }
      : { "@type": "Organization", name: "Annote" },
    publisher: {
      "@type": "Organization",
      name: "Annote",
      logo: { "@type": "ImageObject", url: `${baseUrl}/annote-logo-full.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${baseUrl}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: postUrl },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="blg-article">
        <div className="blg-container">
          <header className="blg-article-col">
            <nav className="blg-crumb" aria-label="Breadcrumb">
              <Link href="/blog">Blog</Link>
              {category && (
                <>
                  <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
                  <span className="cur">{category}</span>
                </>
              )}
            </nav>

            <h1 className="blg-article-title">{post.title}</h1>
            {post.excerpt && (
              <p className="blg-article-excerpt">{post.excerpt}</p>
            )}

            <div className="blg-article-meta">
              <div className="blg-article-author">
                {post.author?.avatar?.asset ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="blg-avatar"
                    src={urlForImage(post.author.avatar)
                      .width(88)
                      .height(88)
                      .fit("crop")
                      .url()}
                    alt=""
                    width={40}
                    height={40}
                  />
                ) : (
                  <span
                    className="blg-avatar blg-avatar--fallback"
                    aria-hidden="true"
                  >
                    {authorInitials(post.author?.name)}
                  </span>
                )}
                <div>
                  <div className="blg-article-author-name">
                    {post.author?.name || "Annote"}
                  </div>
                  {post.author?.role && (
                    <div className="blg-article-author-role">
                      {post.author.role}
                    </div>
                  )}
                </div>
              </div>
              <div className="blg-article-dateline">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt, "long")}
                  </time>
                )}
                <span className="dot" aria-hidden="true" />
                <span>{minutes} min read</span>
              </div>
            </div>
          </header>

          {post.coverImage?.asset && (
            <div className="blg-article-wide blg-article-cover">
              <CoverMedia
                image={post.coverImage}
                title={post.title}
                width={1408}
                height={792}
              />
            </div>
          )}

          <div className="blg-article-col">
            {post.body && <PortableBody value={post.body} />}

            {/* "What's next" — the article's closing CTA */}
            <aside className="blg-endcta">
              <h2 className="blg-endcta-title">
                See the whole bug, not the mystery
              </h2>
              <p className="nv-caption blg-endcta-sub">
                Annote captures the screenshot, console, network, and user
                actions behind every report — and an AI flags the likely cause
                before an engineer opens the ticket.
              </p>
              <div className="blg-endcta-actions">
                <Link href="/signup" className="nv-btn nv-btn--primary">
                  Get Annote — it&rsquo;s free
                </Link>
                <Link href="/docs" className="nv-arrow-link">
                  Read the docs
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="blg-related" aria-label="More from the blog">
          <div className="blg-container">
            <div className="blg-related-head">
              <h2 className="nv-h6">Keep reading</h2>
              <Link href="/blog" className="nv-arrow-link">
                View all posts
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
            <div className="blg-grid">
              {related.map((p) => (
                <BlogCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
