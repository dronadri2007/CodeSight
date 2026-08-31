/**
 * Admin corpus API — GET /admin/stats, full CRUD over /admin/exercises, and the
 * review-status endpoint.
 *
 * Auth here is the backend's shared-password + HMAC bearer token (see
 * backend/app/adminauth.py) — NOT the Firebase ID token that api/client.ts
 * attaches. So these calls carry their own fetch wrapper and take the admin
 * token explicitly; the caller pulls it from useAdminStore.
 *
 * The whole surface is 503 when ADMIN_PASSWORD is unset on the server, and 401
 * once a token expires — callers should treat 401 as "log in again".
 */
import { ApiError } from './client'
import type {
  AdminExerciseCreate,
  AdminExerciseFull,
  AdminExercisePatch,
  AdminExercises,
  AdminReviewStatus,
  AdminStats,
  AdminToken,
  AdminWriteResult,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/** True when there's no backend to talk to — the admin area can't work offline. */
export const ADMIN_OFFLINE = !BASE_URL

async function adminFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown error')
    throw new ApiError(res.status, body)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function queryString(q: Record<string, string | number | undefined>): string {
  const s = Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'All')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return s ? `?${s}` : ''
}

// --- auth ---------------------------------------------------------
export function adminLogin(password: string): Promise<AdminToken> {
  return adminFetch<AdminToken>('/admin/login', null, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

// --- reads ------------------------------------------------------
export function adminStats(token: string): Promise<AdminStats> {
  return adminFetch<AdminStats>('/admin/stats', token)
}

export interface AdminExerciseQuery {
  search?: string
  difficulty?: string
  status?: string
  source?: string
}

export function adminListExercises(
  token: string,
  q: AdminExerciseQuery = {},
): Promise<AdminExercises> {
  return adminFetch<AdminExercises>(`/admin/exercises${queryString({ ...q, limit: 2000 })}`, token)
}

export function adminGetExercise(token: string, id: string): Promise<AdminExerciseFull> {
  return adminFetch<AdminExerciseFull>(`/admin/exercises/${encodeURIComponent(id)}`, token)
}

// --- writes -----------------------------------------------------
export function adminCreateExercise(
  token: string,
  body: AdminExerciseCreate,
): Promise<AdminWriteResult> {
  return adminFetch<AdminWriteResult>('/admin/exercises', token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function adminUpdateExercise(
  token: string,
  id: string,
  body: AdminExercisePatch,
): Promise<AdminWriteResult> {
  return adminFetch<AdminWriteResult>(`/admin/exercises/${encodeURIComponent(id)}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function adminDeleteExercise(token: string, id: string): Promise<AdminWriteResult> {
  return adminFetch<AdminWriteResult>(`/admin/exercises/${encodeURIComponent(id)}`, token, {
    method: 'DELETE',
  })
}

export function adminSetReview(
  token: string,
  id: string,
  status: AdminReviewStatus,
  note = '',
): Promise<AdminWriteResult> {
  return adminFetch<AdminWriteResult>(`/admin/exercises/${encodeURIComponent(id)}/review`, token, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  })
}
