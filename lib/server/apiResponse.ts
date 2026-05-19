import "server-only";

import { NextResponse } from "next/server";
import type { AccessContext } from "@/lib/access/resolveAccess";
import { accessContextToResponseBody } from "@/lib/access/resolveAccess";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "GONE" // HTTP 410 for deleted/permanently-unavailable resources
  | "NOT_FOUND"
  | "GROUP_NOT_FOUND"
  | "INVALID_INPUT"
  | "INTERNAL_ERROR"
  // Admin set_plan hybrid (Phase C3) — distinct codes so callers/tests can
  // tell the rejection reasons apart.
  | "ENTERPRISE_REQUIRES_MANUAL_OVERRIDE"
  | "CANNOT_DOWNGRADE_PAID_TO_STARTER"
  | "NEVER_PAID_REQUIRES_MANUAL_OVERRIDE"
  | "PROVIDER_UPDATE_FAILED"
  // Password reset gate — account signs in via Google/SSO, not email+password.
  | "GOOGLE_AUTH_NO_PASSWORD";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T | null;
  access?: Record<string, unknown> | null;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
};

export function apiSuccess<T>(
  data: T,
  access?: AccessContext | null,
  init?: ResponseInit
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      access: access ? accessContextToResponseBody(access) : null,
    },
    init
  );
}

export type ApiErrorParams = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  /** Use for error payloads (e.g. plan limit `{ upgradePlan }`). Defaults to `null`. */
  data?: unknown | null;
  init?: ResponseInit;
};

export function apiError(params: ApiErrorParams): NextResponse<ApiResponse<unknown>> {
  const { code, message, status = 400, data = null, init } = params;
  return NextResponse.json(
    {
      success: false,
      data,
      error: { code, message },
      access: null,
    },
    {
      ...init,
      status,
    }
  );
}
