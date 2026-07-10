import { defineField, defineType } from "sanity";

/**
 * Author — a simple reusable person record. A post references one author.
 */
export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        'Optional. Shown next to the name on articles (e.g. "Engineering" or "Annote").',
    }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      description: "Optional profile photo.",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 3,
      description: "Optional. One or two sentences about the author.",
    }),
  ],
  preview: {
    select: { title: "name", media: "avatar" },
  },
});
