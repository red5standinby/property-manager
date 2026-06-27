'use client'

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction } from '@/src/lib/types'
import { seedData } from '@/src/lib/seed'
import { appReducer } from './reducer'
import { deriveLeases, derivePayments, deriveMaintenanceRequests } from '@/src/lib/derived'

const STORAGE_KEY = 'vestaos-state'

type AppDispatch = (action: AppAction) => void

const AppContext = createContext<{
  state: AppState
  dispatch: AppDispatch
} | null>(null)

function loadState(): AppState {
  if (typeof window === 'undefined') return seedData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      // If no derived arrays exist (pre-persistence upgrade), seed them
      return {
        ...parsed,
        leases: parsed.leases.length > 0
          ? parsed.leases
          : deriveLeases(parsed.properties, parsed.tenants),
        payments: parsed.payments.length > 0
          ? parsed.payments
          : derivePayments(parsed.tenants),
        maintenanceRequests: parsed.maintenanceRequests.length > 0
          ? parsed.maintenanceRequests
          : deriveMaintenanceRequests(parsed.properties, parsed.tenants),
      }
    }
  } catch { /* ignore corrupt data */ }

  // First load: seed derived arrays
  return {
    ...seedData,
    leases: deriveLeases(seedData.properties, seedData.tenants),
    payments: derivePayments(seedData.tenants),
    maintenanceRequests: deriveMaintenanceRequests(seedData.properties, seedData.tenants),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)

  // Persist on every state change (debounced via rAF)
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch { /* quota, silent */ }
    })
    return () => cancelAnimationFrame(timer)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): { state: AppState; dispatch: AppDispatch } {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
