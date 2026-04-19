import type { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { apiSuccess, apiError } from "@/lib/server/apiResponse";
import "@/lib/server/firebaseAdmin"; // ensure Admin SDK is initialized

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    try {
      await getAuth().getUserByEmail(email);
      return apiSuccess({ exists: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        return apiSuccess({ exists: false });
      }
      throw err;
    }
  } catch (err) {
    console.error("[check-email]", err);
    return apiError({
      code: "INTERNAL_ERROR",
      message: "Could not check email",
      status: 500,
    });
  }
}
