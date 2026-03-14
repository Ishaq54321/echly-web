import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase/config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/** Expose auth for extension page token bridge (no change to auth logic). */
if (typeof window !== "undefined") {
  (window as unknown as { firebase?: { auth: () => ReturnType<typeof getAuth> } }).firebase = {
    auth: () => auth,
  };
}
export const db = getFirestore(app);
export const storage = getStorage(app);