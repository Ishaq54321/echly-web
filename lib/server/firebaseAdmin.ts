import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getFirebaseAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!isProduction && serviceAccountJson) {
    try {
      const credential = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      adminApp = admin.initializeApp({ credential: admin.credential.cert(credential) });
    } catch (e) {
      console.error("Firebase Admin: invalid FIREBASE_SERVICE_ACCOUNT_JSON", e);
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON");
    }
  } else if (!isProduction && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  return adminApp;
}

export const adminAuth = getFirebaseAdminApp().auth();
export const adminDb = getFirebaseAdminApp().firestore();
