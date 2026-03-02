/**
 * Firebase initialization for Chrome extension.
 * Uses same config as web app. Modular Firebase v9+ syntax.
 * Import from firebase/auth/web-extension for extension compatibility.
 * Exports auth, db, storage so shared lib/feedback and lib/screenshot work when aliased here.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "../../lib/firebase/config";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
