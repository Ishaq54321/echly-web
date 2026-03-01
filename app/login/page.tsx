"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/firestore";

export default function Login() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        type="button"
        onClick={handleLogin}
        className="px-6 py-3 bg-black text-white rounded-lg cursor-pointer transition-colors duration-150 hover:opacity-90 active:scale-[0.98]"
      >
        Sign in with Google
      </button>
    </main>
  );
}