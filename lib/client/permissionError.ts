export const PERMISSION_DENIED_TOAST = "You don't have permission to do that.";

export function notifyPermissionDenied(showToast: (message: string) => void): void {
  showToast(PERMISSION_DENIED_TOAST);
}

export function responseIsPermissionDenied(res: Response | null | undefined): boolean {
  return res != null && res.status === 403;
}

/**
 * If `error` carries HTTP status 403, shows the standard permission toast and returns true.
 * Use after rollback so the user sees a consistent message for unauthorized actions.
 */
export function handlePermissionError(
  error: unknown,
  showToast: (message: string) => void
): boolean {
  if (typeof error !== "object" || error === null) return false;
  const status = "status" in error ? (error as { status: unknown }).status : undefined;
  if (typeof status !== "number" || status !== 403) return false;
  notifyPermissionDenied(showToast);
  return true;
}
