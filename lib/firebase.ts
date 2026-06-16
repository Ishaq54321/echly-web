import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase/config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Firestore local cache: MEMORY-ONLY on the client (memoryLocalCache).
//
// We previously enabled SDK-level IndexedDB persistence (persistentLocalCache,
// PERF R-001) so recently-read documents survived a page reload. That repeatedly
// drove the app into Firestore's "INTERNAL ASSERTION FAILED: Unexpected state"
// crash family — first ID: ca9, then ID: b7de / ID: b815 (CONTEXT {"batchId":N}).
// These asserts live entirely inside the IndexedDB persistence + local
// mutation-queue layer. They are triggered by the rapid snapshot churn and
// listener detach/re-attach our realtime stores produce, and the SINGLE-tab
// forceOwnership manager made it worse: when a second tab steals the lock it
// tears persistence out from under in-flight write batches — a documented path
// into the assert. The bug is unfixed upstream across 12.x
// (firebase/firebase-js-sdk #9267, #8250), so there is no version to upgrade to.
//
// memoryLocalCache removes the subsystem the bug lives in entirely: no IndexedDB,
// no persistent mutation queue, so the "Unexpected state" crash class is
// structurally impossible. Reads are still cached in memory within a session
// (snapshot listeners and repeated gets stay local); the only thing lost is
// cross-reload read persistence — exactly the fragile path. Worthwhile trade for
// a realtime app where listeners re-fetch on mount regardless.
//
// The typeof window guard remains: on the server we use getFirestore(app), which
// is memory-backed anyway and avoids touching browser-only cache plumbing.
export const db =
  typeof window !== "undefined"
    ? initializeFirestore(app, {
        localCache: memoryLocalCache(),
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