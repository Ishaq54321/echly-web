import type { MetadataRoute } from "next";

const DEFAULT_BASE_URL = "https://annote.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Phase 2 will add: /pricing, /for/webflow-agencies, /for/framer-agencies,
    // /blog, /docs, etc.
  ];
}
