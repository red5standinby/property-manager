'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { StatusBadge, toneFor } from '@/src/components/status-badge'
import {
  RowActions, RowActionsTrigger, RowActionsContent, RowActionItem,
  RowActionsSeparator, RowActionsLabel,
} from '@/src/components/row-actions'
import type { Payment, PaymentMethod, PaymentStatus, PaymentType } from '@/src/lib/types'
import { paymentTotal, formatDate, monthStart, monthEnd } from '@/src/lib/derived'
import {
  CurrencyDollar, ArrowDown, ArrowUp, Warning, MagnifyingGlass, Plus,
  PencilSimple, TrashSimple, X, Receipt, Prohibit, DotsThree, CheckCircle,
  ClockCountdown, ArrowCounterClockwise,
} from '@phosphor-icons/react'

const typeMeta: Record<PaymentType, string> = {
  rent:    'text-muted-foreground',
  fee:     'text-warning',
  deposit: 'text-violet-400',
}

const methodLabel: Record<PaymentMethod, string> = { ach: 'ACH', card: 'Card', check: 'Check', cash: 'Cash' }

const methodOptions: PaymentMethod[] = ['ach', 'card', 'check', 'cash']
const statusOptions: PaymentStatus[] = ['paid', 'pending', 'partial', 'overdue']
const typeOptions: PaymentType[] = ['rent', 'fee', 'deposit']

// ─── Payment Form Modal ───────────────────────────────────────────

type PaymentFormData = {
  leaseId: string
  tenantId: string
  periodStart: string
  periodEnd: string
  amount: string
  lateFee: string
  lateFeeWaived: boolean
  type: PaymentType
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string
  note: string
}

function PaymentFormModal({
  open, initial, onSave, onClose,
}: {
  open: boolean
  initial?: PaymentFormData
  onSave: (data: PaymentFormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<PaymentFormData>(initial ?? {
    leaseId: '', tenantId: '', periodStart: monthStart(), periodEnd: monthEnd(),
    amount: '0', lateFee: '0', lateFeeWaived: false, type: 'rent', method: 'ach',
    status: 'pending', paidAt: '', note: '',
  })
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{initial ? 'Edit Payment' : 'Record Payment'}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Lease / Tenant</label>
              <LeasePicker value={data.leaseId} onChange={(leaseId, tenantId) => setData(d => ({ ...d, leaseId, tenantId }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Period Start</label>
                <input type="date" value={data.periodStart} onChange={e => setData(d => ({ ...d, periodStart: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Period End</label>
                <input type="date" value={data.periodEnd} onChange={e => setData(d => ({ ...d, periodEnd: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Amount ($)</label>
                <input type="number" min={0} value={data.amount} onChange={e => setData(d => ({ ...d, amount: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Late Fee ($)</label>
                <input type="number" min={0} value={data.lateFee} onChange={e => setData(d => ({ ...d, lateFee: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Type</label>
                <select value={data.type} onChange={e => setData(d => ({ ...d, type: e.target.value as PaymentType }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs capitalize text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
              <input type="checkbox" checked={data.lateFeeWaived} onChange={e => setData(d => ({ ...d, lateFeeWaived: e.target.checked }))}
                className="h-3.5 w-3.5 accent-[var(--primary)]" />
              <span className="text-[11px] text-foreground/80">Waive late fee</span>
              <span className="ml-auto text-[11px] font-semibold text-foreground/70">
                Total owed ${(Number(data.amount) || 0) + (data.lateFeeWaived ? 0 : Number(data.lateFee) || 0)}
              </span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Status</label>
                <select value={data.status} onChange={e => setData(d => ({ ...d, status: e.target.value as PaymentStatus }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs capitalize text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Method</label>
                <select value={data.method} onChange={e => setData(d => ({ ...d, method: e.target.value as PaymentMethod }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {methodOptions.map(m => <option key={m} value={m}>{methodLabel[m]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Paid On</label>
                <input type="date" value={data.paidAt} onChange={e => setData(d => ({ ...d, paidAt: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Note</label>
              <input value={data.note} onChange={e => setData(d => ({ ...d, note: e.target.value }))}
                className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Optional" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => onSave(data)} disabled={!data.leaseId || (!(Number(data.amount) > 0) && !(Number(data.lateFee) > 0))}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
              {initial ? 'Save Changes' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function LeasePicker({ value, onChange }: { value: string; onChange: (leaseId: string, tenantId: string) => void }) {
  const { state } = useApp()
  const { leases, tenants, properties } = state
  const propName = (id: string) => properties.find(p => p.id === id)?.name ?? '—'
  const tenantLabel = (ids: string[]) => ids.map(id => tenants.find(t => t.id === id)?.name ?? '?').join(' & ')
  return (
    <select value={value} onChange={e => {
      const lease = leases.find(l => l.id === e.target.value)
      onChange(e.target.value, lease?.tenantIds[0] ?? '')
    }}
      className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
      <option value="">Select a lease</option>
      {leases.map(l => <option key={l.id} value={l.id}>{propName(l.propertyId)} · {l.unit} — {tenantLabel(l.tenantIds)}</option>)}
    </select>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────

function DeleteConfirm({ open, label, onConfirm, onClose }: {
  open: boolean; label: string; onConfirm: () => void; onClose: () => void
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <p className="text-sm font-semibold text-foreground">Delete payment?</p>
          <p className="mt-2 text-xs text-muted-foreground/70">{label} will be permanently removed.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={onConfirm} className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white">Delete</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { state, dispatch } = useApp()
  const { payments, tenants, properties, leases } = state
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; data: PaymentFormData } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)

  const tenantName = (id: string) => tenants.find(t => t.id === id)?.name ?? 'Unknown'
  const unitOf = (id: string) => tenants.find(t => t.id === id)?.unit ?? '—'
  const propName = (id: string) => properties.find(p => p.id === id)?.name ?? '—'

  const collected = payments.filter(p => p.status === 'paid')
  const pending = payments.filter(p => p.status === 'pending')
  const partial = payments.filter(p => p.status === 'partial')
  const overdue = payments.filter(p => p.status === 'overdue')

  const rentPayments = payments.filter(p => p.type === 'rent')
  const collectedTotal = collected.filter(p => p.type !== 'deposit').reduce((s, p) => s + paymentTotal(p), 0)
  const outstanding = [...pending, ...partial, ...overdue].reduce((s, p) => s + paymentTotal(p), 0)
  const overdueTotal = overdue.reduce((s, p) => s + paymentTotal(p), 0)

  const filtered = payments.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return tenantName(p.tenantId).toLowerCase().includes(q) || unitOf(p.tenantId).toLowerCase().includes(q)
  })

  const statCards = [
    { label: 'Collected', value: `$${collectedTotal.toLocaleString()}`, sub: `${collected.length} payments received`, icon: ArrowDown, color: 'text-success', bg: 'bg-success/10', ring: 'ring-1 ring-success/10' },
    { label: 'Outstanding', value: `$${outstanding.toLocaleString()}`, sub: `${pending.length + partial.length} pending / partial`, icon: CurrencyDollar, color: 'text-primary', bg: 'bg-primary/10', ring: 'ring-1 ring-primary/10' },
    { label: 'Overdue', value: `$${overdueTotal.toLocaleString()}`, sub: `${overdue.length} payments past due`, icon: Warning, color: 'text-danger', bg: 'bg-danger/10', ring: 'ring-1 ring-danger/10' },
    { label: 'Rent Lines', value: String(rentPayments.length), sub: `${leases.length} active leases`, icon: ArrowUp, color: 'text-foreground/75', bg: 'bg-muted/60', ring: '' },
  ]

  function handleAdd(data: PaymentFormData) {
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        leaseId: data.leaseId, tenantId: data.tenantId,
        propertyId: leases.find(l => l.id === data.leaseId)?.propertyId ?? '',
        periodStart: data.periodStart, periodEnd: data.periodEnd,
        amount: Number(data.amount), lateFee: Number(data.lateFee), lateFeeWaived: data.lateFeeWaived,
        type: data.type, method: data.method, status: data.status, paidAt: data.paidAt, note: data.note,
      },
    })
    setAddOpen(false)
  }

  function handleEdit(data: PaymentFormData) {
    if (!editTarget) return
    dispatch({
      type: 'UPDATE_PAYMENT',
      payload: {
        id: editTarget.id,
        leaseId: data.leaseId, tenantId: data.tenantId,
        propertyId: leases.find(l => l.id === data.leaseId)?.propertyId ?? '',
        periodStart: data.periodStart, periodEnd: data.periodEnd,
        amount: Number(data.amount), lateFee: Number(data.lateFee), lateFeeWaived: data.lateFeeWaived,
        type: data.type, method: data.method, status: data.status, paidAt: data.paidAt, note: data.note,
      },
    })
    setEditTarget(null)
  }

  function waiveFee(p: Payment) {
    dispatch({ type: 'UPDATE_PAYMENT', payload: { id: p.id, lateFeeWaived: !p.lateFeeWaived } })
  }

  /** One-click status transition. Marking paid also stamps paidAt so the
   *  record reads correctly without opening the full edit modal. */
  function setStatus(p: Payment, status: PaymentStatus) {
    const payload: { id: string; status: PaymentStatus; paidAt?: string } = { id: p.id, status }
    if (status === 'paid' && !p.paidAt) payload.paidAt = new Date().toISOString().slice(0, 10)
    dispatch({ type: 'UPDATE_PAYMENT', payload })
  }

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Payments</h1>
              <p className="mt-1 text-xs text-muted-foreground/70">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · Rent cycle</p>
            </div>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
              <Plus weight="bold" className="h-3.5 w-3.5" />
              Record Payment
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {statCards.map(s => (
              <div key={s.label} className={`rounded-2xl border border-border bg-card/40 p-5 ${s.ring}`}>
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-[11px] font-medium text-muted-foreground/70">{s.label}</p>
                  <div className={`rounded-lg p-1.5 ${s.bg}`}><s.icon weight="duotone" className={`h-3.5 w-3.5 ${s.color}`} /></div>
                </div>
                <p className={`text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/50">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm font-medium text-foreground/90">Transactions</p>
              <div className="relative">
                <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  className="h-7 w-44 rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                    <div className="rounded-2xl bg-muted/40 p-3"><Receipt weight="duotone" className="h-6 w-6 text-muted-foreground/50" /></div>
                    <p className="mt-3 text-sm font-medium text-foreground/80">No payments yet</p>
                    <p className="mt-1 max-w-xs text-[11px] text-muted-foreground/60">Record rent, fees, or deposits to start tracking your rent cycle.</p>
                    <button onClick={() => setAddOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
                      <Plus weight="bold" className="h-3.5 w-3.5" /> Record Payment
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                    <MagnifyingGlass weight="duotone" className="h-6 w-6 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No matching transactions</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/50">Try a different tenant or unit.</p>
                  </div>
                )
              ) : (
                filtered.map(tx => {
                  const total = paymentTotal(tx)
                  const tone = toneFor(tx.status)
                  return (
                    <div key={tx.id} className="group flex flex-wrap items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'success' ? 'bg-success' : tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground/90">{tenantName(tx.tenantId)}</p>
                          <p className="text-[10px] text-muted-foreground/70">{propName(tx.propertyId)} · {unitOf(tx.tenantId)}</p>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col">
                        <p className="text-[11px] text-muted-foreground">{formatDate(tx.periodStart)} → {formatDate(tx.periodEnd)}</p>
                        <p className={`text-[10px] capitalize ${typeMeta[tx.type]}`}>
                          {tx.type}{tx.lateFee > 0 && !tx.lateFeeWaived ? ` · +$${tx.lateFee} late` : ''}
                          {tx.lateFee > 0 && tx.lateFeeWaived ? ' · late fee waived' : ''}
                        </p>
                      </div>

                      <div className="hidden md:flex w-14 items-center justify-center text-[11px] text-muted-foreground/70">
                        {tx.status === 'paid' ? methodLabel[tx.method] : '—'}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-semibold ${tx.status === 'paid' ? 'text-success' : tx.status === 'overdue' ? 'text-danger' : 'text-foreground/75'}`}>
                            ${total.toLocaleString()}
                          </span>
                          {tx.amount < (leases.find(l => l.id === tx.leaseId)?.rent ?? Infinity) && tx.type === 'rent' && (
                            <span className="text-[9px] text-warning">partial</span>
                          )}
                        </div>
                        <StatusBadge status={tx.status} label={tx.status === 'partial' ? 'Partial' : undefined} />
                        <RowActions>
                          <RowActionsTrigger asChild>
                            <button title="Actions"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
                              <DotsThree weight="bold" className="h-4 w-4" />
                            </button>
                          </RowActionsTrigger>
                          <RowActionsContent>
                            <RowActionsLabel>Quick actions</RowActionsLabel>
                            {tx.status !== 'paid' && (
                              <RowActionItem icon={<CheckCircle weight="duotone" className="h-3.5 w-3.5" />} tone="success"
                                onSelect={() => setStatus(tx, 'paid')}>
                                Mark as paid
                              </RowActionItem>
                            )}
                            {tx.status === 'paid' && (
                              <RowActionItem icon={<ArrowCounterClockwise weight="duotone" className="h-3.5 w-3.5" />}
                                onSelect={() => setStatus(tx, 'pending')}>
                                Reopen as pending
                              </RowActionItem>
                            )}
                            {tx.status !== 'partial' && (
                              <RowActionItem icon={<ClockCountdown weight="duotone" className="h-3.5 w-3.5" />}
                                onSelect={() => setStatus(tx, 'partial')}>
                                Mark as partial
                              </RowActionItem>
                            )}
                            {tx.status !== 'overdue' && (
                              <RowActionItem icon={<Warning weight="duotone" className="h-3.5 w-3.5" />} tone="danger"
                                onSelect={() => setStatus(tx, 'overdue')}>
                                Mark overdue
                              </RowActionItem>
                            )}
                            {tx.lateFee > 0 && (
                              <>
                                <RowActionsSeparator />
                                <RowActionItem icon={<Prohibit weight="duotone" className="h-3.5 w-3.5" />} tone={tx.lateFeeWaived ? 'default' : 'primary'}
                                  onSelect={() => waiveFee(tx)}>
                                  {tx.lateFeeWaived ? `Un-waive $${tx.lateFee} fee` : `Waive $${tx.lateFee} late fee`}
                                </RowActionItem>
                              </>
                            )}
                            <RowActionsSeparator />
                            <RowActionItem icon={<PencilSimple weight="duotone" className="h-3.5 w-3.5" />}
                              onSelect={() => setEditTarget({ id: tx.id, data: {
                                leaseId: tx.leaseId, tenantId: tx.tenantId, periodStart: tx.periodStart, periodEnd: tx.periodEnd,
                                amount: String(tx.amount), lateFee: String(tx.lateFee), lateFeeWaived: tx.lateFeeWaived,
                                type: tx.type, method: tx.method, status: tx.status, paidAt: tx.paidAt, note: tx.note,
                              } })}>
                              Edit details
                            </RowActionItem>
                            <RowActionItem icon={<TrashSimple weight="duotone" className="h-3.5 w-3.5" />} tone="danger"
                              onSelect={() => setDeleteTarget(tx)}>
                              Delete payment
                            </RowActionItem>
                          </RowActionsContent>
                        </RowActions>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {payments.length === 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border bg-card/20 px-4 py-3 text-xs text-muted-foreground/60">
              <Receipt className="h-4 w-4" /> No payments recorded yet. Use “Record Payment” to log rent, fees, or deposits.
            </div>
          )}        </div>

        <PaymentFormModal open={addOpen} onSave={handleAdd} onClose={() => setAddOpen(false)} />
        <PaymentFormModal open={!!editTarget} initial={editTarget?.data} onSave={handleEdit} onClose={() => setEditTarget(null)} />
        <DeleteConfirm open={!!deleteTarget}
          label={deleteTarget ? `${tenantName(deleteTarget.tenantId)} · ${formatDate(deleteTarget.periodStart)}` : ''}
          onConfirm={() => { if (deleteTarget) dispatch({ type: 'DELETE_PAYMENT', payload: { id: deleteTarget.id } }); setDeleteTarget(null) }}
          onClose={() => setDeleteTarget(null)} />
      </>
    </AppShell>
  )
}
