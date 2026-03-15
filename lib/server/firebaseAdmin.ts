import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App | null = null;

function getApp(): App {
  if (app) return app;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    );
  }
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    app = getApps()[0] as App;
  }
  return app;
}

export function getAdminAuth() {
  return getAuth(getApp());
}
