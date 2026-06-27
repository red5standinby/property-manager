'use client'

import Link from 'next/link'
import { useApp } from '@/src/store/context'
import {
  Buildings, ChartBar, CurrencyDollar, FileText,
  Users, Wrench,
  TrendUp, CaretRight, Warning, CheckCircle, Clock,
} from '@phosphor-icons/react'

const STAT_DEFS = [
  {
    label: 'Total Properties',
    key: 'properties' as const,
    value: (v: number) => String(v),
    sub: (props: number) => `${props} managed`,
    icon: Buildings,
    accent: 'text-primary',
    iconBg: 'bg-primary/10',
    glow: 'bg-gradient-to-br from-primary/10 to-transparent',
    ring: 'ring-primary/10',
    trend: () => null,
  },
  {
    label: 'Occupied Units',
    key: 'tenants' as const,
    value: (v: number) => String(v),
    sub: (t: number, p: { units: number }) => `${p.units > 0 ? Math.round((t / p.units) * 100) : 0}% occupancy`,
    icon: Users,
    accent: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    glow: 'bg-gradient-to-br from-violet-500/10 to-transparent',
    ring: 'ring-violet-500/10',
    trend: () => null,
  },
  {
    label: 'Monthly Revenue',
    key: 'revenue' as const,
    value: (v: number) => `$${v.toLocaleString()}`,
    sub: () => 'from active tenants',
    icon: CurrencyDollar,
    accent: 'text-success',
    iconBg: 'bg-success/10',
    glow: 'bg-gradient-to-br from-success/10 to-transparent',
    ring: 'ring-success/10',
    trend: () => null,
  },
  {
    label: 'Open Requests',
    key: 'maintenance' as const,
    value: (v: number) => String(v),
    sub: (v: number) => `${v} need attention`,
    icon: Wrench,
    accent: 'text-warning',
    iconBg: 'bg-warning/10',
    glow: 'bg-gradient-to-br from-warning/10 to-transparent',
    ring: 'ring-warning/10',
    trend: () => null,
  },
]

export default function DashboardPage() {
  const { state } = useApp()
  const { properties, tenants } = state

  const totalUnits = properties.reduce((a, p) => a + p.units, 0)
  const occupied = tenants.length
  const totalRevenue = tenants.reduce((sum, t) => sum + t.rent, 0)
  const openRequests = 5 // hardcoded for now — we'll build maintenance next
  const expiringTenants = tenants.filter(t => t.status === 'expiring')
  const lateTenants = tenants.filter(t => t.status === 'late')

  const PORTFOLIO = properties.slice(0, 6).map(p => {
    const pct = p.units > 0 ? Math.round((p.occupied / p.units) * 100) : 0
    return {
      id: p.id,
      name: p.name.split(' ').slice(0, 2).join(' '),
      units: `${p.occupied}/${p.units}`,
      pct,
      revenue: p.revenue,
    }
  })

  const ALERTS = [
    ...expiringTenants.slice(0, 2).map(t => ({
      icon: 'Clock' as string,
      color: 'text-primary' as string,
      bg: 'bg-primary/10' as string,
      label: `Lease expiring — ${t.name}`,
      sub: `${t.unit} · ${t.leaseLabel}`,
    })),
    ...lateTenants.slice(0, 2).map(t => ({
      icon: 'Warning' as string,
      color: 'text-danger' as string,
      bg: 'bg-danger/10' as string,
      label: `Rent overdue — ${t.name}`,
      sub: `${t.unit} · $${t.rent.toLocaleString()}`,
    })),
  ]

  if (ALERTS.length < 4) {
    ALERTS.push({
      icon: 'CheckCircle',
      color: 'text-success',
      bg: 'bg-success/10',
      label: 'All systems running',
      sub: `${properties.length} properties · ${tenants.length} tenants`,
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-brand-glow-sm">
            <div className="h-3 w-3 rotate-45 rounded-sm bg-white/90" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Vesta<span className="text-primary">OS</span>
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Menu</p>
          {[
            { href: '/dashboard',   label: 'Dashboard',   icon: Buildings,      active: true  },
            { href: '/properties',  label: 'Properties',  icon: Buildings,      active: false },
            { href: '/tenants',     label: 'Tenants',     icon: Users,          active: false },
            { href: '/leases',      label: 'Leases',      icon: FileText,       active: false },
            { href: '/payments',    label: 'Payments',    icon: CurrencyDollar, active: false },
            { href: '/maintenance', label: 'Maintenance', icon: Wrench,         active: false },
            { href: '/reports',     label: 'Reports',     icon: ChartBar,       active: false },
          ].map(({ href, label, icon: Icon, active }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                active ? 'bg-primary/[0.12] text-primary ring-1 ring-inset ring-primary/[0.18]'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}>
              <Icon weight={active ? 'fill' : 'regular'} className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground/70'}`} />
              <span className="flex-1">{label}</span>
              {active && <CaretRight weight="bold" className="h-3 w-3 text-primary/60" />}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-[10px] font-bold text-white">JL</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground/90">Jaime Luna</p>
              <p className="truncate text-[10px] text-muted-foreground/70">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Portfolio overview · {properties.length} properties, {tenants.length} tenants</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Properties', value: String(properties.length), sub: `${properties.length} managed`, icon: Buildings, accent: 'text-primary', iconBg: 'bg-primary/10', glow: 'bg-gradient-to-br from-primary/10 to-transparent', ring: 'ring-primary/10', trend: null },
              { label: 'Occupied Units', value: `${occupied}/${totalUnits}`, sub: `${totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0}% occupancy`, icon: Users, accent: 'text-violet-400', iconBg: 'bg-violet-500/10', glow: 'bg-gradient-to-br from-violet-500/10 to-transparent', ring: 'ring-violet-500/10', trend: null },
              { label: 'Monthly Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'from active tenants', icon: CurrencyDollar, accent: 'text-success', iconBg: 'bg-success/10', glow: 'bg-gradient-to-br from-success/10 to-transparent', ring: 'ring-success/10', trend: null },
              { label: 'Open Requests', value: String(openRequests), sub: `${openRequests} need attention`, icon: Wrench, accent: 'text-warning', iconBg: 'bg-warning/10', glow: 'bg-gradient-to-br from-warning/10 to-transparent', ring: 'ring-warning/10', trend: null },
            ].map((s) => (
              <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ${s.ring} transition-all hover:ring-foreground/10`}>
                <div className={`absolute inset-0 ${s.glow} opacity-60`} />
                <div className="relative">
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <div className={`rounded-lg p-1.5 ${s.iconBg}`}>
                      <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.accent}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {s.trend && <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${s.accent}`}><TrendUp className="h-3 w-3" />{s.trend}</span>}
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
                <Link href="/properties" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80">
                  All properties <CaretRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {PORTFOLIO.map((p) => (
                  <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
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
                          <div className={`h-full rounded-full ${p.pct >= 90 ? 'bg-success' : p.pct >= 75 ? 'bg-primary' : 'bg-warning'}`}
                            style={{ width: `${p.pct}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[10px] font-medium text-foreground/75">{p.pct}%</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-foreground/90">{p.revenue}</span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                <span className="text-[11px] text-muted-foreground">Total monthly rent roll</span>
                <span className="text-sm font-bold text-success">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Alerts card */}
            <div className="rounded-2xl bg-card/80 ring-1 ring-border lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Alerts</p>
                  <p className="text-[11px] text-muted-foreground">{ALERTS.length} items</p>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/20 text-[10px] font-bold text-danger">{ALERTS.length}</span>
              </div>

              <div className="divide-y divide-border">
                {ALERTS.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20 cursor-pointer">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${a.bg}`}>
                      {a.icon === 'Clock' ? <Clock className={`h-3.5 w-3.5 ${a.color}`} /> :
                   a.icon === 'Warning' ? <Warning className={`h-3.5 w-3.5 ${a.color}`} /> :
                   <CheckCircle className={`h-3.5 w-3.5 ${a.color}`} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground/90">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
