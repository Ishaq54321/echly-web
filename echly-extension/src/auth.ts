/**
 * Auth helpers for Chrome extension.
 * - Google Sign-In via chrome.identity.launchWebAuthFlow (response_type=id_token) + GoogleAuthProvider.credential(idToken).
 * - Auth state persisted by Firebase (IndexedDB in extension context).
 * - For API tokens use auth.currentUser.getIdToken() after login.
 */
import {
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
} from "firebase/auth/web-extension";
import { auth } from "./firebase";

/**
 * Sign in with Google using chrome.identity.launchWebAuthFlow (OAuth2 implicit flow, response_type=id_token).
 * Requires manifest "identity" permission. Uses Web client ID for id_token.
 */
export async function signInWithGoogle(): Promise<User> {
  const redirectUri = chrome.identity.getRedirectURL();
  const clientId = "609478020649-0k5ec22m3lvgmcs2icsc6pmabndu85td.apps.googleusercontent.com";

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${clientId}` +
    `&response_type=id_token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid%20email%20profile` +
    `&nonce=${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      async (responseUrl?: string) => {
        if (chrome.runtime.lastError || !responseUrl) {
          reject(chrome.runtime.lastError);
          return;
        }

        const url = new URL(responseUrl);
        const idToken = url.hash
          .substring(1)
          .split("&")
          .find((param) => param.startsWith("id_token="))
          ?.split("=")[1];

        if (!idToken) {
          reject(new Error("No ID token found"));
          return;
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        resolve(result.user);
      }
    );
  });
}

/**
 * Sign out from Firebase. Persisted state is cleared by Firebase Auth.
 */
export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes (e.g. to update UI).
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth };
