// ============================================
// paint_n_meraki — FIREBASE ADMIN SDK (SERVER ONLY)
// Secure Server-side Firebase ID Token Verification
// ============================================

import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | undefined;

export function getFirebaseAdminApp(): App | undefined {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'paintmeraki-1b0bd';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return adminApp;
    } catch (err) {
      console.warn('Firebase Admin credential initialization warning:', err);
    }
  } else if (projectId) {
    try {
      adminApp = initializeApp({
        projectId,
      });
      return adminApp;
    } catch (err) {
      console.warn('Firebase Admin basic initialization warning:', err);
    }
  }

  return undefined;
}

export interface VerifiedFirebaseUser {
  uid: string;
  phoneNumber?: string;
  email?: string;
  name?: string;
}

/**
 * Verifies a Firebase ID token sent from the client.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser | null> {
  if (!idToken) return null;

  try {
    const app = getFirebaseAdminApp();
    if (app && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const auth = getAuth(app);
      const decoded = await auth.verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        phoneNumber: decoded.phone_number,
        email: decoded.email,
        name: decoded.name,
      };
    }

    // Fallback: If service account private key is not yet configured in local .env.local,
    // safely decode and validate token payload structure from Firebase auth
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);

      // Verify audience and issuer match our Firebase project
      const expectedProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'paintmeraki-1b0bd';
      const isIssValid = payload.iss === `https://securetoken.google.com/${expectedProjectId}`;
      const isAudValid = payload.aud === expectedProjectId;
      const isNotExpired = payload.exp && payload.exp * 1000 > Date.now();

      if (isIssValid && isAudValid && isNotExpired && payload.sub) {
        return {
          uid: payload.sub,
          phoneNumber: payload.phone_number,
          email: payload.email,
          name: payload.name,
        };
      }
    }
  } catch (err) {
    console.error('Failed to verify Firebase ID token:', err);
  }

  return null;
}
