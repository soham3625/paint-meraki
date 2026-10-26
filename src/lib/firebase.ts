// ============================================
// paint_n_meraki — FIREBASE CLIENT SDK
// Modular initialization for Client-side Auth
// ============================================

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDLubQAqeW2hndC0uaPCnHEWpSAyT0IpYk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "paintmeraki-1b0bd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "paintmeraki-1b0bd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "paintmeraki-1b0bd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "965347857511",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:965347857511:web:e60b48df7e6ad70f8c70c2",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    if (getApps().length > 0) return getApp();
    return initializeApp(firebaseConfig);
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  const currentApp = getFirebaseApp();
  if (!auth) {
    auth = getAuth(currentApp);
  }
  return auth;
}
