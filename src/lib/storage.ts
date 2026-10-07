// ─── Storage adapter ──────────────────────────────────────────────
//
// Single choke point for all persistence in VestaOS. The rest of the app
// must never touch `localStorage` directly — components get data through
// the store (see src/store/context.tsx), and the store delegates here.
//
// Current implementation: localStorage. Swapping to IndexedDB, a remote
// API, etc. should only require changing this module.
//
// SSR-safe: no `window` access at import time; every call guards on
// `typeof window === 'undefined'`.

import type { AppState } from './types'

const STORAGE_KEY = 'vestaos-state'

/** Storage adapter contract. */
export interface StorageAdapter {
  /** Read persisted state, or `null` if nothing is stored / unreadable. */
  loadState(): AppState | null
  /** Persist the full state snapshot. */
  saveState(state: AppState): void
  /** Remove persisted state. */
  clearState(): void
}

/**
 * localStorage-backed adapter. Safe to call during SSR / before hydration:
 * returns `null` from `loadState` and no-ops the writes when `window` is
 * not available.
 */
export const storage: StorageAdapter = {
  loadState(): AppState | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AppState
    } catch {
      // Corrupt or unreadable data — treat as absent.
      return null
    }
  },

  saveState(state: AppState): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Quota exceeded / storage unavailable — fail silently.
    }
  },

  clearState(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore.
    }
  },
}
