import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = "echly-b74cc"; // use your real Firebase project id

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  return {
    uid: (payload.sub ?? payload.user_id) as string,
    ...payload,
  };
}

export async function requireAuth(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Missing token" }),
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    return await verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Response(
      JSON.stringify({ error: "Unauthorized - Invalid token" }),
      { status: 401 }
    );
  }
}
