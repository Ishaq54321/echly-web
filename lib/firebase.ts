import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase/config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// PERF R-001: enable SDK-level multi-tab IndexedDB persistence so recently-read
// documents are served from the local cache on re-navigation without a network
// round-trip. Uses the Firebase v10+ non-deprecated API (initializeFirestore +
// persistentLocalCache). The typeof window guard is REQUIRED — this module may
// be imported in server/API-route context where IndexedDB does not exist.
// Falls back to a memory-only Firestore instance on the server.
export const db =
  typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      })
    : getFirestore(app);

export const storage = getStorage(app);

if (process.env.NODE_ENV === "development") {
  console.log("[DEBUG STORAGE CONFIG]", {
    bucket: storage.app.options.storageBucket,
  });
}