// Firebase client init + Google sign-in scoped to @louielabs.com.
//
// Sign-in is restricted in two layers:
//   1. The Google sign-in dialog is hinted to the louielabs.com hosted domain
//      (the `hd` parameter below).
//   2. The backend `/api/captures` (Stage 2) verifies the ID token belongs to
//      a user with a role claim — so even if someone bypasses the popup hint,
//      they won't get data without an admin-granted role.
//
// Email/password sign-in can be added later by enabling the provider in the
// Firebase console and switching the gate from "email domain check" to
// "role claim check" on the backend.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: "louielabs.com" });

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);
export const onUserChange = (cb) => onAuthStateChanged(auth, cb);
