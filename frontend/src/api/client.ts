/**
 * Thin fetch wrapper for the CodeSight API.
 *
 * Base URL comes from VITE_API_BASE_URL. When it is unset, USE_MOCK is true and
 * the domain modules fall back to local fixtures / stubs so the app still runs
 * offline. Point it at the deployed backend to go live:
 *   VITE_API_BASE_URL=https://codesight-code-review-production.up.railway.app
 */
import { getIdToken } from '../lib/authToken'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const USE_MOCK = !BASE_URL

export class ApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`API ${status}: ${body}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

function withQuery(path: string, query?: Query): string {
  if (!query) return path
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return qs ? `${path}?${qs}` : path
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getIdToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown error')
    throw new ApiError(res.status, body)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>(withQuery(path, query)),
  post: <T>(path: string, body?: unknown, query?: Query) =>
    request<T>(withQuery(path, query), {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}

/** Throwing stub for USE_MOCK paths a module chooses not to fake. */
export function mockUnavailable(fn: string): never {
  throw new Error(`${fn}: set VITE_API_BASE_URL to reach the live backend`)
}

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
