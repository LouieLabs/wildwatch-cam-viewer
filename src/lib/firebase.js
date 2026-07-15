// Firebase (Google sign-in), modular SDK.
// Anonymous visitors see the public gallery. Signing in with a @louielabs.com
// account unlocks private photos + admin — the SERVER checks every request's
// token, so this is a door, not the lock. This web config is public by design.
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth'

const app = initializeApp({
  apiKey: 'AIzaSyBkEV0TVk9282qwW2hnG7lzg3g4adMyskA', // public web config (not a secret)
  authDomain: 'louielabs-animal-cams.firebaseapp.com',
  projectId: 'louielabs-animal-cams',
})

export const auth = getAuth(app)

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ hd: 'louielabs.com' }) // hint: Louie Labs accounts only

export function signIn() {
  return signInWithPopup(auth, provider)
}

export function signOut() {
  return fbSignOut(auth)
}
