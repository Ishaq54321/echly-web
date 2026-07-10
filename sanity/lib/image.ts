import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";

import { dataset, projectId } from "../env";

/**
 * Turns a Sanity image reference (what you get back from a query) into a real,
 * resizable image URL. Usage: urlForImage(post.coverImage).width(1200).url()
 */
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: Image) {
  return builder.image(source).auto("format").fit("max");
}
