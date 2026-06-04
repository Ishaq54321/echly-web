import * as esbuild from "esbuild";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname);
const extDir = path.resolve(root, "annote-extension");

function resolveFilePath(dir, base) {
  const candidates = [
    base + ".tsx",
    base + ".ts",
    base + ".css",
    base + path.sep + "index.tsx",
    base + path.sep + "index.ts",
  ];
  for (const c of candidates) {
    const full = path.resolve(dir, c);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  const exact = path.resolve(dir, base);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;
  return path.resolve(dir, base + ".ts");
}

function makeAliasPlugin(useContentAuthFetch = false) {
  return {
    name: "alias",
    setup(build) {
      // Specific aliases must run before the generic @/ resolver so they take precedence.
      build.onResolve({ filter: /^@\/lib\/firebase$/ }, () => ({
        path: path.resolve(extDir, "stubs", "firebase.ts"),
      }));
      if (useContentAuthFetch) {
        build.onResolve({ filter: /^@\/lib\/authFetch$/ }, () => ({
          path: path.resolve(extDir, "src", "contentAuthFetch.ts"),
        }));
        build.onResolve({ filter: /^@\/lib\/uploadAttachment$/ }, () => ({
          path: path.resolve(extDir, "stubs", "uploadAttachment.ts"),
        }));
      }
      build.onResolve({ filter: /^next\/image$/ }, () => ({
        path: path.resolve(extDir, "stubs", "next-image.tsx"),
      }));
      build.onResolve({ filter: /^@\// }, (args) => {
        const sub = args.path.slice(2);
        const resolved = resolveFilePath(root, sub);
        return { path: path.resolve(resolved) };
      });
    },
  };
}

const nodeEnv = process.env.NODE_ENV || "production";
const isProd = nodeEnv === "production";

// ECHLY_WEB_APP_URL must be set for production builds. Falls back to localhost
// only in dev builds; in prod we exit hard so a misconfigured CI never ships an
// extension that points at localhost (this happened once already — see audit).
if (isProd && !process.env.ECHLY_WEB_APP_URL) {
  console.error(
    "[esbuild] ECHLY_WEB_APP_URL is not set but NODE_ENV=production.\n" +
    "         Refusing to build an extension that would point at localhost.\n" +
    "         Set ECHLY_WEB_APP_URL=https://annote.ai (and optionally\n" +
    "         ECHLY_API_BASE) before running this script."
  );
  process.exit(1);
}

const webAppUrl = process.env.ECHLY_WEB_APP_URL || "http://localhost:3000";
const apiBase = process.env.ECHLY_API_BASE || webAppUrl;

// Parallel-build output dir. When ECHLY_EXT_OUT_DIR is set, build artifacts
// land there instead of extDir, and static assets (manifest, icons, fonts,
// popup.css) are copied across after the four esbuild passes finish. Input
// paths (entry points, alias-plugin stubs) always resolve from extDir.
const outDir = process.env.ECHLY_EXT_OUT_DIR
  ? path.resolve(root, process.env.ECHLY_EXT_OUT_DIR)
  : extDir;
const isParallelBuild = outDir !== extDir;
if (isParallelBuild && !fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const define = {
  "process.env.NODE_ENV": JSON.stringify(nodeEnv),
  "process.env.ECHLY_WEB_APP_URL": JSON.stringify(webAppUrl),
  "process.env.ECHLY_API_BASE": JSON.stringify(apiBase),
  "process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""),
};

// Bootstrap: tiny static content script (registered via manifest content_scripts).
// Always minified; lazy-loads widget.js on demand. Must stay small (~5KB target).
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "bootstrap.ts")],
  bundle: true,
  format: "iife",
  outfile: path.join(outDir, "bootstrap.js"),
  platform: "browser",
  target: "chrome110",
  minify: true,
  treeShaking: true,
  sourcemap: false,
  jsx: "automatic",
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
    ".css": "empty",
  },
  plugins: [makeAliasPlugin(false)],
  define,
  absWorkingDir: root,
});

// Widget: heavy React UI, lazy-loaded by bootstrap via a dynamic import().
//
// format:"esm" + splitting lets esbuild emit shared/lazy chunks so the
// editor stack (TipTap/ProseMirror/emoji-picker) only downloads on first
// ticket edit. iife silently inlined every dynamic import, defeating that.
// Output is a directory (annote-extension/widget/) — the entry resolves its
// chunks by relative path from the extension origin at runtime.
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "content.tsx")],
  bundle: true,
  format: "esm",
  splitting: true,
  outdir: path.join(outDir, "widget"),
  entryNames: "widget",
  chunkNames: "chunks/[name]-[hash]",
  platform: "browser",
  target: "chrome110",
  minify: isProd,
  treeShaking: true,
  sourcemap: !isProd,
  jsx: "automatic",
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
    ".css": "empty",
  },
  plugins: [makeAliasPlugin(true)],
  define,
  absWorkingDir: root,
});

await esbuild.build({
  entryPoints: [path.join(extDir, "src", "background.ts")],
  bundle: true,
  outfile: path.join(outDir, "background.js"),
  platform: "browser",
  target: "es2020",
  minify: true,
  sourcemap: false,
  define,
  absWorkingDir: root,
});

// MAIN-world console capture: tiny IIFE injected into the page's own JS
// context via manifest content_scripts entry with "world": "MAIN" (Chrome
// 111+). Must be self-contained — no chrome.runtime access, no imports
// from the cross-realm logger. Stays small (target ~5KB).
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "console", "mainWorld.ts")],
  bundle: true,
  format: "iife",
  outfile: path.join(outDir, "mainWorld.js"),
  platform: "browser",
  target: "chrome111",
  minify: true,
  treeShaking: true,
  sourcemap: false,
  loader: {
    ".ts": "ts",
  },
  define,
  absWorkingDir: root,
});

// MAIN-world network capture: sibling bundle to mainWorld.js. Wraps fetch and
// XMLHttpRequest in the page's own JS context. Same constraints — no
// chrome.runtime, no cross-realm imports. Kept as a separate bundle so a bug
// in one wrapper cannot kill the other.
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "network", "mainWorldNetwork.ts")],
  bundle: true,
  format: "iife",
  outfile: path.join(outDir, "mainWorldNetwork.js"),
  platform: "browser",
  target: "chrome111",
  minify: true,
  treeShaking: true,
  sourcemap: false,
  loader: {
    ".ts": "ts",
  },
  define,
  absWorkingDir: root,
});

// MAIN-world user-actions capture: third sibling bundle. Listens for click /
// submit / input / focus / blur / visibility / resize / SPA-navigation events
// and pushes redacted UserAction entries into a per-realm ring buffer. Same
// constraints as the console + network MAIN-world bundles — no chrome.runtime,
// no cross-realm imports. A3 will wire the postMessage bridge and the
// background.ts injection on top of this file.
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "actions", "mainWorldActions.ts")],
  bundle: true,
  format: "iife",
  outfile: path.join(outDir, "mainWorldActions.js"),
  platform: "browser",
  target: "chrome111",
  minify: true,
  treeShaking: true,
  sourcemap: false,
  loader: {
    ".ts": "ts",
  },
  define,
  absWorkingDir: root,
});

// Parallel-build asset sync. esbuild only emits the four JS bundles; the
// loaded-unpacked extension also needs manifest, icons/fonts, the postcss-
// built popup.css, and the extension-fonts.css that the css script
// concatenates. For the localhost build we swap manifest.local.json into
// place as manifest.json so the dev sees a distinct name in chrome://extensions.
if (isParallelBuild) {
  const manifestSrc = fs.existsSync(path.join(extDir, "manifest.local.json"))
    ? path.join(extDir, "manifest.local.json")
    : path.join(extDir, "manifest.json");
  fs.copyFileSync(manifestSrc, path.join(outDir, "manifest.json"));

  for (const name of ["popup.css", "extension-fonts.css"]) {
    const src = path.join(extDir, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outDir, name));
    }
  }

  for (const dir of ["assets", "fonts"]) {
    const src = path.join(extDir, dir);
    if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
      fs.cpSync(src, path.join(outDir, dir), { recursive: true });
    }
  }

  console.log(`[esbuild] copied static assets to ${path.relative(root, outDir)}/`);
}
