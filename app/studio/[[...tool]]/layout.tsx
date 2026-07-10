import type { Metadata } from "next";

/**
 * Minimal layout for the Studio. It keeps the Studio out of search engine
 * indexes (it's an editing tool, not a public page) and otherwise gets out of
 * the way so NextStudio can render full-screen.
 */
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
