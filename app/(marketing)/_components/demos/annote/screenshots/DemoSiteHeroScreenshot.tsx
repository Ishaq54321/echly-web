"use client";

/**
 * Mock screenshot for the freshly-captured demo ticket ("hero copy could be
 * clearer"). Mirrors the FauxSite hero — nav bar, headline, sub-line, CTA, and
 * an abstract illustration on the right. The headline is framed with the
 * capture highlight (this is what the demo user "circled").
 *
 * Marketing-only. Pure SVG, no assets. ~280×180.
 */

import React from "react";

export function DemoSiteHeroScreenshot() {
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Demo site hero, headline highlighted">
      <defs>
        <linearGradient id="hcd-shot-illu" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9D8CF0" />
          <stop offset="100%" stopColor="#5A49BF" />
        </linearGradient>
      </defs>
      <rect width="280" height="180" fill="#FBFBFD" />
      {/* Nav bar */}
      <rect x="0" y="0" width="280" height="28" fill="#FFFFFF" />
      <rect x="20" y="11" width="14" height="7" rx="2" fill="#6E7A9A" />
      <rect x="180" y="12" width="18" height="4" rx="2" fill="#C2C6CF" />
      <rect x="206" y="12" width="18" height="4" rx="2" fill="#C2C6CF" />
      <rect x="232" y="9" width="30" height="11" rx="5" fill="#1F2333" />
      <line x1="0" y1="28" x2="280" y2="28" stroke="#EEEFF2" />

      {/* Hero text (left) */}
      <rect x="20" y="56" width="120" height="10" rx="3" fill="#1B1F2C" />
      <rect x="20" y="72" width="92" height="10" rx="3" fill="#1B1F2C" />
      <rect x="20" y="94" width="130" height="4.5" rx="2" fill="#9AA0AC" />
      <rect x="20" y="104" width="104" height="4.5" rx="2" fill="#9AA0AC" />
      <rect x="20" y="124" width="64" height="16" rx="7" fill="#5A49BF" />

      {/* Abstract illustration (right) */}
      <circle cx="222" cy="92" r="34" fill="url(#hcd-shot-illu)" opacity="0.9" />
      <circle cx="196" cy="116" r="18" fill="#C9C0F2" opacity="0.85" />
      <rect x="208" y="120" width="44" height="22" rx="6" fill="#FFFFFF" stroke="#E4E6EC" />
      <polyline points="214,136 222,128 230,133 240,124 246,130" fill="none" stroke="#5A49BF" strokeWidth="1.6" />

      {/* Capture highlight on the headline */}
      <rect x="14" y="50" width="134" height="38" rx="7" fill="rgba(90,73,191,0.10)" stroke="#5A49BF" strokeWidth="2" />
    </svg>
  );
}
