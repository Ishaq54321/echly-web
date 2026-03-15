/**
 * Auth helpers for Chrome extension.
 * No Firebase. Sign-in is done on the dashboard (localhost:3000/login).
 * Use ECHLY_START_LOGIN message to open the login page; ECHLY_GET_AUTH_STATE for state.
 */

export function signInWithGoogle(): Promise<never> {
  return new Promise((_, reject) => {
    chrome.runtime.sendMessage({ type: "ECHLY_START_LOGIN" }, () => {
      reject(new Error("Sign in on the dashboard; then use the extension again."));
    });
  });
}

export function signOut(): Promise<void> {
  return Promise.resolve();
}

export function subscribeToAuthState(_callback: (user: unknown) => void): () => void {
  return () => {};
}
