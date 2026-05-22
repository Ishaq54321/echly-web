"use client";

/**
 * Screenshot router — maps a ticket's `screenshot.type` to its mock screenshot
 * component. Used inside the EditModal so each ticket shows a believable,
 * content-specific frame instead of a shared gradient placeholder.
 *
 * Marketing-only. Each underlying component is a self-contained SVG.
 */

import React from "react";
import type { ScreenshotData } from "../mockTickets";
import { MobileLoginScreenshot } from "./MobileLoginScreenshot";
import { LandingSectionScreenshot } from "./LandingSectionScreenshot";
import { PricingCardScreenshot } from "./PricingCardScreenshot";
import { FooterScreenshot } from "./FooterScreenshot";
import { TestimonialSlotScreenshot } from "./TestimonialSlotScreenshot";
import { DemoSiteHeroScreenshot } from "./DemoSiteHeroScreenshot";

export function MockScreenshot({ screenshot }: { screenshot: ScreenshotData }) {
  switch (screenshot.type) {
    case "mobile-login":
      return <MobileLoginScreenshot />;
    case "landing-section":
      // t5 reuses this with the testimonial-slot highlight; t2 frames the blocks.
      if (screenshot.highlight === "testimonial-slot") {
        return <TestimonialSlotScreenshot />;
      }
      return <LandingSectionScreenshot highlight={screenshot.highlight} />;
    case "pricing-card":
      return <PricingCardScreenshot />;
    case "footer":
      return <FooterScreenshot />;
    case "demo-site-hero":
      return <DemoSiteHeroScreenshot />;
    default:
      return null;
  }
}
