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
      build.onResolve({ filter: /^@\// }, (args) => {
        const sub = args.path.slice(2);
        const resolved = resolveFilePath(root, sub);
        return { path: path.resolve(resolved) };
      });
      build.onResolve({ filter: /^@\/lib\/firebase$/ }, () => ({
        path: path.resolve(extDir, "src", "firebase.ts"),
      }));
      build.onResolve({ filter: /^next\/image$/ }, () => ({
        path: path.resolve(extDir, "stubs", "next-image.tsx"),
      }));
      if (useContentAuthFetch) {
        build.onResolve({ filter: /^@\/lib\/authFetch$/ }, () => ({
          path: path.resolve(extDir, "src", "contentAuthFetch.ts"),
        }));
      }
    },
  };
}

await esbuild.build({
  entryPoints: [path.join(extDir, "src", "popup.tsx")],
  bundle: true,
  outfile: path.join(extDir, "popup.js"),
  platform: "browser",
  target: "es2020",
  loader: { ".css": "empty" },
  plugins: [makeAliasPlugin(false)],
  absWorkingDir: root,
});

await esbuild.build({
  entryPoints: [path.join(extDir, "src", "content.tsx")],
  bundle: true,
  outfile: path.join(extDir, "content.js"),
  platform: "browser",
  target: "es2020",
  loader: { ".css": "empty" },
  plugins: [makeAliasPlugin(true)],
  absWorkingDir: root,
});
