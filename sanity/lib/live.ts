import { defineLive } from "next-sanity/live";

import { client } from "./client";
import { readToken } from "../env";

/**
 * Sanity's Live Content API wiring. This is what makes a freshly PUBLISHED post
 * appear on the live site WITHOUT a redeploy.
 *
 * How it works:
 *   - `sanityFetch` runs server-side and fetches content (using the read token).
 *   - `<SanityLive />` (mounted in the blog layout) opens a lightweight live
 *     connection to Sanity. When an editor publishes in the Studio, Sanity
 *     tells the page to revalidate, and Next.js re-renders with the new data.
 *
 * The read token is passed ONLY as `serverToken`, so it is used on the server
 * and is never shipped to the browser.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Server-side token for reading content. Never exposed to the browser.
  serverToken: readToken,
});
