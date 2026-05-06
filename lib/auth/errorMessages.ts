const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters with a mix of letters and numbers.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
  "auth/account-exists-with-different-credential": "An account with this email exists using a different sign-in method.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/operation-not-allowed": "Email/password sign-up is not enabled. Contact support.",
  "auth/expired-action-code": "This link has expired. Please request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
  "auth/requires-recent-login": "Please log in again to continue.",
  "auth/internal-error": "Something went wrong on our end. Please try again.",
};

export function mapAuthError(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code;
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return fallback;
}
