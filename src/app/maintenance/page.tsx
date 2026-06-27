'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { Wrench, Plus, MagnifyingGlass, Clock, CheckCircle, Warning, Fire, Drop, Thermometer, Lightbulb } from '@phosphor-icons/react'
import type { MaintenanceRequest } from '@/src/lib/types'

const priorityMeta: Record<string, { badge: string; label: string }> = {
  urgent: { badge: 'bg-danger/15 text-danger border border-danger/25',     label: 'Urgent' },
  high:   { badge: 'bg-warning/10 text-warning border border-warning/20',  label: 'High'   },
  medium: { badge: 'bg-warning/10 text-warning border border-warning/20',  label: 'Medium' },
  low:    { badge: 'bg-muted/60 text-muted-foreground border border-border', label: 'Low'  },
}

const statusMeta: Record<string, { badge: string; dot: string }> = {
  'open':        { badge: 'bg-primary/10 text-primary border border-primary/20',   dot: 'bg-primary' },
  'in-progress': { badge: 'bg-warning/10 text-warning border border-warning/20',   dot: 'bg-warning' },
  'resolved':    { badge: 'bg-success/10 text-success border border-success/20',   dot: 'bg-success' },
}

const categoryIcons: Record<string, React.ElementType> = {
  HVAC:     Thermometer,
  Plumbing: Drop,
  Electric: Lightbulb,
  Safety:   Warning,
  General:  Wrench,
}

export default function MaintenancePage() {
  const { state } = useApp()
  const { maintenanceRequests } = state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const open = maintenanceRequests.filter(r => r.status === 'open')
  const inProgress = maintenanceRequests.filter(r => r.status === 'in-progress')
  const resolved = maintenanceRequests.filter(r => r.status === 'resolved')

  const filtered = maintenanceRequests.filter(r => {
    if (filter !== 'All' && r.status !== filter.toLowerCase().replace(' ', '-')) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.title.toLowerCase().includes(q) && !r.unit.toLowerCase().includes(q) && !r.tenant.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Maintenance</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {maintenanceRequests.length} total · {open.length} open · {inProgress.length} in progress
            </p>
          </div>
        </div>

        {/* Status buckets */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Open',        count: open.length,        color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/10'  },
            { label: 'In Progress', count: inProgress.length,  color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/10'  },
            { label: 'Resolved',    count: resolved.length,    color: 'text-success', bg: 'bg-success/10', border: 'border-success/10'  },
          ].map((b) => (
            <div key={b.label} className={`rounded-2xl border ${b.border} bg-card/40 p-5`}>
              <div className={`mb-2 inline-flex rounded-lg p-1.5 ${b.bg}`}>
                <Wrench weight="duotone" className={`h-4 w-4 ${b.color}`} />
              </div>
              <p className={`text-2xl font-semibold ${b.color}`}>{b.count}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          {['All', 'Open', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Request list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-16">
              <Wrench className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No requests found</p>
            </div>
          ) : (
            filtered.map((req) => {
              const pMeta = priorityMeta[req.priority]
              const sMeta = statusMeta[req.status]
              const ReqIcon = categoryIcons[req.category] ?? Wrench
              return (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/40 px-5 py-4 transition-colors hover:bg-muted/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <ReqIcon weight="duotone" className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium text-foreground/90">{req.title}</p>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${pMeta.badge}`}>
                        {pMeta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {req.unit} · {req.tenant} · {req.category}
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[11px] text-muted-foreground/70">Submitted {req.submitted}</p>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium ${sMeta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sMeta.dot}`} />
                    {req.status === 'in-progress' ? 'In Progress' : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </AppShell>
  )
}
