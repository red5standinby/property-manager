'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserSupabase } from '@/src/lib/supabase/client'

// Sign-in page. Email/password via Supabase Auth. When Supabase is not
// configured (local/demo beta) we show a notice and offer the demo instead
// of a broken form.

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/ops'
  const supabase = getBrowserSupabase()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // If TOTP is enrolled, Supabase returns aal1 — Settings/verify handles it.
        router.replace(next)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setNotice('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const input =
    'h-10 w-full rounded-lg border border-border bg-card/60 px-3 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-brand-glow-sm">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Vesta<span className="ml-px text-primary">OS</span>
          </span>
        </div>

        <h1 className="text-lg font-semibold">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {mode === 'signin'
            ? 'Welcome back. Sign in to your portfolio.'
            : 'Set up an account to manage your properties.'}
        </p>

        {!supabase && (
          <div className="mt-5 rounded-lg border border-yellow/30 bg-yellow/10 px-3 py-2 text-xs text-yellow">
            Backend not configured. This build runs on local storage —{' '}
            <a href="/property-manager/" className="underline">use the demo</a>.
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            autoComplete="email"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {notice && <p className="text-xs text-green-400">{notice}</p>}

          <button
            type="submit"
            disabled={busy || !supabase}
            className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
