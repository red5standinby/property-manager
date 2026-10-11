'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import type { AppState, AppAction, Role } from '@/src/lib/types'
import { seedData } from '@/src/lib/seed'
import { appReducer, buildSeedState } from './reducer'
import { storage } from '@/src/lib/storage'
import { backend } from '@/src/lib/supabase/env'
import { remoteStorage } from '@/src/lib/storage-remote'

type AppDispatch = (action: AppAction) => void

const AppContext = createContext<{
  state: AppState
  dispatch: AppDispatch
  hydrated: boolean
  role: Role
} | null>(null)

/** A stable, deterministic empty state. Used for SSR and the first client
 *  render so server HTML and hydration markup always match. Data is loaded
 *  from the storage adapter (and derived) in an effect after mount. */
const EMPTY_STATE: AppState = {
  ...seedData,
  leases: [],
  payments: [],
  maintenanceRequests: [],
  role: 'admin',
}

/** Normalize loaded state: guarantee a role and non-null arrays. Entities
 *  are now first-class — no deriving on load. */
function normalizeState(state: AppState): AppState {
  return {
    ...state,
    role: state.role ?? 'admin',
    leases: state.leases ?? [],
    payments: state.payments ?? [],
    maintenanceRequests: state.maintenanceRequests ?? [],
  }
}

function loadState(): AppState {
  const persisted = storage.loadState()
  if (persisted) return normalizeState(persisted)
  // First run: seed a real starter portfolio with explicit records.
  return buildSeedState()
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Start from the deterministic empty state; hydrate on mount.
  const [state, dispatch] = useReducer(appReducer, undefined, () => EMPTY_STATE)
  const hydratedRef = useRef(false)

  // Hydrate from the storage adapter after mount (client-only) to avoid
  // server/client markup mismatches (React hydration error #418).
  //
  // remote backend: the adapter is async (fetch), so hydrate then RESET. On
  //   failure (unauthenticated) fall back to the empty state — middleware
  //   will have redirected to /login.
  // local backend: synchronous localStorage read, same as the beta.
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    if (backend === 'remote') {
      remoteStorage.hydrate().then((remote) => {
        dispatch({ type: 'RESET', payload: remote ? normalizeState(remote) : EMPTY_STATE })
      })
      return
    }
    dispatch({ type: 'RESET', payload: loadState() })
  }, [])

  // Persist on every state change (after hydration), debounced via rAF.
  useEffect(() => {
    if (!hydratedRef.current) return
    const timer = requestAnimationFrame(() => {
      storage.saveState(state)
    })
    return () => cancelAnimationFrame(timer)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated: hydratedRef.current, role: state.role }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): { state: AppState; dispatch: AppDispatch; hydrated: boolean; role: Role } {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
