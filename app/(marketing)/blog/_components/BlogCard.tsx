import Link from "next/link";
import type { Image } from "sanity";

import { urlForImage } from "@/sanity/lib/image";
import type { PostListItem } from "@/sanity/lib/types";
import { AnnoteLogo } from "../../_components/AnnoteLogo";
import { authorInitials, formatDate } from "./format";

/**
 * Shared editorial pieces for the blog: cover media (with a branded CSS
 * placeholder when a post has no image yet), the avatar+name+date byline,
 * and the standard post card used by the index grid and the article page's
 * "keep reading" strip. Plain components — render fine from server or
 * client trees.
 */

export function CoverMedia({
  image,
  title,
  width = 800,
  height = 500,
}: {
  image: (Image & { alt?: string }) | null;
  title: string | null;
  width?: number;
  height?: number;
}) {
  if (!image?.asset) {
    return (
      <div className="blg-media blg-media--placeholder" aria-hidden="true">
        <AnnoteLogo variant="white" width={44} height={55} />
      </div>
    );
  }
  return (
    <div className="blg-media">
      {/* eslint-disable-next-line @next/next/no-img-element -- raw <img> +
          Sanity CDN sizing is this codebase's deliberate image path */}
      <img
        src={urlForImage(image).width(width).height(height).fit("crop").url()}
        srcSet={`${urlForImage(image).width(width).height(height).fit("crop").url()} 1x, ${urlForImage(
          image,
        )
          .width(width * 2)
          .height(height * 2)
          .fit("crop")
          .url()} 2x`}
        alt={image.alt || title || ""}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
  );
}

export function Byline({
  name,
  avatar,
  date,
}: {
  name: string | null;
  avatar: Image | null;
  date: string | null;
}) {
  return (
    <div className="blg-byline">
      {avatar?.asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="blg-avatar"
          src={urlForImage(avatar).width(56).height(56).fit("crop").url()}
          alt=""
          width={26}
          height={26}
          loading="lazy"
        />
      ) : (
        <span className="blg-avatar blg-avatar--fallback" aria-hidden="true">
          {authorInitials(name)}
        </span>
      )}
      <b>{name || "Annote"}</b>
      {date && (
        <>
          <span className="dot" aria-hidden="true" />
          <time dateTime={date}>{formatDate(date)}</time>
        </>
      )}
    </div>
  );
}

export function categoryLabel(post: PostListItem): string | null {
  return post.categories?.find((c) => c.title)?.title ?? null;
}

export function BlogCard({
  post,
  wide = false,
}: {
  post: PostListItem;
  wide?: boolean;
}) {
  const category = categoryLabel(post);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`blg-card${wide ? " blg-card--wide" : ""}`}
    >
      <CoverMedia
        image={post.coverImage}
        title={post.title}
        width={wide ? 1200 : 720}
        height={wide ? 630 : 450}
      />
      {category && <span className="blg-kicker">{category}</span>}
      <h3 className="blg-card-title">{post.title}</h3>
      {post.excerpt && <p className="blg-card-excerpt">{post.excerpt}</p>}
      <Byline
        name={post.authorName}
        avatar={post.authorAvatar}
        date={post.publishedAt}
      />
    </Link>
  );
}
