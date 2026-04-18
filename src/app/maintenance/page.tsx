import { AppShell } from '@/src/components/layout/app-shell'
import { Wrench, Plus, MagnifyingGlass, Clock, CheckCircle, Warning, Fire, Drop, Thermometer, Lightbulb } from '@phosphor-icons/react/dist/ssr'
import React from 'react'

const requests = [
  { id: 1, title: 'HVAC not cooling',       unit: 'Elm Court 4B',   tenant: 'Marcus Webb',      priority: 'high',   status: 'open',        submitted: 'Apr 16', category: 'HVAC',     icon: Thermometer },
  { id: 2, title: 'Leaking kitchen faucet', unit: 'Oak View 7C',    tenant: 'James Okonkwo',    priority: 'medium', status: 'in-progress', submitted: 'Apr 14', category: 'Plumbing', icon: Drop        },
  { id: 3, title: 'Electrical outlet dead', unit: 'Birch Lane 12',  tenant: 'Sofia Reyes',      priority: 'high',   status: 'open',        submitted: 'Apr 15', category: 'Electric', icon: Lightbulb   },
  { id: 4, title: 'Garage door stuck',      unit: 'Cedar Blvd 3A',  tenant: 'Devon Harrington', priority: 'low',    status: 'open',        submitted: 'Apr 13', category: 'General',  icon: Wrench      },
  { id: 5, title: 'Water heater failure',   unit: 'Maple Ridge 5B', tenant: 'Brian Calloway',   priority: 'urgent', status: 'in-progress', submitted: 'Apr 11', category: 'Plumbing', icon: Fire        },
  { id: 6, title: 'Broken window latch',    unit: 'Elm Court 11D',  tenant: 'Aiko Tanaka',      priority: 'low',    status: 'open',        submitted: 'Apr 10', category: 'General',  icon: Wrench      },
  { id: 7, title: 'Smoke detector beeping', unit: 'Oak View 2F',    tenant: 'Nina Vasquez',     priority: 'medium', status: 'resolved',    submitted: 'Apr 9',  category: 'Safety',   icon: Warning     },
  { id: 8, title: 'Clogged drain',          unit: 'Maple Ridge 2A', tenant: 'Priya Nair',       priority: 'medium', status: 'resolved',    submitted: 'Apr 7',  category: 'Plumbing', icon: Drop        },
]

const priorityMeta: Record<string, { badge: string; label: string }> = {
  urgent: { badge: 'bg-danger/15 text-danger border border-danger/25',     label: 'Urgent' },
  high:   { badge: 'bg-warning/10 text-warning border border-warning/20',  label: 'High'   },
  medium: { badge: 'bg-warning/10 text-warning border border-warning/20',  label: 'Medium' },
  low:    { badge: 'bg-muted/60 text-muted-foreground border border-border', label: 'Low'  },
}

const statusMeta: Record<string, { badge: string; dot: string; icon: React.ElementType }> = {
  'open':        { badge: 'bg-primary/10 text-primary border border-primary/20',   dot: 'bg-primary', icon: Clock       },
  'in-progress': { badge: 'bg-warning/10 text-warning border border-warning/20',   dot: 'bg-warning', icon: Wrench      },
  'resolved':    { badge: 'bg-success/10 text-success border border-success/20',   dot: 'bg-success', icon: CheckCircle },
}

const categoryCounts = requests.reduce<Record<string, number>>((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1
  return acc
}, {})

export default function MaintenancePage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Maintenance</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {requests.length} total · {categoryCounts['open'] ?? 0} open · {categoryCounts['in-progress'] ?? 0} in progress
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
            <Plus weight="bold" className="h-3.5 w-3.5" />
            New Request
          </button>
        </div>

        {/* Status buckets */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Open',        count: categoryCounts['open'] ?? 0,        color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/10'  },
            { label: 'In Progress', count: categoryCounts['in-progress'] ?? 0, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/10'  },
            { label: 'Resolved',    count: categoryCounts['resolved'] ?? 0,    color: 'text-success', bg: 'bg-success/10', border: 'border-success/10'  },
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
              type="search"
              placeholder="Search requests..."
              className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          {['All', 'Open', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${f === 'All' ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Request list */}
        <div className="space-y-2">
          {requests.map((req) => {
            const pMeta = priorityMeta[req.priority]
            const sMeta = statusMeta[req.status]
            const StatusIcon = sMeta.icon
            const ReqIcon = req.icon
            return (
              <div
                key={req.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/40 px-5 py-4 transition-colors hover:bg-muted/20 cursor-pointer"
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
                  <StatusIcon className="h-3 w-3" />
                  {req.status === 'in-progress' ? 'In Progress' : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
