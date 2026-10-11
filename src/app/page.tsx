'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/src/store/context'
import { demoData } from '@/src/lib/seed'

// Public beta entry point. The app is a static export on GitHub Pages, so
// landing directly on /dashboard would show a clean-slate (empty) app — bad
// first impression for a public beta. Instead the root loads the sample
// portfolio into the store, then forwards to the Ops view.
//
// Deep links (e.g. /properties.html) still work; this only governs the root.

export default function Page() {
  const { dispatch, hydrated } = useApp()
  const [loaded, setLoaded] = useState(false)

  function loadDemo() {
    dispatch({ type: 'RESET', payload: demoData })
    setLoaded(true)
  }

  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => {
        window.location.href = '/property-manager/ops.html'
      }, 400)
      return () => clearTimeout(t)
    }
  }, [loaded])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-1 flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-brand-glow-sm">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Vesta<span className="ml-px text-primary">OS</span>
            <span className="ml-2 rounded-full border border-primary/30 px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-widest text-primary">
              Beta
            </span>
          </span>
        </div>
        <h1 className="mt-4 text-lg font-semibold">Load demo portfolio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a public beta of VestaOS — a property management tool for
          small self-managing landlords. Loads 3 properties, 5 tenants, and a
          set of real payments and maintenance tickets — including a partial
          payment, a waived late fee, a lease expiring in 21 days, and open
          maintenance. Edits stay in this browser only.
        </p>
        <button
          onClick={loadDemo}
          disabled={!hydrated || loaded}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loaded ? 'Loaded — opening Ops view…' : 'Load demo data'}
        </button>
        <Link
          href="/ops"
          prefetch={false}
          className="mt-4 block text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Skip — go to Ops view
        </Link>
      </div>
    </main>
  )
}
