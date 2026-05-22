"use client";

/**
 * Mock screenshot for the "Three moments section" + "testimonial slot" tickets.
 * A landing-page section with a heading and three content blocks. The `highlight`
 * prop chooses which region the capture rectangle frames.
 *
 * Marketing-only. Pure SVG, no assets. ~280×180.
 */

import React from "react";

export function LandingSectionScreenshot({ highlight }: { highlight?: string }) {
  const isTestimonial = highlight === "testimonial-slot";
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Landing page section">
      <rect width="280" height="180" fill="#F6F7F9" />
      {/* Section heading */}
      <rect x="24" y="22" width="120" height="9" rx="4.5" fill="#1B1F2C" opacity="0.75" />
      <rect x="24" y="38" width="180" height="5" rx="2.5" fill="#A6ABB6" />

      {/* Three blocks */}
      {[0, 1, 2].map((i) => {
        const x = 24 + i * 80;
        return (
          <g key={i}>
            <rect x={x} y="62" width="64" height="80" rx="8" fill="#FFFFFF" stroke="#E4E6EC" />
            <circle cx={x + 18} cy="80" r="9" fill="#E7E4F6" />
            <rect x={x + 12} y="98" width="40" height="6" rx="3" fill="#3A3F4D" opacity="0.7" />
            <rect x={x + 12} y="110" width="44" height="4" rx="2" fill="#C2C6CF" />
            <rect x={x + 12} y="119" width="36" height="4" rx="2" fill="#C2C6CF" />
            <rect x={x + 12} y="128" width="40" height="4" rx="2" fill="#C2C6CF" />
          </g>
        );
      })}

      {/* Capture highlight */}
      {isTestimonial ? (
        <rect x="20" y="150" width="240" height="22" rx="7" fill="rgba(90,73,191,0.10)" stroke="#5A49BF" strokeWidth="2" strokeDasharray="6 4" />
      ) : (
        <rect x="20" y="58" width="232" height="88" rx="9" fill="rgba(90,73,191,0.08)" stroke="#5A49BF" strokeWidth="2" />
      )}
    </svg>
  );
}
