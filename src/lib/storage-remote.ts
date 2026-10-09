// ─── Remote storage adapter (Phase 2) ─────────────────────────────
//
// Drop-in replacement for the localStorage adapter. Same `StorageAdapter`
// interface, but every read/write goes to the backend API instead of the
// browser. Selected by storage.ts when NEXT_PUBLIC_VESTAOS_BACKEND=remote.
//
// Contract (unchanged): loadState / saveState / clearState.
//   - loadState is async in spirit but the interface is sync. To honor the
//     existing sync interface without destabilizing the store, this adapter
//     keeps an in-memory mirror and exposes an async `hydrate()` the store
//     can await on mount. Until hydrate() resolves, loadState returns null
//     (same as the SSR-safe local adapter), so first render stays deterministic.
//
// STAGED 2026-10-09 — not enabled. Requires BACKEND=remote + a live API.

import type { AppState } from './types'

const API_BASE = process.env.NEXT_PUBLIC_VESTAOS_API_BASE ?? '/api'

let mirror: AppState | null = null

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'include', // send the session cookie
  })
  if (!res.ok) throw new Error(`VestaOS API ${path} → ${res.status}`)
  return (await res.json()) as T
}

export const remoteStorage = {
  /** Pull the full snapshot from the backend. Call on mount, then dispatch
   *  RESET with the result — same pattern the local adapter uses. */
  async hydrate(): Promise<AppState | null> {
    try {
      const state = await request<AppState>('/state')
      mirror = state
      return state
    } catch {
      // Unauthenticated or offline — behave like "nothing stored".
      return null
    }
  },

  loadState(): AppState | null {
    // Sync read of the last-hydrated mirror. Null until hydrate() resolves.
    return mirror
  },

  saveState(state: AppState): void {
    mirror = state
    // Fire-and-forget PUT; the store debounces via rAF already.
    void request('/state', { method: 'PUT', body: JSON.stringify(state) })
  },

  clearState(): void {
    mirror = null
    void request('/state', { method: 'DELETE' })
  },
}
