import { defineArrayMember, defineType } from "sanity";

/**
 * Portable Text — the rich-text field used for the article body. This defines
 * what an editor can do: headings, quotes, bold/italic/links, and inline images
 * with alt text. It renders on the site via @portabletext/react.
 */
export const blockContentType = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      // The paragraph/heading styles available in the editor toolbar.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) =>
                  rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
              },
            ],
          },
        ],
      },
    }),
    // Images can be dropped inline in the article body.
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for accessibility and SEO.",
        },
      ],
    }),
    // Fenced code blocks for technical articles. A plain object type (no
    // extra editor plugin needed): pick a language, paste the code.
    defineArrayMember({
      type: "object",
      name: "codeBlock",
      title: "Code block",
      fields: [
        {
          name: "language",
          type: "string",
          title: "Language",
          initialValue: "typescript",
          options: {
            list: [
              "typescript",
              "javascript",
              "tsx",
              "json",
              "bash",
              "css",
              "html",
              "text",
            ],
          },
        },
        {
          name: "filename",
          type: "string",
          title: "Filename",
          description: "Optional. Shown in the code block's header bar.",
        },
        {
          name: "code",
          type: "text",
          title: "Code",
          rows: 10,
        },
      ],
      preview: {
        select: { code: "code", language: "language" },
        prepare({ code, language }) {
          return {
            title: (code || "").split("\n")[0] || "Code block",
            subtitle: language,
          };
        },
      },
    }),
  ],
});
