"use client";

/**
 * Mock screenshot for the "login button not working on mobile" ticket.
 * A simplified phone-shaped login form; the submit button is framed with the
 * #5A49BF capture highlight rectangle.
 *
 * Marketing-only. Pure SVG, no assets. ~280×180 to fit the EditModal slot.
 */

import React from "react";

export function MobileLoginScreenshot() {
  return (
    <svg viewBox="0 0 280 180" width="100%" height="100%" role="img" aria-label="Mobile login screen, submit button highlighted">
      <rect width="280" height="180" fill="#EEF0F3" />
      {/* Phone frame */}
      <rect x="100" y="14" width="80" height="152" rx="12" fill="#FFFFFF" stroke="#D7DAE0" strokeWidth="1.5" />
      <rect x="128" y="20" width="24" height="3" rx="1.5" fill="#D7DAE0" />
      {/* App header */}
      <rect x="110" y="34" width="36" height="6" rx="3" fill="#9AA0AC" />
      {/* Inputs */}
      <rect x="110" y="56" width="60" height="13" rx="4" fill="#F2F3F6" stroke="#E0E2E8" />
      <rect x="110" y="74" width="60" height="13" rx="4" fill="#F2F3F6" stroke="#E0E2E8" />
      {/* Submit button (highlighted) */}
      <rect x="110" y="96" width="60" height="15" rx="5" fill="#1F2333" />
      <rect x="124" y="101" width="32" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
      {/* Helper link */}
      <rect x="122" y="120" width="36" height="4" rx="2" fill="#C2C6CF" />

      {/* Capture highlight on the submit button */}
      <rect x="106" y="92" width="68" height="23" rx="7" fill="rgba(90,73,191,0.10)" stroke="#5A49BF" strokeWidth="2" />
    </svg>
  );
}
