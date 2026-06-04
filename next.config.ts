import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/app", destination: "/dashboard", permanent: false }];
  },
  images: {
    // remotePatterns status (Fix 6 — image-system audit):
    //   AVATARS DO NOT use next/image. Every avatar renders via a raw <img>
    //   (UserAvatar + the workspace/brand logos) — a deliberate choice for this
    //   pass (hotlink Google's CDN + Firebase Storage signed URLs; no next/image
    //   migration). So these patterns are NOT exercised by avatars.
    //
    //   They ARE still required, though: optimized <Image> components DO load
    //   remote hosts here — notably the feedback SCREENSHOT viewer
    //   (components/discussion/DiscussionConversation.tsx) renders remote
    //   firebasestorage/storage.googleapis.com screenshot URLs through the Next
    //   image optimizer (it only sets `unoptimized` for inline data: URLs).
    //   Removing these hosts would 400 those optimized requests. Keep as-is.
    //   (lh3/googleusercontent kept for any future next/image avatar adoption.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "echly-b74cc.firebasestorage.app",
      },
    ],
  },
};

export default nextConfig;
