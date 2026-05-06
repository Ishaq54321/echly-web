"use client";

import * as React from "react";

type IlluProps = { className?: string };

function Frame({ className, children }: IlluProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      {children}
    </svg>
  );
}

const BadgePlus = ({ x, y, size = 32 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <path d="M-6 0 H6 M0 -6 V6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </g>
);

const BadgeCheck = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <path
      d="M-6 0 L-1.5 5 L7 -5"
      fill="none"
      stroke="#fff"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

const BadgeArchive = ({ x, y, size = 32 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <rect x="-7" y="-5" width="14" height="3" fill="#fff" rx="0.6" />
    <rect x="-6" y="-1" width="12" height="7" fill="none" stroke="#fff" strokeWidth="2" />
    <line x1="-2.5" y1="2" x2="2.5" y2="2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </g>
);

const BadgeCursor = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <path d="M-4 -6 L6 1.5 L1 2.5 L4 8 L1.5 9 L-1.5 3.5 L-5 6 Z" fill="#fff" />
  </g>
);

const BadgeImage = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <rect x="-7" y="-6" width="14" height="11" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" />
    <circle cx="-3" cy="-2" r="1.5" fill="#fff" />
    <path
      d="M-7 4 L-1 -1 L3 2 L7 -2"
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

const BadgeText = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <line x1="-7" y1="-4" x2="7" y2="-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="-7" y1="0" x2="5" y2="0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="-7" y1="4" x2="3" y2="4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
  </g>
);

const BadgeChecklist = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x + size / 2} ${y + size / 2}) scale(${size / 32})`}>
    <circle r="14" fill="#6B7280" />
    <path
      d="M-7 -5 L-5 -3 L-2 -6"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M-7 0 L-5 2 L-2 -1"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="1" y1="-4" x2="7" y2="-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="1" x2="7" y2="1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </g>
);

/** #1 No sessions — three tilted cards + plus badge */
export function NoSessionsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-15) translate(-50 -34)">
        <rect width="100" height="68" rx="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
      </g>
      <g transform="translate(100 82) rotate(5) translate(-50 -34)">
        <rect width="100" height="68" rx="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="40" height="6" rx="3" fill="#D1D5DB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="46" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(100 82) rotate(-3) translate(-50 -28)">
        <rect width="100" height="56" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="5" fill="#E5E7EB" />
        <rect x="26" y="13" width="44" height="5" rx="2.5" fill="#D1D5DB" />
        <rect x="14" y="32" width="72" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="42" width="50" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgePlus x={148} y={118} size={32} />
    </Frame>
  );
}

/** #2 Archived empty */
export function ArchivedEmptyIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-10) translate(-50 -34)">
        <rect width="100" height="68" rx="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="14" y="18" width="44" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="32" width="60" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(100 82) rotate(8) translate(-50 -30)">
        <rect width="100" height="60" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="14" width="38" height="6" rx="3" fill="#D1D5DB" />
        <rect x="14" y="28" width="72" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="38" width="50" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgeArchive x={146} y={116} size={32} />
    </Frame>
  );
}

/** #3 Filter / search no results — card with magnifier */
export function NoResultsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-7) translate(-50 -34)">
        <rect width="100" height="68" rx="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="14" y="18" width="42" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="32" width="62" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="42" width="48" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <g transform="translate(122 96)">
        <circle r="22" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="3" />
        <circle r="22" fill="none" stroke="#E5E7EB" strokeWidth="1" />
      </g>
      <line
        x1="138"
        y1="112"
        x2="156"
        y2="130"
        stroke="#9CA3AF"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** #4 No tickets — clipboard + plus */
export function NoTicketsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-4) translate(-44 -52)">
        <rect x="0" y="6" width="88" height="100" rx="10" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="26" y="0" width="36" height="14" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="32" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="44" width="48" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="56" width="56" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgePlus x={148} y={116} size={32} />
    </Frame>
  );
}

/** #5 Ticket search no results — list rows + magnifier */
export function TicketSearchEmptyIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(46 38)">
        <rect width="108" height="20" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="10" y="7" width="6" height="6" rx="1.5" fill="#D1D5DB" />
        <rect x="22" y="7" width="60" height="6" rx="3" fill="#E5E7EB" />
      </g>
      <g transform="translate(46 64)">
        <rect width="108" height="20" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="10" y="7" width="6" height="6" rx="1.5" fill="#D1D5DB" />
        <rect x="22" y="7" width="50" height="6" rx="3" fill="#E5E7EB" />
      </g>
      <g transform="translate(46 90)">
        <rect width="108" height="20" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="10" y="7" width="6" height="6" rx="1.5" fill="#D1D5DB" />
        <rect x="22" y="7" width="44" height="6" rx="3" fill="#E5E7EB" />
      </g>
      <g transform="translate(120 78)">
        <circle r="20" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="3" />
      </g>
      <line
        x1="134"
        y1="92"
        x2="152"
        y2="110"
        stroke="#9CA3AF"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Frame>
  );
}

/** #6 No open tickets — cards + check */
export function NoOpenTicketsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-12) translate(-50 -36)">
        <rect width="100" height="72" rx="12" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
      </g>
      <g transform="translate(100 82) rotate(2) translate(-50 -32)">
        <rect width="100" height="64" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#D1D5DB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="40" width="40" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgeCheck x={146} y={114} size={34} />
    </Frame>
  );
}

/** #7 No resolved tickets — dashed cards */
export function NoResolvedTicketsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-8) translate(-50 -34)">
        <rect
          width="100"
          height="68"
          rx="12"
          fill="#FFFFFF"
          stroke="#D1D5DB"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <rect x="14" y="16" width="44" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="30" width="60" height="4" rx="2" fill="#F3F4F6" />
      </g>
      <g transform="translate(100 82) rotate(8) translate(-50 -30)">
        <rect
          width="100"
          height="60"
          rx="12"
          fill="#FFFFFF"
          stroke="#D1D5DB"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <rect x="14" y="14" width="38" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="26" width="56" height="4" rx="2" fill="#F3F4F6" />
        <rect x="14" y="36" width="44" height="4" rx="2" fill="#F3F4F6" />
      </g>
    </Frame>
  );
}

/** #8 No ticket selected — single card + cursor */
export function NoTicketSelectedIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 82) rotate(-3) translate(-54 -32)">
        <rect width="108" height="64" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="14" width="44" height="5" rx="2.5" fill="#D1D5DB" />
        <rect x="14" y="28" width="76" height="4" rx="2" fill="#E5E7EB" />
        <rect x="14" y="38" width="56" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgeCursor x={138} y={106} size={34} />
    </Frame>
  );
}

/** #9 No comments — chat bubbles */
export function NoCommentsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(60 64)">
        <path
          d="M0 0 H80 Q88 0 88 8 V36 Q88 44 80 44 H28 L18 56 L20 44 H8 Q0 44 0 36 Z"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="1.5"
        />
      </g>
      <g transform="translate(96 96)">
        <path
          d="M0 0 H64 Q72 0 72 8 V28 Q72 36 64 36 H22 L14 46 L16 36 H8 Q0 36 0 28 Z"
          fill="#FFFFFF"
          stroke="#D1D5DB"
          strokeWidth="1.5"
        />
        <rect x="12" y="12" width="40" height="4" rx="2" fill="#E5E7EB" />
        <rect x="12" y="22" width="28" height="4" rx="2" fill="#E5E7EB" />
      </g>
    </Frame>
  );
}

/** #10 No screenshot — image card + image badge */
export function NoScreenshotIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 80) rotate(-3) translate(-58 -42)">
        <rect
          width="116"
          height="84"
          rx="10"
          fill="#F3F4F6"
          stroke="#D1D5DB"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx="38" cy="34" r="8" fill="#E5E7EB" />
        <path d="M14 70 L48 40 L72 60 L102 36 L102 70 Z" fill="#E5E7EB" />
      </g>
      <BadgeImage x={148} y={112} size={34} />
    </Frame>
  );
}

/** #11 No description — card + text badge */
export function NoDescriptionIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 80) rotate(-3) translate(-50 -40)">
        <rect width="100" height="80" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="14" y="16" width="60" height="5" rx="2.5" fill="#E5E7EB" />
        <rect x="14" y="30" width="72" height="4" rx="2" fill="#F3F4F6" />
        <rect x="14" y="42" width="64" height="4" rx="2" fill="#F3F4F6" />
        <rect x="14" y="54" width="40" height="4" rx="2" fill="#F3F4F6" />
      </g>
      <BadgeText x={148} y={112} size={34} />
    </Frame>
  );
}

/** #12 No action steps — checklist card */
export function NoActionStepsIllu({ className }: IlluProps) {
  return (
    <Frame className={className}>
      <g transform="translate(100 80) rotate(-3) translate(-50 -40)">
        <rect width="100" height="80" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="4" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="30" y="20" width="50" height="4" rx="2" fill="#E5E7EB" />
        <circle cx="20" cy="40" r="4" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="30" y="38" width="58" height="4" rx="2" fill="#E5E7EB" />
        <circle cx="20" cy="58" r="4" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="30" y="56" width="40" height="4" rx="2" fill="#E5E7EB" />
      </g>
      <BadgeChecklist x={148} y={112} size={34} />
    </Frame>
  );
}
