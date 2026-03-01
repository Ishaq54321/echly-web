/**
 * Firebase initialization for Chrome extension.
 * Uses same config as web app. Modular Firebase v9+ syntax.
 * Import from firebase/auth/web-extension for extension compatibility.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: "AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",
  authDomain: "echly-b74cc.firebaseapp.com",
  projectId: "echly-b74cc",
  storageBucket: "echly-b74cc.firebasestorage.app",
  messagingSenderId: "609478020649",
  appId: "1:609478020649:web:54cd1ab0dc2b8277131638",
  measurementId: "G-Q0C7DP8QVR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
