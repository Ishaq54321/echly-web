import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import { checkRateLimit, clientKeyFromRequest } from "@/lib/server/rateLimit";
import "@/lib/server/firebaseAdmin"; // ensure Admin SDK is initialized

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per client to prevent email enumeration.
    const rl = checkRateLimit({
      key: `check-email:${clientKeyFromRequest(req)}`,
      max: 5,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      return apiError({
        code: "FORBIDDEN",
        message: "Too many requests. Please try again later.",
        status: 429,
      });
    }

    const body = await req.json() as { email?: unknown };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

    if (!email || !email.includes("@")) {
      return apiError({
        code: "INVALID_INPUT",
        message: "Valid email required",
        status: 400,
      });
    }

    let exists = false;
    try {
      await getAuth().getUserByEmail(email);
      exists = true;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        exists = false;
      } else {
        throw err;
      }
    }

    // Small random delay to flatten timing-attack signal between hit/miss paths.
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.floor(Math.random() * 150))
    );

    return apiSuccess({ exists });
  } catch (err) {
    console.error("[check-email]", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Could not check email",
      status: 500,
    });
  }
}
