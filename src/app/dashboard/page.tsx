import Link from 'next/link'
import {
  Buildings,
  ChartBar,
  CurrencyDollar,
  FileText,
  Gear,
  House,
  TrendUp,
  Users,
  Warning,
  Wrench,
  CheckCircle,
  Clock,
  CaretRight,
  Bell,
} from '@phosphor-icons/react/dist/ssr'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: House,          active: true  },
  { href: '/properties',  label: 'Properties',  icon: Buildings,      active: false },
  { href: '/tenants',     label: 'Tenants',     icon: Users,          active: false },
  { href: '/leases',      label: 'Leases',      icon: FileText,       active: false },
  { href: '/payments',    label: 'Payments',    icon: CurrencyDollar, active: false },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench,         active: false },
  { href: '/reports',     label: 'Reports',     icon: ChartBar,       active: false },
  { href: '/settings',    label: 'Settings',    icon: Gear,           active: false },
] as const

const STATS = [
  {
    label: 'Total Properties',
    value: '24',
    sub: '+3 this month',
    trend: '+12.5%',
    icon: Buildings,
    accent: 'text-primary',
    iconBg: 'bg-primary/10',
    glow: 'bg-gradient-to-br from-primary/10 to-transparent',
    ring: 'ring-primary/10',
  },
  {
    label: 'Occupied Units',
    value: '187',
    sub: '94% occupancy',
    trend: '+2.1%',
    icon: Users,
    accent: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    glow: 'bg-gradient-to-br from-violet-500/10 to-transparent',
    ring: 'ring-violet-500/10',
  },
  {
    label: 'Monthly Revenue',
    value: '$94,200',
    sub: 'vs $87,400 last mo.',
    trend: '+7.8%',
    icon: CurrencyDollar,
    accent: 'text-success',
    iconBg: 'bg-success/10',
    glow: 'bg-gradient-to-br from-success/10 to-transparent',
    ring: 'ring-success/10',
  },
  {
    label: 'Open Requests',
    value: '11',
    sub: '4 high priority',
    trend: '-3',
    icon: Wrench,
    accent: 'text-warning',
    iconBg: 'bg-warning/10',
    glow: 'bg-gradient-to-br from-warning/10 to-transparent',
    ring: 'ring-warning/10',
  },
] as const

const PORTFOLIO = [
  { name: 'Elm Court',    units: '49/50', pct: 98, revenue: '$47,200' },
  { name: 'Maple Ridge',  units: '46/50', pct: 92, revenue: '$38,900' },
  { name: 'Oak View',     units: '44/50', pct: 88, revenue: '$31,400' },
  { name: 'Birch Lane',   units: '38/50', pct: 76, revenue: '$26,800' },
  { name: 'Cedar Blvd',   units: '32/50', pct: 64, revenue: '$22,400' },
]

const ALERTS = [
  { icon: Warning,      color: 'text-warning',  bg: 'bg-warning/10',  label: 'HVAC failure reported',        sub: 'Elm Court 4B · 2 hr ago'        },
  { icon: Clock,        color: 'text-primary',  bg: 'bg-primary/10',  label: 'Lease expiring in 30 days',    sub: 'James Okonkwo · Oak View 7C'    },
  { icon: Warning,      color: 'text-danger',   bg: 'bg-danger/10',   label: 'Rent overdue by 16 days',      sub: 'Brian Calloway · Maple Ridge 5B' },
  { icon: CheckCircle,  color: 'text-success',  bg: 'bg-success/10',  label: 'Maintenance resolved',         sub: 'Plumbing · Cedar Blvd #7'        },
  { icon: Clock,        color: 'text-primary',  bg: 'bg-primary/10',  label: 'Lease expiring in 45 days',    sub: 'Aiko Tanaka · Elm Court 11D'     },
]

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-brand-glow-sm">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Vesta<span className="text-primary">OS</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Menu
          </p>
          {NAV.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary/[0.12] text-primary ring-1 ring-inset ring-primary/[0.18]'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <Icon
                weight={active ? 'fill' : 'regular'}
                className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground/70'}`}
              />
              <span className="flex-1">{label}</span>
              {active && <CaretRight weight="bold" className="h-3 w-3 text-primary/60" />}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground/90">Jaime Luna</p>
              <p className="truncate text-[10px] text-muted-foreground/70">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">April 17, 2026 · Portfolio overview</p>
          </div>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-brand-glow-xs" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ${s.ring} transition-all hover:ring-foreground/10`}
              >
                <div className={`absolute inset-0 ${s.glow} opacity-60`} />
                <div className="relative">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                    <div className={`rounded-lg p-1.5 ${s.iconBg}`}>
                      <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.accent}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${s.accent}`}>
                      <TrendUp className="h-3 w-3" />
                      {s.trend}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">{s.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Portfolio card */}
            <div className="rounded-2xl bg-card/80 ring-1 ring-border lg:col-span-3">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Portfolio Overview</p>
                  <p className="text-[11px] text-muted-foreground">Occupancy &amp; revenue by property</p>
                </div>
                <Link
                  href="/properties"
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
                >
                  All properties <CaretRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {PORTFOLIO.map((p) => (
                  <div key={p.name} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Buildings weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground/90">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.units} units</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.pct >= 90 ? 'bg-success' :
                              p.pct >= 75 ? 'bg-primary' :
                              'bg-warning'
                            }`}
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[10px] font-medium text-foreground/75">
                          {p.pct}%
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-foreground/90">{p.revenue}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                <span className="text-[11px] text-muted-foreground">Total collected — April 2026</span>
                <span className="text-sm font-bold text-success">$81,400</span>
              </div>
            </div>

            {/* Alerts card */}
            <div className="rounded-2xl bg-card/80 ring-1 ring-border lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Alerts</p>
                  <p className="text-[11px] text-muted-foreground">5 items need attention</p>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/20 text-[10px] font-bold text-danger">
                  5
                </span>
              </div>

              <div className="divide-y divide-border">
                {ALERTS.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20 cursor-pointer">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${a.bg}`}>
                      <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground/90">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-3">
                <button className="w-full text-center text-[11px] font-medium text-primary hover:text-primary/80">
                  View all alerts
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
