/**
 * SVG glyphs for the onboarding flow. Inlined to keep the Echly look exact —
 * lucide's stroke weights and bounding boxes don't match the design files.
 */
type Sized = { size?: number };

export const ObIcon = {
  QA: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 4.5h11M3 8h11M3 11.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 13l1.5 1.5L17 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Designer: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 16l3.5-1 7-7-2.5-2.5-7 7L4 16z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11 6l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  PM: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 8h14M7 4V3M13 4V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 11h3M6 13.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Dev: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 7l-3 3 3 3M13 7l3 3-3 3M11 5l-2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Other: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="1.4" fill="currentColor" />
    </svg>
  ),
  Check: ({ size = 10 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6.5l2.2 2.2L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Camera: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 4.5l1-1.5h2l1 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  Upload: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 11V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11v1.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Arrow: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8h9M9 4.5l3.5 3.5L9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowLeft: ({ size = 12 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10 3.5L5 8l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Globe: ({ size = 18 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h13M10 3.5c1.8 2 2.5 4 2.5 6.5s-.7 4.5-2.5 6.5c-1.8-2-2.5-4-2.5-6.5S8.2 5.5 10 3.5z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Frame: ({ size = 18 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 7h14M3 13h14M7 3v14M13 3v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Pen: ({ size = 18 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 16l3.5-1 8-8-2.5-2.5-8 8L4 16z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 6l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Send: ({ size = 18 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 10l14-6-5 14-2.5-5.5L3 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Bolt: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 2L4 9h3l-1 5 5-7H8l1-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  Chrome: ({ size = 18 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 7.5h6.4M7.8 11.2L4.5 16M12.2 11.2L15.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Lock: ({ size = 10 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <rect x="3" y="5.5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.5V4a1.5 1.5 0 0 1 3 0v1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  External: ({ size = 12 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M5 3H3v8h8V9M8 3h3v3M11 3L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Mail: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  X: ({ size = 10 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Sparkle: ({ size = 14 }: Sized) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};
