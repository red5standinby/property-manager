'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { Plus, MagnifyingGlass, FileText, Warning, CheckCircle, Clock } from '@phosphor-icons/react'

const badgeStyles: Record<string, string> = {
  active:   'bg-success/10 text-success border border-success/20',
  expiring: 'bg-warning/10 text-warning border border-warning/20',
  review:   'bg-primary/10 text-primary border border-primary/20',
}

const statusIcons: Record<string, React.ElementType> = {
  active:   CheckCircle,
  expiring: Warning,
  review:   Clock,
}

const colorMap: Record<string, string> = {
  active:   'text-success',
  expiring: 'text-warning',
  review:   'text-primary',
}

const bgMap: Record<string, string> = {
  active:   'bg-success/10',
  expiring: 'bg-warning/10',
  review:   'bg-primary/10',
}

export default function LeasesPage() {
  const { state } = useApp()
  const { leases } = state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const activeLeases = leases.filter(l => l.status === 'active')
  const expiringLeases = leases.filter(l => l.status === 'expiring')
  const reviewLeases = leases.filter(l => l.status === 'review')
  const expiringSoon = leases.filter(l => l.status === 'expiring' && l.daysLeft <= 90)

  const filtered = leases.filter(l => {
    if (filter !== 'All' && l.status !== filter.toLowerCase()) return false
    if (search && !l.tenant.toLowerCase().includes(search.toLowerCase()) && !l.unit.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Leases</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">{leases.length} total · {expiringSoon.length} expiring within 90 days</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active Leases',  value: String(activeLeases.length),  color: colorMap.active,  bg: bgMap.active  },
            { label: 'Expiring (90d)', value: String(expiringSoon.length),  color: colorMap.expiring, bg: bgMap.expiring },
            { label: 'Up for Renewal', value: String(reviewLeases.length),  color: colorMap.review,  bg: bgMap.review  },
            { label: 'Total Leases',   value: String(leases.length),        color: 'text-foreground/90', bg: 'bg-muted/60' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card/40 p-4">
              <div className={`mb-2 inline-flex rounded-lg p-1.5 ${c.bg}`}>
                <FileText weight="duotone" className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leases..."
              className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          {['All', 'Active', 'Expiring', 'Review'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leases list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-16">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No leases found</p>
            </div>
          ) : (
            filtered.map((lease) => {
              const StatusIcon = statusIcons[lease.status]
              const urgency = lease.daysLeft <= 60 ? 'border-warning/20' : 'border-border'
              return (
                <div
                  key={lease.id}
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border ${urgency} bg-card/40 px-5 py-4 transition-colors hover:bg-muted/20`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <FileText weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground/90">{lease.tenant}</p>
                      <p className="text-[11px] text-muted-foreground/70">{lease.unit}</p>
                    </div>
                  </div>

                  <div className="hidden flex-col sm:flex">
                    <p className="text-[11px] text-muted-foreground">{lease.start} → {lease.end}</p>
                    <p className="text-[11px] font-semibold text-foreground/75">{lease.rent}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {lease.status === 'expiring' && (
                      <span className="text-[11px] text-warning">{lease.daysLeft}d left</span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium ${badgeStyles[lease.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}
