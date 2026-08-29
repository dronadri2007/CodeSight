/**
 * Firebase client singletons.
 *
 * Config comes from VITE_FIREBASE_* env vars (see .env.example). These values
 * are NOT secret — they ship in the client bundle by design. The secret half
 * (the service-account key) lives only on the backend.
 *
 * When the config is absent, `firebaseReady` is false and the app renders a
 * "not configured" screen instead of crashing.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId)

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined

if (firebaseReady) {
  app = initializeApp(config)
  authInstance = getAuth(app)
  dbInstance = getFirestore(app)
}

/** Throws if Firebase isn't configured — callers gate on `firebaseReady` first. */
export function requireAuth(): Auth {
  if (!authInstance) throw new Error('Firebase is not configured (VITE_FIREBASE_* env vars missing).')
  return authInstance
}

export function requireDb(): Firestore {
  if (!dbInstance) throw new Error('Firebase is not configured (VITE_FIREBASE_* env vars missing).')
  return dbInstance
}

export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

export { app }
