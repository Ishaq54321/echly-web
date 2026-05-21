import { ImageResponse } from "next/og";

// Default Open Graph image for the marketing site. Typographic only —
// Phase 2 may refine with imagery. Runs on the Edge runtime so it can be
// regenerated cheaply.

export const runtime = "edge";
export const alt = "Annote — Feedback at the speed of seeing it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#FAF9F7",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#15101F",
            letterSpacing: "-0.01em",
          }}
        >
          Annote
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              color: "#15101F",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            Feedback at the speed of seeing it.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#54495F",
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            Click anywhere. Speak in your own words. Annote turns it into a
            structured ticket inside a session you can share with one link.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#5A49BF",
            }}
          />
          <div style={{ fontSize: 22, color: "#8A8096" }}>annote.ai</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
