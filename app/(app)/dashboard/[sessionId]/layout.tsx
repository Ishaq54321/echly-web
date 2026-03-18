/**
 * Session page layout: full viewport, no page-level scroll.
 * Negative vertical margin counteracts (app) layout's py-8 so the session
 * fills the viewport and sidebar/main scroll independently (Slack/Notion style).
 */
export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-my-8 h-screen overflow-hidden flex flex-col min-h-0">
      {children}
    </div>
  );
}
