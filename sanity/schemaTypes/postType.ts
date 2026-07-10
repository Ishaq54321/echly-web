import { defineField, defineType } from "sanity";

/**
 * Post — the blog article content model. This is the main thing writers create
 * in the Studio. Fields marked required must be filled before publishing.
 */
export const postType = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "The URL for this post (e.g. my-first-post → /blog/my-first-post). Click 'Generate' to auto-fill from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "content",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
      description:
        "The post appears on the live site once this date/time is in the past. Set it to now to publish immediately.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Describe the image for screen readers and SEO.",
        },
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / summary",
      type: "text",
      group: "content",
      rows: 3,
      description:
        "A short summary shown on the blog listing and used as the SEO meta description if no custom one is set.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
    }),
    // --- SEO overrides (all optional; fall back to title/excerpt) ---
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      group: "seo",
      description: "Optional. Overrides the browser-tab / search title.",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      group: "seo",
      rows: 2,
      description: "Optional. Overrides the excerpt for search engines.",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, author, media, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : "No date";
      return {
        title,
        subtitle: author ? `${author} · ${date}` : date,
        media,
      };
    },
  },
});
