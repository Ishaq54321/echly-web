import * as esbuild from "esbuild";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname);
const extDir = path.resolve(root, "echly-extension");

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

// ECHLY_WEB_APP_URL must be set in CI/CD for production builds.
// Falls back to localhost for local development.
const webAppUrl = process.env.ECHLY_WEB_APP_URL || "http://localhost:3000";
const apiBase = process.env.ECHLY_API_BASE || webAppUrl;

if (isProd && webAppUrl === "http://localhost:3000") {
  console.error(
    "[esbuild] WARNING: Building in production mode but ECHLY_WEB_APP_URL is not set. " +
    "The extension will point at localhost and will not work for real users."
  );
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

// Widget: heavy React UI, lazy-loaded via <script src="widget.js"> by bootstrap.
await esbuild.build({
  entryPoints: [path.join(extDir, "src", "content.tsx")],
  bundle: true,
  format: "iife",
  outfile: path.join(extDir, "widget.js"),
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
