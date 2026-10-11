'use client'

import { useEffect, useState } from 'react'
import { Lock, ShieldCheck, QrCode, SignOut } from '@phosphor-icons/react'
import { getBrowserSupabase } from '@/src/lib/supabase/client'

// Security settings: password + TOTP 2FA (Supabase MFA) + sign-out.
// Degrades gracefully when Supabase is not configured (local/demo beta).

interface TotpEnrollment {
  factorId: string
  qrSvg: string
  secret: string
}

export function SecuritySection() {
  const supabase = getBrowserSupabase()

  const [factors, setFactors] = useState<{ id: string; friendlyName?: string }[]>([])
  const [enrolling, setEnrolling] = useState<TotpEnrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function refreshFactors() {
    if (!supabase) return
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors(data?.totp ?? [])
  }

  useEffect(() => {
    refreshFactors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startEnroll() {
    if (!supabase) return
    setBusy(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      setEnrolling({
        factorId: data.id,
        qrSvg: data.totp.qr_code,
        secret: data.totp.secret,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start 2FA setup')
    } finally {
      setBusy(false)
    }
  }

  async function verifyEnroll() {
    if (!supabase || !enrolling) return
    setBusy(true)
    setError('')
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
        factorId: enrolling.factorId,
      })
      if (cErr) throw cErr
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrolling.factorId,
        challengeId: challenge.id,
        code,
      })
      if (vErr) throw vErr
      setNotice('Two-factor authentication enabled.')
      setEnrolling(null)
      setCode('')
      await refreshFactors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setBusy(false)
    }
  }

  async function disableFactor(factorId: string) {
    if (!supabase) return
    setBusy(true)
    try {
      await supabase.auth.mfa.unenroll({ factorId })
      await refreshFactors()
      setNotice('Two-factor authentication disabled.')
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/property-manager/login.html'
  }

  const card = 'rounded-2xl border border-border bg-card/40 overflow-hidden'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground/90">Security</h2>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Protect your account with two-factor authentication.
        </p>
      </div>

      {!supabase && (
        <div className="rounded-2xl border border-yellow/30 bg-yellow/10 px-5 py-4 text-xs text-yellow">
          Backend not configured — security settings are unavailable in this
          build. Sign in to a Supabase-backed deployment to enable 2FA.
        </div>
      )}

      {/* Two-factor */}
      <div className={card}>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <ShieldCheck weight="duotone" className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground/90">Two-factor authentication</p>
            <p className="text-[11px] text-muted-foreground/70">
              Authenticator app (TOTP). Required at sign-in once enabled.
            </p>
          </div>
          {factors.length > 0 && (
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
              Enabled
            </span>
          )}
        </div>

        <div className="px-5 py-4">
          {enrolling ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground/80">
                Scan this QR code with your authenticator app, then enter the 6-digit code.
              </p>
              <div className="flex flex-wrap items-start gap-5">
                <div
                  className="h-40 w-40 shrink-0 rounded-lg bg-white p-2"
                  // Supabase returns an SVG string for the QR.
                  dangerouslySetInnerHTML={{ __html: enrolling.qrSvg }}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[11px] text-muted-foreground/70">
                    Can&apos;t scan? Enter this key manually:
                  </p>
                  <code className="block break-all rounded-lg border border-border bg-muted/40 px-3 py-2 text-[11px] text-foreground/90">
                    {enrolling.secret}
                  </code>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="h-10 w-40 rounded-lg border border-border bg-card/60 px-3 text-center text-sm tracking-[0.3em] text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={verifyEnroll}
                      disabled={busy || code.length !== 6}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {busy ? 'Verifying…' : 'Verify & enable'}
                    </button>
                    <button
                      onClick={() => { setEnrolling(null); setCode(''); setError('') }}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <QrCode weight="duotone" className="mt-0.5 h-4 w-4 text-muted-foreground/70" />
                <p className="text-xs text-muted-foreground/80">
                  {factors.length > 0
                    ? `${factors.length} authenticator${factors.length > 1 ? 's' : ''} configured.`
                    : 'No authenticator configured yet.'}
                </p>
              </div>
              {factors.length > 0 ? (
                <button
                  onClick={() => disableFactor(factors[0].id)}
                  disabled={busy}
                  className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={startEnroll}
                  disabled={busy || !supabase}
                  className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? 'Starting…' : 'Enable 2FA'}
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          {notice && <p className="mt-3 text-xs text-green-400">{notice}</p>}
        </div>
      </div>

      {/* Sign out */}
      <div className={card}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <SignOut weight="duotone" className="h-4 w-4 text-muted-foreground/70" />
            <div>
              <p className="text-xs font-semibold text-foreground/90">Sign out</p>
              <p className="text-[11px] text-muted-foreground/70">End your session on this device.</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="shrink-0 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground/50">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>Passwords are handled by Supabase Auth; VestaOS never stores them.</p>
      </div>
    </div>
  )
}
