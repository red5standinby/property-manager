import { AppShell } from '@/src/components/layout/app-shell'
import { Plus, MagnifyingGlass, SlidersHorizontal, Envelope, Phone, MapPin } from '@phosphor-icons/react/dist/ssr'

const tenants = [
  { id: 1, name: 'Marcus Webb',      email: 'marcuswebb@email.com',   phone: '(512) 555-0142', unit: 'Elm Court 4B',       lease: 'Expires Aug 2026', status: 'current',  since: 'Mar 2024' },
  { id: 2, name: 'Priya Nair',       email: 'priya.nair@email.com',   phone: '(512) 555-0187', unit: 'Maple Ridge 2A',     lease: 'Expires Dec 2026', status: 'current',  since: 'Apr 2026' },
  { id: 3, name: 'James Okonkwo',    email: 'j.okonkwo@email.com',    phone: '(512) 555-0231', unit: 'Oak View 7C',        lease: 'Expires May 2026', status: 'expiring', since: 'May 2022' },
  { id: 4, name: 'Sofia Reyes',      email: 'sofiar@email.com',       phone: '(512) 555-0099', unit: 'Birch Lane 12',      lease: 'Expires Sep 2026', status: 'current',  since: 'Sep 2023' },
  { id: 5, name: 'Devon Harrington', email: 'd.harrington@email.com', phone: '(512) 555-0304', unit: 'Cedar Blvd 3A',      lease: 'Expires Jul 2026', status: 'current',  since: 'Jul 2025' },
  { id: 6, name: 'Aiko Tanaka',      email: 'atanaka@email.com',      phone: '(512) 555-0418', unit: 'Elm Court 11D',      lease: 'Expires Jun 2026', status: 'expiring', since: 'Jun 2023' },
  { id: 7, name: 'Brian Calloway',   email: 'b.calloway@email.com',   phone: '(512) 555-0552', unit: 'Maple Ridge 5B',     lease: 'Overdue',          status: 'late',     since: 'Feb 2025' },
  { id: 8, name: 'Nina Vasquez',     email: 'nvasquez@email.com',     phone: '(512) 555-0611', unit: 'Oak View 2F',        lease: 'Expires Nov 2026', status: 'current',  since: 'Nov 2024' },
]

const statusStyles: Record<string, { badge: string; dot: string }> = {
  current:  { badge: 'bg-success/10 text-success border border-success/20',   dot: 'bg-success'  },
  expiring: { badge: 'bg-warning/10 text-warning border border-warning/20',   dot: 'bg-warning'  },
  late:     { badge: 'bg-danger/10 text-danger border border-danger/20',       dot: 'bg-danger'   },
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const avatarColors = [
  'from-blue-600 to-blue-800',
  'from-violet-600 to-violet-800',
  'from-emerald-600 to-emerald-800',
  'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-700',
  'from-cyan-600 to-cyan-800',
  'from-pink-600 to-pink-800',
  'from-indigo-600 to-indigo-800',
]

export default function TenantsPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Tenants</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {tenants.length} tenants · 1 late payment · 2 leases expiring soon
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
            <Plus weight="bold" className="h-3.5 w-3.5" />
            Add Tenant
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="search"
              placeholder="Search tenants..."
              className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          {['All', 'Current', 'Expiring', 'Late'].map((f) => (
            <button
              key={f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${f === 'All' ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Tenant</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Unit</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 sm:block">Contact</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 md:block">Lease</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Status</span>
          </div>

          <div className="divide-y divide-border">
            {tenants.map((tenant, i) => {
              const s = statusStyles[tenant.status]
              return (
                <div
                  key={tenant.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-[11px] font-bold text-white`}>
                      {initials(tenant.name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground/90">{tenant.name}</p>
                      <p className="text-[10px] text-muted-foreground/70">Since {tenant.since}</p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                      <span className="truncate">{tenant.unit}</span>
                    </div>
                  </div>

                  <div className="hidden flex-col gap-0.5 sm:flex">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Envelope className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-36">{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{tenant.phone}</span>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-[11px] text-muted-foreground">{tenant.lease}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${s.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {tenant.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
