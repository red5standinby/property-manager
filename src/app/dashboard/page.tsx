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
    accent: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    glow: 'bg-gradient-to-br from-blue-500/10 to-transparent',
    ring: 'ring-blue-500/10',
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
    accent: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    glow: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
    ring: 'ring-emerald-500/10',
  },
  {
    label: 'Open Requests',
    value: '11',
    sub: '4 high priority',
    trend: '-3',
    icon: Wrench,
    accent: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    glow: 'bg-gradient-to-br from-amber-500/10 to-transparent',
    ring: 'ring-amber-500/10',
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
  { icon: Warning,      color: 'text-amber-400',   bg: 'bg-amber-500/10',  label: 'HVAC failure reported',        sub: 'Elm Court 4B · 2 hr ago'        },
  { icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10',   label: 'Lease expiring in 30 days',    sub: 'James Okonkwo · Oak View 7C'    },
  { icon: Warning,      color: 'text-red-400',     bg: 'bg-red-500/10',    label: 'Rent overdue by 16 days',      sub: 'Brian Calloway · Maple Ridge 5B' },
  { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10',label: 'Maintenance resolved',         sub: 'Plumbing · Cedar Blvd #7'        },
  { icon: Clock,        color: 'text-blue-400',    bg: 'bg-blue-500/10',   label: 'Lease expiring in 45 days',    sub: 'Aiko Tanaka · Elm Court 11D'     },
]

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-900 lg:flex">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/60 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_12px_rgba(59,130,246,0.35)]">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Vesta<span className="text-blue-400">OS</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Menu
          </p>
          {NAV.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-blue-500/[0.12] text-blue-300 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.18)]'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              <Icon
                weight={active ? 'fill' : 'regular'}
                className={`h-4 w-4 shrink-0 ${active ? 'text-blue-400' : 'text-zinc-500'}`}
              />
              <span className="flex-1">{label}</span>
              {active && <CaretRight weight="bold" className="h-3 w-3 text-blue-500/60" />}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-800/60 p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">
              JL
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-200">Jaime Luna</p>
              <p className="truncate text-[10px] text-zinc-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800/60 bg-zinc-950/80 px-6 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
            <p className="text-xs text-zinc-400">April 17, 2026 · Portfolio overview</p>
          </div>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`relative overflow-hidden rounded-2xl bg-zinc-900 p-5 ring-1 ${s.ring} transition-all hover:ring-white/10`}
              >
                <div className={`absolute inset-0 ${s.glow} opacity-60`} />
                <div className="relative">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      {s.label}
                    </p>
                    <div className={`rounded-lg p-1.5 ${s.iconBg}`}>
                      <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.accent}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-zinc-100">{s.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${s.accent}`}>
                      <TrendUp className="h-3 w-3" />
                      {s.trend}
                    </span>
                    <span className="text-[10px] text-zinc-500">{s.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Portfolio card (large) */}
            <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/60 lg:col-span-3">
              <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Portfolio Overview</p>
                  <p className="text-[11px] text-zinc-400">Occupancy &amp; revenue by property</p>
                </div>
                <Link
                  href="/properties"
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
                >
                  All properties <CaretRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-zinc-800/40">
                {PORTFOLIO.map((p) => (
                  <div key={p.name} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                      <Buildings weight="duotone" className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-200">{p.name}</span>
                        <span className="text-[11px] text-zinc-400">{p.units} units</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.pct >= 90 ? 'bg-emerald-500' :
                              p.pct >= 75 ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[10px] font-medium text-zinc-300">
                          {p.pct}%
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-zinc-200">{p.revenue}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/60 px-5 py-3.5">
                <span className="text-[11px] text-zinc-400">Total collected — April 2026</span>
                <span className="text-sm font-bold text-emerald-400">$81,400</span>
              </div>
            </div>

            {/* Alerts card */}
            <div className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800/60 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Alerts</p>
                  <p className="text-[11px] text-zinc-400">5 items need attention</p>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                  5
                </span>
              </div>

              <div className="divide-y divide-zinc-800/40">
                {ALERTS.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-800/20 cursor-pointer">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${a.bg}`}>
                      <a.icon className={`h-3.5 w-3.5 ${a.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200">{a.label}</p>
                      <p className="text-[10px] text-zinc-400">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800/60 px-5 py-3">
                <button className="w-full text-center text-[11px] font-medium text-blue-400 hover:text-blue-300">
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
