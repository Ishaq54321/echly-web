// Single import point for every marketing stylesheet.
//
// WHY THIS FILE EXISTS — do not import these .css files anywhere else.
// In the App Router, global CSS imported from different modules is split into
// per-chunk stylesheets whose <link> injection ORDER depends on which page was
// server-rendered first vs. reached by client-side navigation. When two sheets
// carry equal-specificity rules (marketing.css vs nova.css), the cascade
// winner flips between first load and client nav — fonts and spacing shift
// subtly. Funnelling every sheet through this one module pins one canonical
// order on every route, both on SSR and after navigation.
//
// Order matters: nova.css must follow marketing.css (its .nv-* overrides win
// by order), and the surface sheets (docs / use-cases / blog) follow nova so
// their scoped vocabularies can override nova defaults.
import "./marketing.css";
import "./nova.css";
import "./docs.css";
import "./use-cases.css";
import "./blog.css";
