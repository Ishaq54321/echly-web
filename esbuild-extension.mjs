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
  outfile: path.join(extDir, "bootstrap.js"),
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
  outdir: path.join(extDir, "widget"),
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
  outfile: path.join(extDir, "background.js"),
  platform: "browser",
  target: "es2020",
  minify: true,
  sourcemap: false,
  define,
  absWorkingDir: root,
});
