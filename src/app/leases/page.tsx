import { AppShell } from '@/src/components/layout/app-shell'
import { Plus, MagnifyingGlass, FileText, Warning, CheckCircle, Clock } from '@phosphor-icons/react/dist/ssr'

const leases = [
  { id: 1, tenant: 'Marcus Webb',      unit: 'Elm Court 4B',     start: 'Sep 1, 2024',  end: 'Aug 31, 2026',  rent: '$2,400/mo', status: 'active',   daysLeft: 137 },
  { id: 2, tenant: 'Priya Nair',       unit: 'Maple Ridge 2A',   start: 'Apr 16, 2026', end: 'Dec 31, 2026',  rent: '$1,850/mo', status: 'active',   daysLeft: 259 },
  { id: 3, tenant: 'James Okonkwo',    unit: 'Oak View 7C',      start: 'May 1, 2022',  end: 'May 31, 2026',  rent: '$2,100/mo', status: 'expiring', daysLeft: 45  },
  { id: 4, tenant: 'Sofia Reyes',      unit: 'Birch Lane 12',    start: 'Sep 1, 2023',  end: 'Sep 30, 2026',  rent: '$1,650/mo', status: 'active',   daysLeft: 167 },
  { id: 5, tenant: 'Devon Harrington', unit: 'Cedar Blvd 3A',    start: 'Jul 1, 2025',  end: 'Jul 31, 2026',  rent: '$2,200/mo', status: 'expiring', daysLeft: 106 },
  { id: 6, tenant: 'Aiko Tanaka',      unit: 'Elm Court 11D',    start: 'Jun 1, 2023',  end: 'Jun 30, 2026',  rent: '$2,300/mo', status: 'expiring', daysLeft: 75  },
  { id: 7, tenant: 'Brian Calloway',   unit: 'Maple Ridge 5B',   start: 'Feb 1, 2025',  end: 'Jan 31, 2027',  rent: '$1,900/mo', status: 'review',   daysLeft: 290 },
  { id: 8, tenant: 'Nina Vasquez',     unit: 'Oak View 2F',      start: 'Nov 1, 2024',  end: 'Nov 30, 2026',  rent: '$2,050/mo', status: 'active',   daysLeft: 228 },
]

const statusMeta: Record<string, { label: string; badge: string; icon: React.ElementType }> = {
  active:   { label: 'Active',   badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle },
  expiring: { label: 'Expiring', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',      icon: Warning     },
  review:   { label: 'Review',   badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',         icon: Clock       },
}

const summaryCards = [
  { label: 'Active Leases',       value: '5', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Expiring (90 days)',  value: '3', color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  { label: 'Up for Renewal',      value: '3', color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { label: 'Avg. Lease Length',   value: '14 mo', color: 'text-zinc-200', bg: 'bg-zinc-800/60'   },
]

import React from 'react'

export default function LeasesPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Leases</h1>
            <p className="mt-1 text-xs text-zinc-500">{leases.length} total lease agreements</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-500">
            <Plus weight="bold" className="h-3.5 w-3.5" />
            New Lease
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryCards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <div className={`mb-2 inline-flex rounded-lg p-1.5 ${c.bg}`}>
                <FileText weight="duotone" className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search leases..."
              className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 pl-8 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          {['All', 'Active', 'Expiring', 'Review'].map((f) => (
            <button
              key={f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${f === 'All' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leases list */}
        <div className="space-y-2">
          {leases.map((lease) => {
            const meta = statusMeta[lease.status]
            const StatusIcon = meta.icon
            const urgency = lease.daysLeft <= 60 ? 'border-amber-500/20' : 'border-zinc-800/60'
            return (
              <div
                key={lease.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border ${urgency} bg-zinc-900/40 px-5 py-4 transition-colors hover:bg-zinc-800/30 cursor-pointer`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                    <FileText weight="duotone" className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200">{lease.tenant}</p>
                    <p className="text-[11px] text-zinc-500">{lease.unit}</p>
                  </div>
                </div>

                <div className="hidden flex-col sm:flex">
                  <p className="text-[11px] text-zinc-400">{lease.start} → {lease.end}</p>
                  <p className="text-[11px] font-semibold text-zinc-300">{lease.rent}</p>
                </div>

                <div className="flex items-center gap-3">
                  {lease.status === 'expiring' && (
                    <span className="text-[11px] text-amber-400">{lease.daysLeft}d left</span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium ${meta.badge}`}>
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
