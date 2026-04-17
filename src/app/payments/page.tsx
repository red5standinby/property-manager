import { AppShell } from '@/src/components/layout/app-shell'
import { CurrencyDollar, ArrowDown, ArrowUp, Warning, MagnifyingGlass, Plus } from '@phosphor-icons/react/dist/ssr'

const transactions = [
  { id: 1,  tenant: 'Marcus Webb',      unit: 'Elm Court 4B',    amount: 2400, date: 'Apr 15, 2026', method: 'ACH',  type: 'rent',    status: 'paid'    },
  { id: 2,  tenant: 'Priya Nair',       unit: 'Maple Ridge 2A',  amount: 1850, date: 'Apr 16, 2026', method: 'Card', type: 'rent',    status: 'paid'    },
  { id: 3,  tenant: 'Sofia Reyes',      unit: 'Birch Lane 12',   amount: 1650, date: 'Apr 14, 2026', method: 'ACH',  type: 'rent',    status: 'paid'    },
  { id: 4,  tenant: 'Devon Harrington', unit: 'Cedar Blvd 3A',   amount: 2200, date: 'Apr 12, 2026', method: 'Check',type: 'rent',    status: 'paid'    },
  { id: 5,  tenant: 'Nina Vasquez',     unit: 'Oak View 2F',     amount: 2050, date: 'Apr 13, 2026', method: 'ACH',  type: 'rent',    status: 'paid'    },
  { id: 6,  tenant: 'Aiko Tanaka',      unit: 'Elm Court 11D',   amount: 2300, date: 'Apr 16, 2026', method: '—',    type: 'rent',    status: 'pending' },
  { id: 7,  tenant: 'James Okonkwo',    unit: 'Oak View 7C',     amount: 2100, date: 'Apr 10, 2026', method: '—',    type: 'rent',    status: 'pending' },
  { id: 8,  tenant: 'Brian Calloway',   unit: 'Maple Ridge 5B',  amount: 1900, date: 'Apr 1, 2026',  method: '—',    type: 'rent',    status: 'overdue' },
  { id: 9,  tenant: 'Marcus Webb',      unit: 'Elm Court 4B',    amount: 350,  date: 'Apr 5, 2026',  method: 'Card', type: 'fee',     status: 'paid'    },
  { id: 10, tenant: 'Nina Vasquez',     unit: 'Oak View 2F',     amount: 200,  date: 'Apr 8, 2026',  method: 'ACH',  type: 'deposit', status: 'paid'    },
]

const statCards = [
  {
    label: 'Collected (April)',
    value: '$10,750',
    sub: '5 payments received',
    icon: ArrowDown,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/10',
    glow: 'shadow-[0_0_0_1px_rgba(52,211,153,0.10)]',
  },
  {
    label: 'Outstanding',
    value: '$4,400',
    sub: '2 payments pending',
    icon: CurrencyDollar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/10',
    glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.10)]',
  },
  {
    label: 'Overdue',
    value: '$1,900',
    sub: '1 payment past due',
    icon: Warning,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/10',
    glow: 'shadow-[0_0_0_1px_rgba(248,113,113,0.10)]',
  },
  {
    label: 'Total Expected',
    value: '$17,050',
    sub: 'April 2026',
    icon: ArrowUp,
    color: 'text-zinc-300',
    bg: 'bg-zinc-700/40',
    border: 'border-zinc-700/20',
    glow: '',
  },
]

const statusMeta: Record<string, { badge: string; dot: string }> = {
  paid:    { badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500' },
  pending: { badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',         dot: 'bg-blue-500'    },
  overdue: { badge: 'bg-red-500/10 text-red-400 border border-red-500/20',            dot: 'bg-red-500'     },
}

const typeMeta: Record<string, string> = {
  rent:    'text-zinc-400',
  fee:     'text-amber-400',
  deposit: 'text-violet-400',
}

export default function PaymentsPage() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Payments</h1>
            <p className="mt-1 text-xs text-zinc-500">April 2026 · Rent cycle</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-500">
            <Plus weight="bold" className="h-3.5 w-3.5" />
            Record Payment
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-zinc-900/40 p-5 ${s.glow}`}>
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[11px] font-medium text-zinc-500">{s.label}</p>
                <div className={`rounded-lg p-1.5 ${s.bg}`}>
                  <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] text-zinc-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
            <p className="text-sm font-medium text-zinc-200">Transactions</p>
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                placeholder="Search..."
                className="h-7 w-44 rounded-lg border border-zinc-800 bg-zinc-800/40 pl-8 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-800/40">
            {transactions.map((tx) => {
              const s = statusMeta[tx.status]
              return (
                <div key={tx.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/20 cursor-pointer">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-zinc-200">{tx.tenant}</p>
                      <p className="text-[10px] text-zinc-500">{tx.unit}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col">
                    <p className="text-[11px] text-zinc-400">{tx.date}</p>
                    <p className={`text-[10px] capitalize ${typeMeta[tx.type] ?? 'text-zinc-500'}`}>{tx.type}</p>
                  </div>

                  <div className="hidden md:block text-[11px] text-zinc-500 w-12 text-center">
                    {tx.method}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${tx.status === 'paid' ? 'text-emerald-400' : tx.status === 'overdue' ? 'text-red-400' : 'text-zinc-300'}`}>
                      ${tx.amount.toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${s.badge}`}>
                      <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                      {tx.status}
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
