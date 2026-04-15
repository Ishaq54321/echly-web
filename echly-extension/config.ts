/** Single source of truth for the extension. All backend and login URLs use this during development.
 *  In production builds these are replaced at compile time by esbuild-extension.mjs via `define`.
 *  Set ECHLY_WEB_APP_URL (and optionally ECHLY_API_BASE) in the environment before building.
 */
export const WEB_APP_URL =
  process.env.ECHLY_WEB_APP_URL ?? "http://localhost:3000";
export const API_BASE =
  process.env.ECHLY_API_BASE ?? process.env.ECHLY_WEB_APP_URL ?? "http://localhost:3000";
