/** Single source of truth for the extension. All backend and login URLs use this during development.
 *  In production builds these are replaced at compile time by esbuild-extension.mjs via `define`.
 *  Set ECHLY_WEB_APP_URL (and optionally ECHLY_API_BASE) in the environment before building.
 *
 *  The localhost fallback only applies in dev builds. In prod builds the env vars
 *  are mandatory — esbuild-extension.mjs exits non-zero if ECHLY_WEB_APP_URL is unset,
 *  so the `??` branch below cannot be reached and minifies away to dead code.
 */
const DEV_FALLBACK =
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "";

export const WEB_APP_URL = process.env.ECHLY_WEB_APP_URL ?? DEV_FALLBACK;
export const API_BASE =
  process.env.ECHLY_API_BASE ?? process.env.ECHLY_WEB_APP_URL ?? DEV_FALLBACK;
