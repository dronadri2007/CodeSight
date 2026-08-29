/**
 * Anonymous session id — generated once per browser, reused for every request
 * that ties a learner's attempts together (grade, profile, progress,
 * leaderboard, promotion tests). No auth; the backend treats it as an opaque
 * string.
 */
const KEY = 'codesight_session_id'

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return 'web-' + crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return 'web-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getSessionId(): string {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = makeId()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    // private mode / storage blocked — stable within the page load only
    return (getSessionId as unknown as { _fallback?: string })._fallback ||
      ((getSessionId as unknown as { _fallback?: string })._fallback = makeId())
  }
}

/** Wipe the session (e.g. a "start over" / sign-out action). */
export function resetSessionId(): string {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return getSessionId()
}
