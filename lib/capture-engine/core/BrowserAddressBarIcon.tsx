type IconProps = { size?: number; color?: string };

/**
 * Chrome's site-controls affordance is a 2-line "sliders" / tune icon
 * (NOT the 3-line filter glyph). Two horizontal rails each with a knob.
 */
export function ChromeSlidersIcon({
  size = 13,
  color = "currentColor",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="11" y2="7" />
      <line x1="16" y1="7" x2="20" y2="7" />
      <circle cx="13.5" cy="7" r="2.5" fill="white" />
      <line x1="4" y1="17" x2="14" y2="17" />
      <line x1="19" y1="17" x2="20" y2="17" />
      <circle cx="16.5" cy="17" r="2.5" fill="white" />
    </svg>
  );
}

/** Edge surfaces site permissions behind the address-bar lock icon. */
export function EdgeLockIcon({
  size = 13,
  color = "currentColor",
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
