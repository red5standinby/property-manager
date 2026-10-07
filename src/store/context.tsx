'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import type { AppState, AppAction } from '@/src/lib/types'
import { seedData } from '@/src/lib/seed'
import { appReducer } from './reducer'
import { deriveLeases, derivePayments, deriveMaintenanceRequests } from '@/src/lib/derived'

const STORAGE_KEY = 'vestaos-state'

type AppDispatch = (action: AppAction) => void

const AppContext = createContext<{
  state: AppState
  dispatch: AppDispatch
  hydrated: boolean
} | null>(null)

/** A stable, deterministic empty state. Used for SSR and the first client
 *  render so server HTML and hydration markup always match. Data is loaded
 *  from localStorage (and derived) in an effect after mount. */
const EMPTY_STATE: AppState = {
  ...seedData,
  leases: [],
  payments: [],
  maintenanceRequests: [],
}

function withDerived(state: AppState): AppState {
  return {
    ...state,
    leases: state.leases.length > 0
      ? state.leases
      : deriveLeases(state.properties, state.tenants),
    payments: state.payments.length > 0
      ? state.payments
      : derivePayments(state.tenants),
    maintenanceRequests: state.maintenanceRequests.length > 0
      ? state.maintenanceRequests
      : deriveMaintenanceRequests(state.properties, state.tenants),
  }
}

function loadState(): AppState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return withDerived(JSON.parse(raw) as AppState)
    }
  } catch { /* ignore corrupt data */ }

  return withDerived(seedData)
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Start from the deterministic empty state; hydrate on mount.
  const [state, dispatch] = useReducer(appReducer, undefined, () => EMPTY_STATE)
  const hydratedRef = useRef(false)

  // Hydrate from localStorage after mount (client-only) to avoid
  // server/client markup mismatches (React hydration error #418).
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    dispatch({ type: 'RESET', payload: loadState() })
  }, [])

  // Persist on every state change (after hydration), debounced via rAF.
  useEffect(() => {
    if (!hydratedRef.current) return
    const timer = requestAnimationFrame(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch { /* quota, silent */ }
    })
    return () => cancelAnimationFrame(timer)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated: hydratedRef.current }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): { state: AppState; dispatch: AppDispatch; hydrated: boolean } {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
