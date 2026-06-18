// /docs entry point. The docs themselves are shipped verbatim as static HTML
// under public/docs/ (own design system in docs.css). The welcome email and
// the marketing nav both link to /docs, so this route stays as the stable
// entry and forwards to the static docs home.
import { redirect } from "next/navigation";

export default function DocsPage() {
  redirect("/docs/index.html");
}
