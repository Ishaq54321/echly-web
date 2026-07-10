import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * The base Sanity client. Used by the image-url helper and the Studio.
 *
 * `useCdn: false` is important for the "publish → appears live with no deploy"
 * behavior: the CDN can serve stale content for a few minutes, whereas the live
 * API (used by sanityFetch in lib/live.ts) needs fresh reads to revalidate
 * pages the moment an editor hits Publish.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
