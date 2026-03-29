const fs = require("fs");
const path = require("path");
try {
  require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });
} catch {
  /* dotenv optional until firebase loads */
}

/** tsx bypasses Module._resolveFilename for some loads; patch the package on disk briefly. */
const serverOnlyIndex = path.join(
  process.cwd(),
  "node_modules",
  "server-only",
  "index.js"
);
let serverOnlyBackup = null;
if (fs.existsSync(serverOnlyIndex)) {
  serverOnlyBackup = fs.readFileSync(serverOnlyIndex, "utf8");
  fs.writeFileSync(serverOnlyIndex, "module.exports = {};\n");
}
function restoreServerOnly() {
  if (serverOnlyBackup != null) {
    try {
      fs.writeFileSync(serverOnlyIndex, serverOnlyBackup);
    } catch {
      /* ignore */
    }
  }
}
process.on("exit", restoreServerOnly);
process.on("SIGINT", () => {
  restoreServerOnly();
  process.exit(130);
});
process.on("SIGTERM", () => {
  restoreServerOnly();
  process.exit(143);
});
