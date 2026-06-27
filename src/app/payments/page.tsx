'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { CurrencyDollar, ArrowDown, ArrowUp, Warning, MagnifyingGlass, Plus } from '@phosphor-icons/react'

const statusMeta: Record<string, { badge: string; dot: string }> = {
  paid:    { badge: 'bg-success/10 text-success border border-success/20', dot: 'bg-success' },
  pending: { badge: 'bg-primary/10 text-primary border border-primary/20', dot: 'bg-primary' },
  overdue: { badge: 'bg-danger/10 text-danger border border-danger/20',    dot: 'bg-danger'  },
}

const typeMeta: Record<string, string> = {
  rent:    'text-muted-foreground',
  fee:     'text-warning',
  deposit: 'text-violet-400',
}

export default function PaymentsPage() {
  const { state } = useApp()
  const { payments, tenants } = state
  const [search, setSearch] = useState('')

  const collected = payments.filter(p => p.status === 'paid')
  const pending = payments.filter(p => p.status === 'pending')
  const overdue = payments.filter(p => p.status === 'overdue')

  const collectedTotal = collected.reduce((sum, p) => sum + p.amount, 0)
  const pendingTotal = pending.reduce((sum, p) => sum + p.amount, 0)
  const overdueTotal = overdue.reduce((sum, p) => sum + p.amount, 0)
  const expectedTotal = tenants.reduce((sum, t) => sum + t.rent, 0)

  const filtered = payments.filter(p =>
    !search || p.tenant.toLowerCase().includes(search.toLowerCase()) || p.unit.toLowerCase().includes(search.toLowerCase())
  )

  const statCards = [
    {
      label: 'Collected',
      value: `$${collectedTotal.toLocaleString()}`,
      sub: `${collected.length} payments received`,
      icon: ArrowDown,
      color: 'text-success',
      bg: 'bg-success/10',
      ring: 'ring-1 ring-success/10',
    },
    {
      label: 'Outstanding',
      value: `$${pendingTotal.toLocaleString()}`,
      sub: `${pending.length} payments pending`,
      icon: CurrencyDollar,
      color: 'text-primary',
      bg: 'bg-primary/10',
      ring: 'ring-1 ring-primary/10',
    },
    {
      label: 'Overdue',
      value: `$${overdueTotal.toLocaleString()}`,
      sub: `${overdue.length} payments past due`,
      icon: Warning,
      color: 'text-danger',
      bg: 'bg-danger/10',
      ring: 'ring-1 ring-danger/10',
    },
    {
      label: 'Total Expected',
      value: `$${expectedTotal.toLocaleString()}`,
      sub: `${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      icon: ArrowUp,
      color: 'text-foreground/75',
      bg: 'bg-muted/60',
      ring: '',
    },
  ]

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Payments</h1>
            <p className="mt-1 text-xs text-muted-foreground/70">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · Rent cycle</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className={`rounded-2xl border border-border bg-card/40 p-5 ${s.ring}`}>
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[11px] font-medium text-muted-foreground/70">{s.label}</p>
                <div className={`rounded-lg p-1.5 ${s.bg}`}>
                  <s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground/50">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-sm font-medium text-foreground/90">Transactions</p>
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-7 w-44 rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-xs text-muted-foreground/50">No transactions found</div>
            ) : (
              filtered.map((tx) => {
                const s = statusMeta[tx.status]
                return (
                  <div key={tx.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground/90">{tx.tenant}</p>
                        <p className="text-[10px] text-muted-foreground/70">{tx.unit}</p>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col">
                      <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                      <p className={`text-[10px] capitalize ${typeMeta[tx.type] ?? 'text-muted-foreground/70'}`}>{tx.type}</p>
                    </div>

                    <div className="hidden md:block text-[11px] text-muted-foreground/70 w-12 text-center">
                      {tx.method}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${tx.status === 'paid' ? 'text-success' : tx.status === 'overdue' ? 'text-danger' : 'text-foreground/75'}`}>
                        ${tx.amount.toLocaleString()}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${s.badge}`}>
                        <span className={`h-1 w-1 rounded-full ${s.dot}`} />
                        {tx.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
