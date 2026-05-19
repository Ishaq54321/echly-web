import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gc_oauth_state";
const SCOPE = "https://www.googleapis.com/auth/contacts.readonly";

type Contact = { name: string; email: string };

function htmlResponse(payload: {
  ok: boolean;
  contacts?: Contact[];
  error?: string;
}): NextResponse {
  // Strip cookie + render an HTML page that posts the result back to the
  // opener window. This is the popup pattern — the parent listens for the
  // "annote:google-contacts" message.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  const body = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Authorizing…</title></head>
<body style="font-family: system-ui; padding: 24px; color: #333;">
<p>${payload.ok ? "Loading contacts…" : "Authorization failed."}</p>
<script>
(function () {
  var payload = ${json};
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ source: "annote:google-contacts", payload: payload }, window.location.origin);
    }
  } catch (e) {}
  setTimeout(function () { window.close(); }, 250);
})();
</script>
</body></html>`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": `${STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
      "Cache-Control": "no-store",
    },
  });
}

function readCookie(req: NextRequest, name: string): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.split("=");
    if (k && k.trim() === name) {
      return decodeURIComponent(rest.join("=").trim());
    }
  }
  return null;
}

function getOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : "";
}

async function exchangeCode(opts: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ access_token: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { access_token: string };
}

async function fetchContacts(accessToken: string): Promise<Contact[]> {
  const url = new URL("https://people.googleapis.com/v1/people/me/connections");
  url.searchParams.set("personFields", "emailAddresses,names");
  url.searchParams.set("pageSize", "100");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Contacts fetch failed: ${res.status} ${text}`);
  }
  const body = (await res.json()) as {
    connections?: Array<{
      names?: Array<{ displayName?: string; unstructuredName?: string }>;
      emailAddresses?: Array<{ value?: string }>;
    }>;
  };
  const seen = new Set<string>();
  const contacts: Contact[] = [];
  for (const c of body.connections ?? []) {
    const email = c.emailAddresses?.[0]?.value?.toLowerCase().trim();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const name =
      c.names?.[0]?.displayName ||
      c.names?.[0]?.unstructuredName ||
      email.split("@")[0];
    contacts.push({ name, email });
  }
  return contacts;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return htmlResponse({ ok: false, error });
  }
  if (!code || !state) {
    return htmlResponse({ ok: false, error: "missing_params" });
  }

  const cookieState = readCookie(req, STATE_COOKIE);
  if (!cookieState || cookieState !== state) {
    return htmlResponse({ ok: false, error: "state_mismatch" });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlResponse({ ok: false, error: "oauth_not_configured" });
  }

  const origin = getOrigin(req);
  const redirectUri = `${origin}/api/auth/google-contacts/callback`;

  try {
    const tokenResp = await exchangeCode({
      code,
      redirectUri,
      clientId,
      clientSecret,
    });
    if (!tokenResp.access_token) {
      return htmlResponse({ ok: false, error: "no_access_token" });
    }
    void SCOPE; // referenced in authorize URL — kept for symmetry/grep
    const contacts = await fetchContacts(tokenResp.access_token);
    return htmlResponse({ ok: true, contacts });
  } catch (err) {
    console.error("/api/auth/google-contacts/callback:", err);
    return htmlResponse({ ok: false, error: "exchange_failed" });
  }
}
