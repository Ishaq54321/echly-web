/**
 * Central place that reads the Sanity connection details from environment
 * variables. Nothing about the project (ID, dataset, token) is hardcoded — it
 * all comes from env vars so the same code runs safely in local dev, preview,
 * and production.
 *
 * Required env vars (see .env.example):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  — the Sanity project id (public, safe to expose)
 *   NEXT_PUBLIC_SANITY_DATASET     — usually "production" (public, safe to expose)
 *   SANITY_API_READ_TOKEN          — server-only read token (NEVER exposed to the browser)
 */

// API version pins the Sanity API contract to a date so responses never change
// underneath us. Bump this deliberately, not accidentally.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

// Server-only read token. It is intentionally NOT prefixed with NEXT_PUBLIC_,
// so Next.js will never bundle it into browser JavaScript. Only server-side
// code (sanityFetch) can read it. It may be undefined at build time on
// machines that only render published content — sanityFetch handles that.
export const readToken = process.env.SANITY_API_READ_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
