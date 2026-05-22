"use client";

/**
 * Mock screenshot for the "add testimonial from agency customer" ticket.
 * A landing area near pricing with an empty dashed slot where testimonials would
 * go; the slot is framed with a dashed capture highlight.
 *
 * Marketing-only. Pure SVG, no assets. ~280×180.
 *
 * (Kept as its own component for clarity; the t5 ticket actually points at
 * LandingSectionScreenshot with highlight="testimonial-slot", but this exists
 * for direct use if a ticket maps to a dedicated empty-slot frame.)
 */

import React from "react";

export function TestimonialSlotScreenshot() {
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Landing area with empty testimonial slot">
      <rect width="280" height="180" fill="#F6F7F9" />
      {/* Pricing teaser row above */}
      {[24, 110, 196].map((x) => (
        <rect key={x} x={x} y="18" width="60" height="40" rx="7" fill="#FFFFFF" stroke="#E4E6EC" />
      ))}
      {/* Section heading for testimonials */}
      <rect x="100" y="74" width="80" height="7" rx="3.5" fill="#1B1F2C" opacity="0.6" />
      {/* Empty dashed slot */}
      <rect x="24" y="94" width="232" height="62" rx="10" fill="#FFFFFF" stroke="#C8CCD5" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="140" y="129" textAnchor="middle" fontSize="9" fill="#A6ABB6" fontFamily="sans-serif">
        Testimonials
      </text>

      {/* Capture highlight on the slot */}
      <rect x="20" y="90" width="240" height="70" rx="12" fill="rgba(90,73,191,0.08)" stroke="#5A49BF" strokeWidth="2" strokeDasharray="7 4" />
    </svg>
  );
}
