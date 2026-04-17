import { AppShell } from '@/src/components/layout/app-shell'
import {
  ChartBar,
  CurrencyDollar,
  Users,
  Buildings,
  Wrench,
  FileText,
  TrendUp,
  CalendarBlank,
  ArrowRight,
  DownloadSimple,
} from '@phosphor-icons/react/dist/ssr'

const reportTypes = [
  {
    title: 'Revenue Report',
    description: 'Monthly and YTD income, expenses, and net operating income.',
    icon: CurrencyDollar,
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    tags: ['Financial', 'Monthly'],
  },
  {
    title: 'Occupancy Analysis',
    description: 'Unit-level and property-level occupancy rates over time.',
    icon: Buildings,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    tags: ['Operations', 'Trend'],
  },
  {
    title: 'Tenant Overview',
    description: 'Active tenants, renewals, move-ins, move-outs, and churn.',
    icon: Users,
    color: 'from-violet-500/20 to-violet-600/5',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    tags: ['Tenants', 'Quarterly'],
  },
  {
    title: 'Maintenance Summary',
    description: 'Request volume, resolution times, and cost breakdown by category.',
    icon: Wrench,
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    tags: ['Maintenance', 'Monthly'],
  },
  {
    title: 'Lease Expiration',
    description: 'Upcoming lease expirations grouped by month and property.',
    icon: FileText,
    color: 'from-rose-500/20 to-rose-600/5',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    tags: ['Leases', 'Forecast'],
  },
  {
    title: 'Rent Collection',
    description: 'Collection rates, late payments, and outstanding balances.',
    icon: TrendUp,
    color: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    tags: ['Financial', 'Monthly'],
  },
]

const recentReports = [
  { name: 'March 2026 Revenue Report',     date: 'Apr 1, 2026',  size: '184 KB', type: 'PDF' },
  { name: 'Q1 2026 Occupancy Analysis',    date: 'Apr 1, 2026',  size: '96 KB',  type: 'PDF' },
  { name: 'Lease Expiration — Q2 2026',    date: 'Mar 28, 2026', size: '62 KB',  type: 'XLSX' },
  { name: 'Feb 2026 Maintenance Summary',  date: 'Mar 3, 2026',  size: '78 KB',  type: 'PDF' },
  { name: 'Rent Collection — March 2026',  date: 'Apr 3, 2026',  size: '55 KB',  type: 'PDF' },
]

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Reports</h1>
            <p className="mt-1 text-xs text-zinc-500">Generate, schedule, and download portfolio reports</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-700/60">
            <CalendarBlank weight="bold" className="h-3.5 w-3.5" />
            Schedule Report
          </button>
        </div>

        {/* Report types */}
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
          Available Reports
        </p>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reportTypes.map((r) => (
            <div
              key={r.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 transition-all duration-200 hover:border-zinc-700/60 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-30 transition-opacity group-hover:opacity-50`} />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-xl p-2.5 ${r.iconBg}`}>
                    <r.icon weight="duotone" className={`h-5 w-5 ${r.iconColor}`} />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-zinc-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="mb-1 text-sm font-medium text-zinc-200">{r.title}</p>
                <p className="mb-3 text-xs leading-relaxed text-zinc-500">{r.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Recent Reports</p>
              <p className="text-[11px] text-zinc-500">Previously generated exports</p>
            </div>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {recentReports.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/20">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <ChartBar weight="duotone" className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-200">{r.name}</p>
                  <p className="text-[10px] text-zinc-500">{r.date} · {r.size}</p>
                </div>
                <span className="rounded-md bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                  {r.type}
                </span>
                <button className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300">
                  <DownloadSimple className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
