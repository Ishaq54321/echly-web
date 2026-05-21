import type { MetadataRoute } from "next";

const DEFAULT_BASE_URL = "https://annote.ai";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/settings/",
          "/activity/",
          "/shared/",
          "/discussion/",
          "/folders/",
          "/onboarding/",
          "/invite/",
          "/extension-auth/",
          "/check-email/",
          "/reset-password/",
          "/auth/",
          "/no-workspace/",
          "/workspace-suspended/",
          // Guest session viewers — unique URLs, not crawl targets.
          "/session/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
