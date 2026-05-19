import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase/config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// PERF R-001: enable SDK-level IndexedDB persistence so recently-read documents
// are served from the local cache on re-navigation without a network round-trip.
// Uses the Firebase v10+ non-deprecated API (initializeFirestore +
// persistentLocalCache). The typeof window guard is REQUIRED — this module may
// be imported in server/API-route context where IndexedDB does not exist.
// Falls back to a memory-only Firestore instance on the server.
//
// SINGLE-tab manager with forceOwnership: multi-tab persistence
// (persistentMultipleTabManager) coordinates the IndexedDB lock across tabs,
// and that coordination plus a listener detach/re-attach during a concurrent
// server write produces the "FIRESTORE INTERNAL ASSERTION FAILED ID: ca9"
// crash. Single-tab eliminates that surface: at most one tab owns the cache.
// forceOwnership means a newly-opened second tab steals the lock and the
// previous tab silently falls back to memory cache — no assertion, no crash.
// Trade-off: same-user multi-tab no longer shares cached reads (minor; the
// 95% one-tab case is unaffected, multi-user/different-account is unaffected).
export const db =
  typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({ forceOwnership: true }),
        }),
      })
    : getFirestore(app);

// PERF: `firebase/storage` was eagerly imported and initialized at module load
// even though no client code consumes it on the dashboard path. Defer it behind
// a lazy getter so the storage SDK chunk is excluded from the initial bundle and
// only fetched on first upload.
let _storage: FirebaseStorage | null = null;

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (_storage) return _storage;
  const { getStorage } = await import("firebase/storage");
  _storage = getStorage(app);
  if (process.env.NODE_ENV === "development") {
    console.log("[DEBUG STORAGE CONFIG]", {
      bucket: _storage.app.options.storageBucket,
    });
  }
  return _storage;
}