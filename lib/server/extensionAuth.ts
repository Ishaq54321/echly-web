import { jwtVerify } from "jose";

export interface ExtensionTokenPayload {
  uid: string;
  email: string | null;
  type: "extension";
}

function getExtensionSecret(): Uint8Array {
  const secret = process.env.EXTENSION_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "EXTENSION_TOKEN_SECRET must be set and at least 16 characters"
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify a short-lived extension JWT.
 * Used by extension API routes to authenticate requests that send the extension token.
 * Returns the payload or null if invalid/expired.
 */
export async function verifyExtensionToken(
  token: string
): Promise<ExtensionTokenPayload | null> {
  try {
    const secret = getExtensionSecret();
    const { payload } = await jwtVerify(token, secret, {
      maxTokenAge: "15m",
    });
    if ((payload.type as string) !== "extension") {
      return null;
    }
    return {
      uid: payload.uid as string,
      email: (payload.email as string) ?? null,
      type: "extension",
    };
  } catch {
    return null;
  }
}
