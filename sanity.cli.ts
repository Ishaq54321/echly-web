import { defineCliConfig } from "sanity/cli";

/**
 * Config for the Sanity command-line tools (e.g. `npx sanity` for managing
 * datasets, CORS, tokens). Reads the same env vars as the app so nothing is
 * hardcoded. Not required for the site to run — the app uses sanity.config.ts.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  // Studio is embedded in the Next.js app, not deployed to *.sanity.studio.
  autoUpdates: false,
});
