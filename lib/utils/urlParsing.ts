/**
 * Deterministic URL → page identification.
 *
 * Replaces ~75 lines of AI prompt URL-parsing rules with
 * pure-function logic that handles standard URLs and edge cases:
 * - Standard paths and subdomains
 * - Localhost and IP addresses
 * - Locale prefixes (en-US, fr, zh-Hans, etc.)
 * - Numeric IDs and UUIDs
 * - Vercel/Netlify preview URLs
 * - Storybook URL patterns
 * - Hash routing for legacy SPAs
 * - Auth token stripping for privacy
 */

export interface ParsedPageInfo {
  pageName: string;       // e.g., "Pricing", "Home", "Dashboard"
  siteName: string;       // e.g., "Acme", "Linear", "Skayle360"
  pageArea: string;       // e.g., "Acme · Pricing"
  sanitizedUrl: string;   // URL with hash + auth tokens stripped
}

const LOCALE_PREFIXES = new Set([
  "en", "en-us", "en-gb", "en-au",
  "es", "es-es", "es-mx",
  "fr", "fr-fr", "fr-ca",
  "de", "de-de",
  "it", "ja", "ko",
  "zh", "zh-cn", "zh-tw", "zh-hans", "zh-hant",
  "pt", "pt-br", "pt-pt",
  "ru", "ar", "nl", "sv", "no", "da", "fi", "pl",
  "tr", "he", "th", "vi", "id", "ms", "uk", "cs", "hu",
]);

/**
 * Platform domains where the SUBDOMAIN is the actual site identity.
 * For these domains, "bglaw.webflow.io" should be treated as "Bglaw"
 * not "Webflow".
 *
 * Includes hosting platforms, no-code site builders, and dev preview hosts.
 */
const PLATFORM_DOMAINS = new Set([
  "webflow.io",
  "vercel.app",
  "vercel.dev",
  "netlify.app",
  "netlify.com",
  "framer.website",
  "framer.app",
  "framer.media",
  "notion.site",
  "github.io",
  "pages.dev",
  "herokuapp.com",
  "onrender.com",
  "fly.dev",
  "supabase.co",
  "supabase.in",
  "firebaseapp.com",
  "web.app",
  "repl.co",
  "replit.app",
  "replit.dev",
  "glitch.me",
  "ngrok.io",
  "ngrok.app",
  "ngrok-free.app",
  "surge.sh",
  "stackblitz.io",
  "stackblitz.com",
  "codesandbox.io",
  "typedream.app",
  "carrd.co",
  "bubble.io",
  "softr.app",
  "duda.co",
  "wixsite.com",
  "wix.com",
  "weebly.com",
  "squarespace.com",
  "shopify.com",
  "myshopify.com",
  "loca.lt",
  "tunnelmole.com",
  "localtunnel.me",
  "pages.cloudflareaccess.com",
]);

const AUTH_QUERY_PARAMS = new Set([
  "token", "auth_token", "access_token", "refresh_token",
  "api_key", "apikey", "key", "secret",
  "password", "pwd",
  "session", "session_id", "sessionid",
  "code", "verification_code", "verify",
  "reset_token", "password_reset", "magic_link",
  "jwt", "bearer",
]);

export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    const noHash = rawUrl.split("#")[0];
    const url = new URL(noHash);
    const cleanedParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!AUTH_QUERY_PARAMS.has(key.toLowerCase())) {
        cleanedParams.set(key, value);
      }
    }
    url.search = cleanedParams.toString();
    return url.toString().replace(/\/$/, "");
  } catch {
    return rawUrl.split("#")[0];
  }
}

function isHashRouting(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.pathname === "/" && url.hash.startsWith("#/");
  } catch {
    return false;
  }
}

function extractHashRoutedPage(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const hashPath = url.hash.slice(2);
    return extractPageFromPath(hashPath);
  } catch {
    return "";
  }
}

function extractPreviewSiteName(host: string): string | null {
  if (host.endsWith(".vercel.app")) {
    const sub = host.replace(".vercel.app", "");
    const cleaned = sub.replace(/-pr-\d+$/, "").replace(/-git-[a-z0-9-]+$/, "");
    return cleaned.split("-").map(capitalize).join(" ");
  }
  if (host.endsWith(".netlify.app")) {
    const sub = host.replace(".netlify.app", "");
    const match = sub.match(/--(.+)$/);
    if (match) {
      return match[1].split("-").map(capitalize).join(" ");
    }
    return sub.split("-").map(capitalize).join(" ");
  }
  if (host.endsWith(".pages.dev")) {
    const sub = host.replace(".pages.dev", "");
    const parts = sub.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].split("-").map(capitalize).join(" ");
    }
    return sub.split("-").map(capitalize).join(" ");
  }
  if (host.endsWith(".github.io")) {
    const sub = host.replace(".github.io", "");
    return capitalize(sub);
  }
  return null;
}

function extractStorybookPage(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const pathParam = url.searchParams.get("path");
    if (!pathParam || !pathParam.startsWith("/story/")) return null;
    const storyName = pathParam.slice("/story/".length).split("--")[0];
    return storyName.split("-").map(capitalize).join(" ");
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function isIdSegment(segment: string): boolean {
  if (/^\d+$/.test(segment)) return true;
  if (/^[a-f0-9]{8,}$/.test(segment)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  return false;
}

function isLocaleSegment(segment: string): boolean {
  return LOCALE_PREFIXES.has(segment.toLowerCase());
}

function extractPageFromPath(path: string): string {
  if (!path || path === "/") return "Home";

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";

  let workingSegments = segments;
  if (workingSegments.length > 0 && isLocaleSegment(workingSegments[0])) {
    workingSegments = workingSegments.slice(1);
  }

  if (workingSegments.length === 0) return "Home";

  const meaningful: string[] = [];
  for (const seg of workingSegments) {
    if (!isIdSegment(seg)) {
      meaningful.push(seg);
    }
  }

  if (meaningful.length === 0) return "Home";

  const lastMeaningful = meaningful[meaningful.length - 1];

  const titled = lastMeaningful
    .split("-")
    .map(capitalize)
    .join(" ")
    .slice(0, 25);

  return titled || "Home";
}

function extractSiteName(host: string): string {
  if (!host) return "";

  if (host === "localhost" || host === "127.0.0.1") {
    return "Localhost";
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return "Local Network";
  }

  const previewName = extractPreviewSiteName(host);
  if (previewName) return previewName;

  for (const platform of PLATFORM_DOMAINS) {
    if (host.endsWith(`.${platform}`)) {
      const subdomain = host.slice(0, host.length - platform.length - 1);
      const firstSegment = subdomain.split(".")[0];
      if (firstSegment) {
        return capitalize(firstSegment);
      }
    }
  }

  const parts = host.split(".");
  if (parts.length < 2) return capitalize(host);

  const tld = parts[parts.length - 1];
  let baseParts = parts;
  if (tld.length <= 4 && /^[a-z]+$/i.test(tld)) {
    baseParts = parts.slice(0, -1);
    if (baseParts.length > 1) {
      const secondLast = baseParts[baseParts.length - 1];
      if (secondLast.length <= 3 && /^(co|com|org|net|gov|edu|ac)$/i.test(secondLast)) {
        baseParts = baseParts.slice(0, -1);
      }
    }
  }

  if (baseParts.length === 0) return capitalize(host);

  const apex = baseParts[baseParts.length - 1];

  if (baseParts.length === 1) {
    return capitalize(apex);
  }

  const subdomain = baseParts[0].toLowerCase();

  if (subdomain === "www") {
    return capitalize(apex);
  }

  if (subdomain === "app") {
    return capitalize(apex);
  }

  const meaningfulSubdomains: Record<string, string> = {
    docs: "Docs",
    help: "Help",
    support: "Support",
    blog: "Blog",
    api: "API",
    admin: "Admin",
  };

  if (meaningfulSubdomains[subdomain]) {
    return `${capitalize(apex)} ${meaningfulSubdomains[subdomain]}`;
  }

  return capitalize(apex);
}

export function parsePageInfo(rawUrl: string): ParsedPageInfo {
  if (!rawUrl) {
    return {
      pageName: "",
      siteName: "",
      pageArea: "",
      sanitizedUrl: "",
    };
  }

  const sanitizedUrl = sanitizeUrl(rawUrl);

  try {
    const url = new URL(sanitizedUrl);

    let pageName: string;
    if (isHashRouting(rawUrl)) {
      pageName = extractHashRoutedPage(rawUrl) || "Home";
    } else {
      const storyName = extractStorybookPage(sanitizedUrl);
      if (storyName) {
        pageName = storyName;
      } else if (url.hostname.endsWith(".github.io")) {
        // GitHub Pages: first path segment is the repo, treat it as the page.
        const segments = url.pathname.split("/").filter(Boolean);
        pageName = segments.length > 0
          ? segments[0].split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(" ").slice(0, 25)
          : "Home";
      } else {
        pageName = extractPageFromPath(url.pathname);
      }
    }

    const siteName = extractSiteName(url.hostname);

    const pageArea = siteName && pageName
      ? `${siteName} · ${pageName}`
      : siteName || pageName || "";

    return {
      pageName,
      siteName,
      pageArea: pageArea.slice(0, 40),
      sanitizedUrl,
    };
  } catch {
    return {
      pageName: "",
      siteName: "",
      pageArea: "",
      sanitizedUrl: rawUrl.split("#")[0],
    };
  }
}
