import { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "https://echly-web.vercel.app",
];

export function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  // Chrome extension: origin is chrome-extension://<id> — must echo exact origin when credentials: include
  if (origin.startsWith("chrome-extension://")) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    };
  }

  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  };
}
