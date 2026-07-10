import Link from "next/link";
import type { PortableTextBlock } from "sanity";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { urlForImage } from "@/sanity/lib/image";

/**
 * The article body renderer — maps every Portable Text block the Studio can
 * produce (blockContentType) onto the .blg-prose vocabulary in blog.css:
 * H2–H4, links in the brand accent, blockquotes, lists, inline images, and
 * dark monospace code blocks.
 */

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      // Internal links stay in the SPA; external ones open a new tab.
      if (href.startsWith("/")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} rel="noreferrer noopener" target="_blank">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure>
          <div className="blg-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlForImage(value).width(1408).url()}
              alt={value.alt || ""}
              loading="lazy"
            />
          </div>
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    codeBlock: ({ value }) => {
      if (!value?.code) return null;
      const language: string = value.language || "text";
      return (
        <div className="blg-codeblock">
          <div className="blg-codeblock-bar">
            <span>{value.filename || ""}</span>
            <span className="lang">{language}</span>
          </div>
          <pre>
            <code>{value.code}</code>
          </pre>
        </div>
      );
    },
  },
};

export function PortableBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="blg-prose">
      <PortableText value={value} components={components} />
    </div>
  );
}
