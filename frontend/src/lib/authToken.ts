/**
 * Current user's Firebase ID token, for attaching to backend requests.
 *
 * The Firebase SDK caches the token and refreshes it automatically; getIdToken()
 * returns a valid one (refreshing if it's within ~5 min of expiry).
 */
import { firebaseReady, requireAuth } from './firebase'

export async function getIdToken(): Promise<string | null> {
  if (!firebaseReady) return null
  const user = requireAuth().currentUser
  if (!user) return null
  try {
    return await user.getIdToken()
  } catch {
    return null
  }
}
