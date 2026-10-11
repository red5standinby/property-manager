'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/src/store/context'
import { demoData } from '@/src/lib/seed'

// Demo loader. Writes the sample portfolio into the store via the reducer,
// then sends you to the Ops view. Useful for demos and local testing without
// hand-entering data.

export default function DemoPage() {
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
        <h1 className="text-lg font-semibold">Load demo portfolio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loads 3 properties, 5 tenants, and a set of real payments and
          maintenance tickets — including a partial payment, a waived late fee,
          a lease expiring in 21 days, and open maintenance. Overwrites any data
          currently in this browser.
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
