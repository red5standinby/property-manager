'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { StatusBadge } from '@/src/components/status-badge'
import {
  delinquencies, leasesWithMeta, formatDate,
  LEASE_EXPIRING_DAYS, isOpenRequest,
} from '@/src/lib/derived'
import type { LeaseView } from '@/src/lib/derived'
import type { ReqPriority } from '@/src/lib/types'
import {
  Warning, FileText, Wrench, ArrowRight, CheckCircle, CurrencyDollar,
  Clock, CaretRight, Prohibit, BellRinging, ArrowCounterClockwise,
} from '@phosphor-icons/react'

const PRIORITY_LABEL: Record<ReqPriority, string> = {
  urgent: 'Urgent', high: 'High', medium: 'Med', low: 'Low',
}

function SectionCard({
  title, icon: Icon, count, href, accent, children, empty, emptyIcon: EmptyIcon = CheckCircle,
}: {
  title: string
  icon: React.ElementType
  count: number
  href: string
  accent: string
  children: React.ReactNode
  empty: string
  emptyIcon?: React.ElementType
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-1.5 ${accent}`}><Icon weight="duotone" className="h-3.5 w-3.5" /></div>
          <h2 className="text-sm font-medium text-foreground/90">{title}</h2>
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground/70">{count}</span>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {count === 0 ? (
          <div className="flex items-start gap-2.5 px-5 py-8">
            <EmptyIcon weight="duotone" className="mt-px h-4 w-4 shrink-0 text-success" />
            <div>
              <p className="text-xs font-medium text-foreground/80">All clear</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/60">{empty}</p>
            </div>
          </div>
        ) : children}
      </div>
    </section>
  )
}

export default function OpsPage() {
  const { state, dispatch } = useApp()
  const { properties, tenants, maintenanceRequests } = state
  // Track locally-acknowledged reminders so the action gives instant feedback
  // without touching data model / reducer.
  const [reminded, setReminded] = useState<Record<string, boolean>>({})

  const dq = delinquencies(state)
  const leases = leasesWithMeta(state)
  const expiring = leases.filter((l: LeaseView) => l.displayStatus === 'expiring')
  const renewals = leases.filter((l: LeaseView) => l.displayStatus === 'review')
  const openMaint = maintenanceRequests.filter(isOpenRequest).sort((a, b) => {
    const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return rank[a.priority] - rank[b.priority]
  })
  const urgentMaint = openMaint.filter(r => r.priority === 'urgent' || r.priority === 'high').length

  const owedTotal = dq.reduce((s, r) => s + r.owed, 0)

  const summary = [
    { label: 'Delinquent', value: String(dq.length), sub: `$${owedTotal.toLocaleString()} owed`, icon: Warning, color: 'text-danger', bg: 'bg-danger/10', href: '/payments' },
    { label: 'Expiring Leases', value: String(expiring.length), sub: `within ${LEASE_EXPIRING_DAYS} days`, icon: FileText, color: 'text-warning', bg: 'bg-warning/10', href: '/leases' },
    { label: 'Open Maintenance', value: String(openMaint.length), sub: urgentMaint > 0 ? `${urgentMaint} high priority` : 'none urgent', icon: Wrench, color: 'text-primary', bg: 'bg-primary/10', href: '/maintenance' },
    { label: 'Up For Renewal', value: String(renewals.length), sub: 'flagged for review', icon: CurrencyDollar, color: 'text-violet-400', bg: 'bg-violet-500/10', href: '/leases' },
  ]

  function waiveFee(paymentId: string) {
    dispatch({ type: 'UPDATE_PAYMENT', payload: { id: paymentId, lateFeeWaived: true } })
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Ops</h1>
          <p className="mt-1 text-xs text-muted-foreground/70">
            What needs chasing today · {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'}
          </p>
        </div>

        {/* Summary strip — each card links to its section */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {summary.map(s => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-border/80 hover:bg-card/60 sm:p-5"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[11px] font-medium text-muted-foreground/70">{s.label}</p>
                <div className={`rounded-lg p-1.5 ${s.bg}`}><s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.color}`} /></div>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/50">{s.sub}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Delinquencies — most urgent first */}
          <SectionCard
            title="Delinquent"
            icon={Warning}
            count={dq.length}
            href="/payments"
            accent="bg-danger/10 text-danger"
            empty="No late or partial payments right now."
            emptyIcon={CheckCircle}
          >
            {dq.map(r => {
              const canWaive = r.payment.lateFee > 0 && !r.payment.lateFeeWaived
              const isReminded = reminded[r.payment.id]
              return (
                <div key={r.payment.id} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.payment.status === 'overdue' ? 'bg-danger' : 'bg-warning'}`} />
                  <Link href="/payments" className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground/90">{r.tenantName}</p>
                    <p className="truncate text-[10px] text-muted-foreground/70">
                      {r.propertyName} · {r.unit}
                      {r.daysLate > 0 ? ` · ${r.daysLate}d late` : ''}
                    </p>
                  </Link>
                  <StatusBadge status={r.payment.status} />
                  <span className="w-16 shrink-0 text-right text-xs font-semibold text-danger">
                    ${r.owed.toLocaleString()}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReminded(m => ({ ...m, [r.payment.id]: !m[r.payment.id] }))}
                      title={isReminded ? 'Reminder sent' : 'Send payment reminder'}
                      aria-label={isReminded ? `Reminder sent to ${r.tenantName}` : `Send payment reminder to ${r.tenantName}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${isReminded ? 'bg-primary/10 text-primary' : 'text-muted-foreground/70 hover:bg-primary/10 hover:text-primary'}`}
                    >
                      {isReminded ? <CheckCircle weight="fill" className="h-3.5 w-3.5" /> : <BellRinging className="h-3.5 w-3.5" />}
                    </button>
                    {canWaive && (
                      <button
                        type="button"
                        onClick={() => waiveFee(r.payment.id)}
                        title="Waive late fee"
                        aria-label={`Waive late fee for ${r.tenantName}`}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-warning/10 hover:text-warning"
                      >
                        <Prohibit className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </SectionCard>

          {/* Expiring leases */}
          <SectionCard
            title="Expiring Soon"
            icon={FileText}
            count={expiring.length}
            href="/leases"
            accent="bg-warning/10 text-warning"
            empty={`No leases ending within ${LEASE_EXPIRING_DAYS} days.`}
          >
            {expiring.map((l: LeaseView) => (
              <Link
                key={l.id}
                href="/leases"
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${l.daysLeft <= 30 ? 'bg-danger' : 'bg-warning'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground/90">{l.tenantLabel}</p>
                  <p className="truncate text-[10px] text-muted-foreground/70">{l.unit} · ends {formatDate(l.endDate)}</p>
                </div>
                <StatusBadge status="expiring" label={`${l.daysLeft}d left`} tone={l.daysLeft <= 30 ? 'danger' : 'warning'} />
                <CaretRight weight="bold" className="h-3 w-3 shrink-0 text-muted-foreground/40" />
              </Link>
            ))}
          </SectionCard>

          {/* Open maintenance */}
          <SectionCard
            title="Open Maintenance"
            icon={Wrench}
            count={openMaint.length}
            href="/maintenance"
            accent="bg-primary/10 text-primary"
            empty="No open maintenance requests."
          >
            {openMaint.map(r => (
              <Link
                key={r.id}
                href="/maintenance"
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <StatusBadge status={r.priority} micro label={PRIORITY_LABEL[r.priority]} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground/90">{r.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground/70">{r.unit} · since {formatDate(r.submitted)}</p>
                </div>
                {r.status === 'in-progress' && <StatusBadge status="in-progress" dot={false} />}
                <CaretRight weight="bold" className="h-3 w-3 shrink-0 text-muted-foreground/40" />
              </Link>
            ))}
          </SectionCard>

          {/* Renewals flagged */}
          <SectionCard
            title="Renewals Due"
            icon={ArrowCounterClockwise}
            count={renewals.length}
            href="/leases"
            accent="bg-violet-500/10 text-violet-400"
            empty="Nothing flagged for renewal yet."
          >
            {renewals.map((l: LeaseView) => (
              <Link
                key={l.id}
                href="/leases"
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <Clock weight="duotone" className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground/90">{l.tenantLabel}</p>
                  <p className="truncate text-[10px] text-muted-foreground/70">{l.unit} · ends {formatDate(l.endDate)} · ${l.rent.toLocaleString()}/mo</p>
                </div>
                <StatusBadge status="review" label="Review" />
                <CaretRight weight="bold" className="h-3 w-3 shrink-0 text-muted-foreground/40" />
              </Link>
            ))}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
