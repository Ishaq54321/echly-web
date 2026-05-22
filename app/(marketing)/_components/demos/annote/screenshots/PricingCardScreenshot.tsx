"use client";

/**
 * Mock screenshot for the "pricing card hover state feels slow" ticket.
 * Three pricing cards; the middle (Pro) card is lifted/elevated to suggest the
 * hover state, and is framed with the capture highlight.
 *
 * Marketing-only. Pure SVG, no assets. ~280×180.
 */

import React from "react";

export function PricingCardScreenshot() {
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Pricing cards, Pro card hover state highlighted">
      <rect width="280" height="180" fill="#F4F5F8" />
      {/* Side cards */}
      {[28, 188].map((x) => (
        <g key={x}>
          <rect x={x} y="34" width="64" height="112" rx="9" fill="#FFFFFF" stroke="#E4E6EC" />
          <rect x={x + 12} y="48" width="30" height="6" rx="3" fill="#9AA0AC" />
          <rect x={x + 12} y="62" width="22" height="10" rx="3" fill="#2B2F3D" />
          <rect x={x + 12} y="84" width="40" height="3.5" rx="1.75" fill="#D2D5DD" />
          <rect x={x + 12} y="93" width="36" height="3.5" rx="1.75" fill="#D2D5DD" />
          <rect x={x + 12} y="102" width="40" height="3.5" rx="1.75" fill="#D2D5DD" />
          <rect x={x + 12} y="124" width="40" height="11" rx="5" fill="#EDEEF2" />
        </g>
      ))}
      {/* Center (Pro) card — elevated/hovered */}
      <rect x="106" y="24" width="68" height="128" rx="10" fill="#FFFFFF" stroke="#CFC8EE" strokeWidth="1.5" />
      <rect x="106" y="24" width="68" height="128" rx="10" fill="#5A49BF" opacity="0.03" />
      <rect x="120" y="40" width="32" height="6" rx="3" fill="#5A49BF" />
      <rect x="120" y="54" width="26" height="12" rx="3" fill="#1F2333" />
      <rect x="120" y="80" width="44" height="3.5" rx="1.75" fill="#C8CCD5" />
      <rect x="120" y="90" width="40" height="3.5" rx="1.75" fill="#C8CCD5" />
      <rect x="120" y="100" width="44" height="3.5" rx="1.75" fill="#C8CCD5" />
      <rect x="120" y="128" width="44" height="12" rx="6" fill="#5A49BF" />

      {/* Capture highlight on the Pro card */}
      <rect x="102" y="20" width="76" height="136" rx="12" fill="rgba(90,73,191,0.06)" stroke="#5A49BF" strokeWidth="2" />
    </svg>
  );
}
