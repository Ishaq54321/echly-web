/**
 * The embedded Sanity Studio, served at /studio (and all sub-paths like
 * /studio/structure). A non-technical editor visits this URL, logs in with
 * their Sanity account, and creates/edits/publishes posts here.
 *
 * The catch-all segment [[...tool]] lets the Studio own every route under
 * /studio without extra files.
 */

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

// Studio needs the full viewport and its own rendering; opt out of static
// generation so it always runs fresh.
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
