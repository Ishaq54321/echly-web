/**
 * Empty-state illustrations for Discussion + Activity pages.
 * SVG markup is taken from the Echly empty-states canvas.
 */

const SHARED_BADGE_DEFS = (
  <defs>
    <symbol id="esBadgeCheck" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <path
        d="M-6 0 L-1.5 5 L7 -5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </symbol>
    <symbol id="esBadgeAt" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <circle cx="-1" cy="0" r="3.5" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path
        d="M2.5 0 V3 Q2.5 5.5 5 5.5 Q7.5 5.5 7.5 2 Q7.5 -7 -1 -7 Q-9 -7 -9 1 Q-9 8 -1 8 H3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </symbol>
    <symbol id="esBadgeUser" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <circle cx="0" cy="-3" r="3.5" fill="#fff" />
      <path d="M-7 7 Q-7 1 0 1 Q7 1 7 7" fill="#fff" />
    </symbol>
    <symbol id="esBadgeFolder" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <path d="M-8 -4 L-3 -4 L-1 -2 L8 -2 L8 5 L-8 5 Z" fill="#fff" />
    </symbol>
    <symbol id="esBadgeCursor" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <path
        d="M-4 -6 L6 1.5 L1 2.5 L4 8 L1.5 9 L-1.5 3.5 L-5 6 Z"
        fill="#fff"
      />
    </symbol>
    <symbol id="esBadgeFilter" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <path d="M-7 -5 H7 L2 1 V6 L-2 8 V1 Z" fill="#fff" />
    </symbol>
    <symbol id="esBadgeWarn" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <path
        d="M0 -7 L8 6 H-8 Z"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="0" y1="-2" x2="0" y2="2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="0" cy="4.5" r="1" fill="#fff" />
    </symbol>
    <symbol id="esBadgeLock" viewBox="-16 -16 32 32">
      <circle r="14" fill="#6B7280" />
      <rect x="-5" y="-1" width="10" height="8" rx="1.5" fill="#fff" />
      <path
        d="M-3 -1 V-4 Q-3 -7 0 -7 Q3 -7 3 -4 V-1"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
      />
    </symbol>
  </defs>
);

interface IllustrationProps {
  className?: string;
}

function IllustrationFrame({ children, className }: IllustrationProps & { children: React.ReactNode }) {
  return (
    <div className={`w-[160px] h-[140px] flex items-center justify-center ${className ?? ""}`}>
      <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible block">
        {SHARED_BADGE_DEFS}
        {children}
      </svg>
    </div>
  );
}

export function EmptyInboxIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 82) rotate(-13) translate(-50 -28)">
        <rect width="100" height="56" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="16" cy="20" r="5" fill="#D1D5DB" />
        <rect x="26" y="18" width="50" height="4" rx="2" fill="#E5E7EB" />
        <rect x="26" y="28" width="36" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(100 82) rotate(2) translate(-50 -28)">
        <rect width="100" height="56" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="16" cy="20" r="5" fill="#D1D5DB" />
        <rect x="26" y="18" width="44" height="4" rx="2" fill="#E5E7EB" />
        <rect x="26" y="28" width="56" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(100 82) rotate(11) translate(-50 -22)">
        <rect width="100" height="44" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="5" fill="#D1D5DB" />
        <rect x="26" y="14" width="50" height="4" rx="2" fill="#E5E7EB" />
        <rect x="26" y="24" width="32" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeCheck" x="146" y="112" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function EmptyMentionsIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 82) rotate(-6) translate(-50 -32)">
        <rect width="100" height="64" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="48" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeAt" x="142" y="108" width="38" height="38" />
    </IllustrationFrame>
  );
}

export function EmptyAssignedIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 82) rotate(-9) translate(-50 -32)">
        <rect width="100" height="64" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="40" height="5" rx="2.5" fill="#D1D5DB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="44" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(100 82) rotate(7) translate(-50 -28)">
        <rect width="100" height="56" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="14" width="38" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="26" width="56" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeUser" x="146" y="112" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function EmptySessionFilterIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 80) rotate(-4) translate(-58 -42)">
        <path
          d="M0 8 L0 76 Q0 84 8 84 L108 84 Q116 84 116 76 L116 16 Q116 8 108 8 L52 8 L46 0 L8 0 Q0 0 0 8 Z"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="1.5"
        />
        <rect x="20" y="34" width="76" height="4" rx="2" fill="#E5E7EB" opacity="0.6" />
        <rect x="20" y="46" width="60" height="4" rx="2" fill="#E5E7EB" opacity="0.6" />
      </g>
      <use href="#esBadgeFolder" x="148" y="114" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function EmptySearchIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(46 38)">
        <rect width="108" height="22" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="14" cy="11" r="4" fill="#D1D5DB" />
        <rect x="24" y="9" width="58" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(46 66)">
        <rect width="108" height="22" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="14" cy="11" r="4" fill="#D1D5DB" />
        <rect x="24" y="9" width="48" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(46 94)">
        <rect width="108" height="22" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <circle cx="14" cy="11" r="4" fill="#D1D5DB" />
        <rect x="24" y="9" width="42" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(122 80)">
        <circle r="22" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="3" />
      </g>
      <line x1="138" y1="96" x2="156" y2="114" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" />
    </IllustrationFrame>
  );
}

export function EmptyNoThreadSelectedIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(50 50)">
        <path
          d="M0 8 Q0 0 8 0 H80 Q88 0 88 8 V32 Q88 40 80 40 H28 L18 50 L20 40 H8 Q0 40 0 32 Z"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="1.5"
        />
        <rect x="12" y="12" width="44" height="4" rx="2" fill="#E5E7EB" />
        <rect x="12" y="22" width="32" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeCursor" x="138" y="100" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function ActivityNoActivityIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(20 80)">
        <line
          x1="0"
          y1="0"
          x2="160"
          y2="0"
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
        <circle cx="20" cy="0" r="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="60" cy="0" r="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="100" cy="0" r="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="140" cy="0" r="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
      <g transform="translate(40 36)">
        <rect width="56" height="20" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
      </g>
      <g transform="translate(110 100)">
        <rect width="56" height="20" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
      </g>
    </IllustrationFrame>
  );
}

export function ActivityFilterNoResultsIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(20 80)">
        <line
          x1="0"
          y1="0"
          x2="160"
          y2="0"
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
        <circle cx="40" cy="0" r="5" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="120" cy="0" r="5" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
      <use href="#esBadgeFilter" x="146" y="112" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function ActivityErrorIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 80) rotate(-3) translate(-50 -32)">
        <rect width="100" height="64" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="48" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeWarn" x="146" y="112" width="34" height="34" />
    </IllustrationFrame>
  );
}

export function ActivityUnauthenticatedIllustration(props: IllustrationProps) {
  return (
    <IllustrationFrame {...props}>
      <g transform="translate(100 80) rotate(-3) translate(-50 -32)" opacity="0.7">
        <rect width="100" height="64" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="48" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <use href="#esBadgeLock" x="142" y="108" width="38" height="38" />
    </IllustrationFrame>
  );
}
