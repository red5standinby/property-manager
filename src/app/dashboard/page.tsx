'use client'

import Link from 'next/link'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { StatusBadge } from '@/src/components/status-badge'
import {
  collectedIncome, expectedMonthlyRent, delinquencies,
  leasesWithMeta, isOpenRequest, maintenanceSpend,
  formatDate, LEASE_EXPIRING_DAYS, occupancyCounts, leaseStatus,
} from '@/src/lib/derived'
import {
  Buildings, CurrencyDollar, Users, Wrench,
  Warning, FileText, CaretRight, CheckCircle,
} from '@phosphor-icons/react'

export default function DashboardPage() {
  const { state } = useApp()
  const { properties, tenants, leases, payments, maintenanceRequests } = state

  // ── Occupancy is derived: a home is occupied when it has an active lease ──
  const activeLeases = leases.filter(l => leaseStatus(l) !== 'ended')
  const occ = occupancyCounts(properties, leases)

  const collected = collectedIncome(payments)
  const expected = expectedMonthlyRent(state)
  const collectionPct = expected > 0 ? Math.round((collected / expected) * 100) : 0

  const dq = delinquencies(state)
  const owed = dq.reduce((a, r) => a + r.owed, 0)
  const openMaint = maintenanceRequests.filter(isOpenRequest)
  const maintSpend = maintenanceSpend(maintenanceRequests)
  const expiring = leasesWithMeta(state).filter(
    l => l.status === 'expiring' || l.status === 'review',
  )

  // ── Portfolio: per-home occupancy/rent from REAL leases ──
  const portfolio = properties.map(p => {
    const propsLeases = activeLeases.filter(l => l.propertyId === p.id)
    const isOccupied = propsLeases.length > 0
    const rent = propsLeases.reduce((a, l) => a + l.rent, 0)
    return { id: p.id, name: p.name, type: p.type, occupied: isOccupied, rent }
  })

  const stats = [
    {
      label: 'Collected (all time)', value: `$${collected.toLocaleString()}`,
      sub: expected > 0 ? `${collectionPct}% of $${expected.toLocaleString()} expected` : 'no active leases',
      icon: CurrencyDollar, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/10',
    },
    {
      label: 'Delinquent', value: String(dq.length),
      sub: owed > 0 ? `$${owed.toLocaleString()} owed` : 'all caught up',
      icon: Warning, color: 'text-danger', bg: 'bg-danger/10', ring: 'ring-danger/10',
    },
    {
      label: 'Occupied', value: `${occ.occupied}/${occ.total}`,
      sub: occ.total > 0 ? `${occ.pct}% of homes leased` : 'no properties',
      icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/10',
    },
    {
      label: 'Open Maintenance', value: String(openMaint.length),
      sub: maintSpend > 0 ? `$${maintSpend.toLocaleString()} logged` : 'nothing logged',
      icon: Wrench, color: 'text-primary', bg: 'bg-primary/10', ring: 'ring-primary/10',
    },
  ]

  const atend = [
    ...expiring.slice(0, 3).map(l => ({
      href: '/leases', tone: 'warning' as const,
      label: `Lease expiring — ${l.tenantLabel}`,
      sub: `${l.unit} · ends ${formatDate(l.endDate)} (${l.daysLeft}d)`,
    })),
    ...dq.slice(0, 3).map(r => ({
      href: '/payments', tone: 'danger' as const,
      label: `Rent overdue — ${r.tenantName}`,
      sub: `${r.unit} · $${r.owed.toLocaleString()}${r.daysLate > 0 ? ` · ${r.daysLate}d late` : ''}`,
    })),
  ].slice(0, 4)

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Portfolio overview · {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'}
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl bg-card/40 p-4 ring-1 ${s.ring} sm:p-5`}>
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[11px] font-medium text-muted-foreground/70">{s.label}</p>
                <div className={`rounded-lg p-1.5 ${s.bg}`}>
                  <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/50">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          {/* Portfolio — real occupancy + rent roll per property */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card/40 xl:col-span-3">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-medium text-foreground/90">Portfolio</h2>
                <p className="text-[11px] text-muted-foreground/60">Occupancy &amp; rent by property</p>
              </div>
              <Link href="/properties" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80">
                All properties <CaretRight className="h-3 w-3" />
              </Link>
            </div>

            {portfolio.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
                <Buildings weight="duotone" className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground/70">No properties yet.</p>
                <Link href="/properties" className="text-[11px] font-medium text-primary">Add your first property</Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {portfolio.slice(0, 8).map(p => (
                  <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Buildings weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-foreground/90">{p.name}</span>
                        <span className={`shrink-0 text-[11px] font-medium ${p.occupied ? 'text-success' : 'text-muted-foreground'}`}>
                          {p.occupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                        <span>{p.type}</span>
                        <span>·</span>
                        <span>{p.rent > 0 ? `$${p.rent.toLocaleString()}/mo` : 'no active lease'}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-foreground/90">${p.rent.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
              <span className="text-[11px] text-muted-foreground/70">Expected monthly rent roll</span>
              <span className="text-sm font-bold text-success">${expected.toLocaleString()}</span>
            </div>
          </section>

          {/* Attention — real lease + payment entities */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card/40 xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-medium text-foreground/90">Needs Attention</h2>
                <p className="text-[11px] text-muted-foreground/60">Expiring leases &amp; overdue rent</p>
              </div>
              {atend.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger/20 px-1.5 text-[10px] font-bold text-danger">
                  {atend.length}
                </span>
              )}
            </div>

            {atend.length === 0 ? (
              <div className="flex flex-col items-center gap-1 px-5 py-10 text-center">
                <CheckCircle weight="duotone" className="h-6 w-6 text-success/70" />
                <p className="text-xs text-muted-foreground/70">All systems running.</p>
                <p className="text-[10px] text-muted-foreground/50">
                  Nothing expiring within {LEASE_EXPIRING_DAYS} days, no overdue rent.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {atend.map((a, i) => (
                  <Link key={i} href={a.href} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${a.tone === 'danger' ? 'bg-danger/10' : 'bg-warning/10'}`}>
                      {a.tone === 'danger'
                        ? <Warning className="h-3.5 w-3.5 text-danger" />
                        : <FileText className="h-3.5 w-3.5 text-warning" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground/90">{a.label}</p>
                      <p className="truncate text-[10px] text-muted-foreground/70">{a.sub}</p>
                    </div>
                    <StatusBadge status={a.tone === 'danger' ? 'overdue' : 'expiring'} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
