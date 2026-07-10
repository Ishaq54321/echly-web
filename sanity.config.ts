"use client";

/**
 * Configuration for the embedded Sanity Studio that is served at /studio.
 *
 * This file is imported by app/studio/[[...tool]]/page.tsx via <NextStudio />,
 * so the Studio deploys with the rest of the Next.js app on the same Vercel
 * push — there is no separately hosted studio to maintain.
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/deskStructure";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Vision lets you test GROQ queries from inside the Studio (dev tool).
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
