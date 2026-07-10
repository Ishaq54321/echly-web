import type { StructureResolver } from "sanity/structure";

/**
 * Left-hand navigation of the Studio. Keeps the common "Blog posts" list at the
 * top and groups the supporting types (authors, categories) below.
 *
 * NOTE: this file is deliberately NOT named `structure.ts`. Because this project
 * sets `baseUrl: "."` in tsconfig, a local file at `sanity/structure.ts` would
 * shadow the `sanity/structure` npm subpath and break the imports below.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("post").title("Blog posts"),
      S.divider(),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("category").title("Categories"),
    ]);
