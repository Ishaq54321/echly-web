/**
 * MarketingFonts — the Google Sans Flex / Google Sans Code stylesheet links
 * for the nova marketing surface.
 *
 * Rendered by MarketingHeader so EVERY page that mounts the marketing chrome
 * gets the fonts — critically including the homepage, which is served by
 * app/page.tsx OUTSIDE the (marketing) route group and therefore never sees
 * app/(marketing)/layout.tsx. Before this component existed, the homepage
 * shipped no Google Sans links at all: first load rendered the DM Sans
 * fallback, and navigating away to /blog or /docs (which do load the fonts)
 * and back swapped the whole page to Google Sans — the "fonts look slightly
 * off after navigating" bug.
 *
 * React 19 hoists <link precedence> tags into <head> and dedupes them by
 * href, so this can safely mount alongside the copies in the marketing
 * layout.
 */

// Full axis tuple for Google Sans Flex (optical size, slant, width, weight,
// roundness) — copied verbatim from antigravity.google's preload, which is the
// known-working css2 request for this family. Keep in sync with
// app/(marketing)/layout.tsx.
const GOOGLE_SANS_FLEX_URL =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,ROND@8..144,-10..0,25..150,400..500,0..100&display=swap";
const GOOGLE_SANS_CODE_URL =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@400;500&display=swap";

export function MarketingFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={GOOGLE_SANS_FLEX_URL} precedence="default" />
      <link rel="stylesheet" href={GOOGLE_SANS_CODE_URL} precedence="default" />
    </>
  );
}
