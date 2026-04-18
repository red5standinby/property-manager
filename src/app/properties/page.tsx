import { AppShell } from '@/src/components/layout/app-shell'
import { Buildings, Plus, MagnifyingGlass, SlidersHorizontal, MapPin, Users } from '@phosphor-icons/react/dist/ssr'

const properties = [
  {
    id: 1,
    name: 'Elm Court Residences',
    address: '420 Elm Court Dr, Austin TX 78701',
    units: 50,
    occupied: 49,
    type: 'Multi-family',
    revenue: '$47,200',
    status: 'active',
    img: null,
  },
  {
    id: 2,
    name: 'Maple Ridge Apartments',
    address: '812 Maple Ridge Blvd, Austin TX 78704',
    units: 50,
    occupied: 46,
    type: 'Multi-family',
    revenue: '$38,900',
    status: 'active',
    img: null,
  },
  {
    id: 3,
    name: 'Oak View Condos',
    address: '55 Oak View Ln, Austin TX 78705',
    units: 50,
    occupied: 44,
    type: 'Condo',
    revenue: '$31,400',
    status: 'active',
    img: null,
  },
  {
    id: 4,
    name: 'Birch Lane Complex',
    address: '1100 Birch Lane, Austin TX 78745',
    units: 50,
    occupied: 38,
    type: 'Multi-family',
    revenue: '$26,800',
    status: 'active',
    img: null,
  },
  {
    id: 5,
    name: 'Cedar Blvd Townhomes',
    address: '77 Cedar Blvd, Austin TX 78748',
    units: 50,
    occupied: 32,
    type: 'Townhome',
    revenue: '$22,400',
    status: 'renovation',
    img: null,
  },
  {
    id: 6,
    name: 'Pinewood Commons',
    address: '300 Pinewood Cir, Round Rock TX 78664',
    units: 24,
    occupied: 0,
    type: 'Multi-family',
    revenue: '—',
    status: 'pending',
    img: null,
  },
]

const statusStyles: Record<string, string> = {
  active:     'bg-success/10 text-success border border-success/20',
  renovation: 'bg-warning/10 text-warning border border-warning/20',
  pending:    'bg-muted/60 text-muted-foreground border border-border',
}

export default function PropertiesPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Properties</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {properties.length} properties · {properties.reduce((a, p) => a + p.units, 0)} total units
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 hover:shadow-brand-glow-md">
            <Plus weight="bold" className="h-3.5 w-3.5" />
            Add Property
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="search"
              placeholder="Search properties..."
              className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          {['All', 'Active', 'Renovation', 'Pending'].map((f) => (
            <button
              key={f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${f === 'All' ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => {
            const occupancyPct = p.units > 0 ? Math.round((p.occupied / p.units) * 100) : 0
            return (
              <div
                key={p.id}
                className="group flex flex-col rounded-2xl border border-border bg-card/40 transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                {/* Image placeholder */}
                <div className="h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-muted to-card">
                  <div className="flex h-full items-center justify-center">
                    <Buildings weight="duotone" className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-foreground">
                        {p.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground/50">Units</p>
                      <p className="text-xs font-semibold text-foreground/90">{p.units}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/50">Occupied</p>
                      <p className="text-xs font-semibold text-foreground/90">{p.occupied}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground/50">Revenue</p>
                      <p className="text-xs font-semibold text-foreground/90">{p.revenue}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <Users className="h-3 w-3" />
                        Occupancy
                      </span>
                      <span className="text-[11px] font-semibold text-foreground/75">{occupancyPct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 90 ? 'bg-success' :
                          occupancyPct >= 70 ? 'bg-primary' :
                          occupancyPct >= 40 ? 'bg-warning' : 'bg-muted-foreground/30'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
