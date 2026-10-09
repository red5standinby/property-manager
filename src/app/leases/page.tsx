'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { StatusBadge } from '@/src/components/status-badge'
import {
  RowActions, RowActionsTrigger, RowActionsContent, RowActionItem,
  RowActionsSeparator, RowActionsLabel,
} from '@/src/components/row-actions'
import type { Lease, LeaseTerm, LeaseStatus } from '@/src/lib/types'
import { leasesWithMeta, formatDate, LEASE_EXPIRING_DAYS } from '@/src/lib/derived'
import { Plus, MagnifyingGlass, FileText, CheckCircle, Clock, PencilSimple, TrashSimple, X, ArrowCounterClockwise, DotsThree } from '@phosphor-icons/react'

const colorMap: Record<string, string> = {
  active: 'text-success', expiring: 'text-warning', review: 'text-primary', ended: 'text-muted-foreground',
}
const bgMap: Record<string, string> = {
  active: 'bg-success/10', expiring: 'bg-warning/10', review: 'bg-primary/10', ended: 'bg-muted/60',
}

const termOptions: LeaseTerm[] = ['month-to-month', '3-month', '6-month', '12-month', '24-month']
const statusOptions: LeaseStatus[] = ['active', 'expiring', 'review', 'ended']

// ─── Lease Form Modal ─────────────────────────────────────────────

type LeaseFormData = {
  propertyId: string
  unit: string
  tenantIds: string[]
  startDate: string
  endDate: string
  rent: string
  term: LeaseTerm
  status: LeaseStatus
}

function LeaseFormModal({
  open, initial, onSave, onClose,
}: {
  open: boolean
  initial?: LeaseFormData
  onSave: (data: LeaseFormData) => void
  onClose: () => void
}) {
  const { state } = useApp()
  const { properties, tenants } = state
  const [data, setData] = useState<LeaseFormData>(initial ?? {
    propertyId: '', unit: '', tenantIds: [], startDate: '', endDate: '', rent: '0', term: '12-month', status: 'active',
  })
  // Re-seed on open / when targeting a different record (avoids stale form).
  useEffect(() => { if (open) setData(initial ?? {
    propertyId: '', unit: '', tenantIds: [], startDate: '', endDate: '', rent: '0', term: '12-month', status: 'active',
  }) }, [open, initial])
  if (!open) return null

  const scopedTenants = tenants.filter(t => !data.propertyId || t.propertyId === data.propertyId)

  function toggleTenant(id: string) {
    setData(d => ({ ...d, tenantIds: d.tenantIds.includes(id) ? d.tenantIds.filter(x => x !== id) : [...d.tenantIds, id] }))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{initial ? 'Edit Lease' : 'New Lease'}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Property</label>
                <select value={data.propertyId} onChange={e => setData(d => ({ ...d, propertyId: e.target.value, tenantIds: [] }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  <option value="">Select property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Unit</label>
                <input value={data.unit} onChange={e => setData(d => ({ ...d, unit: e.target.value }))} placeholder="e.g. 3A"
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Co-tenants on this lease ({data.tenantIds.length})</label>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
                {scopedTenants.length === 0 ? (
                  <p className="px-1 py-1.5 text-[11px] text-muted-foreground/50">Select a property to list tenants</p>
                ) : scopedTenants.map(t => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted/40">
                    <input type="checkbox" checked={data.tenantIds.includes(t.id)} onChange={() => toggleTenant(t.id)} className="h-3.5 w-3.5 accent-[var(--primary)]" />
                    <span className="text-[11px] text-foreground/85">{t.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/50">{t.unit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Start</label>
                <input type="date" value={data.startDate} onChange={e => setData(d => ({ ...d, startDate: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">End</label>
                <input type="date" value={data.endDate} onChange={e => setData(d => ({ ...d, endDate: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Rent ($/mo)</label>
                <input type="number" min={0} value={data.rent} onChange={e => setData(d => ({ ...d, rent: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Term</label>
                <select value={data.term} onChange={e => setData(d => ({ ...d, term: e.target.value as LeaseTerm }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {termOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Status</label>
                <select value={data.status} onChange={e => setData(d => ({ ...d, status: e.target.value as LeaseStatus }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs capitalize text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => onSave(data)} disabled={!data.propertyId || !data.unit || data.tenantIds.length === 0 || !data.startDate || !data.endDate || Number(data.rent) < 1}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
              {initial ? 'Save Changes' : 'Create Lease'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function DeleteConfirm({ open, label, onConfirm, onClose }: {
  open: boolean; label: string; onConfirm: () => void; onClose: () => void
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <p className="text-sm font-semibold text-foreground">Delete lease?</p>
          <p className="mt-2 text-xs text-muted-foreground/70">{label} and its linked payments will be removed.</p>
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

export default function LeasesPage() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; data: LeaseFormData } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lease | null>(null)

  const views = leasesWithMeta(state)
  const propName = (id: string) => state.properties.find(p => p.id === id)?.name ?? '—'

  const activeLeases = views.filter(l => l.displayStatus === 'active')
  const expiringLeases = views.filter(l => l.displayStatus === 'expiring')
  const reviewLeases = views.filter(l => l.displayStatus === 'review')
  const expiringSoon = views.filter(l => l.displayStatus === 'expiring' && l.daysLeft <= LEASE_EXPIRING_DAYS)

  const filtered = views.filter(l => {
    if (filter !== 'All' && l.displayStatus !== filter.toLowerCase()) return false
    if (search) {
      const q = search.toLowerCase()
      if (!l.tenantLabel.toLowerCase().includes(q) && !l.unit.toLowerCase().includes(q) && !propName(l.propertyId).toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleAdd(data: LeaseFormData) {
    dispatch({ type: 'ADD_LEASE', payload: {
      propertyId: data.propertyId, unit: data.unit, tenantIds: data.tenantIds,
      startDate: data.startDate, endDate: data.endDate, rent: Number(data.rent), term: data.term, status: data.status,
    } })
    setAddOpen(false)
  }

  function handleEdit(data: LeaseFormData) {
    if (!editTarget) return
    dispatch({ type: 'UPDATE_LEASE', payload: {
      id: editTarget.id, propertyId: data.propertyId, unit: data.unit, tenantIds: data.tenantIds,
      startDate: data.startDate, endDate: data.endDate, rent: Number(data.rent), term: data.term, status: data.status,
    } })
    setEditTarget(null)
  }

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Leases</h1>
              <p className="mt-1 text-xs text-muted-foreground/70">{views.length} total · {expiringSoon.length} expiring within {LEASE_EXPIRING_DAYS} days</p>
            </div>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
              <Plus weight="bold" className="h-3.5 w-3.5" />
              New Lease
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Active Leases',  value: String(activeLeases.length),  color: colorMap.active,  bg: bgMap.active  },
              { label: `Expiring (${LEASE_EXPIRING_DAYS}d)`, value: String(expiringSoon.length), color: colorMap.expiring, bg: bgMap.expiring },
              { label: 'Up for Renewal', value: String(reviewLeases.length),  color: colorMap.review,  bg: bgMap.review  },
              { label: 'Total Leases',   value: String(views.length),         color: 'text-foreground/90', bg: 'bg-muted/60' },
            ].map(c => (
              <div key={c.label} className="rounded-2xl border border-border bg-card/40 p-4">
                <div className={`mb-2 inline-flex rounded-lg p-1.5 ${c.bg}`}><FileText weight="duotone" className={`h-4 w-4 ${c.color}`} /></div>
                <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52 max-w-xs">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leases..."
                className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            {['All', 'Active', 'Expiring', 'Review'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-16">
                <FileText className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">No leases found</p>
              </div>
            ) : (
              filtered.map(lease => {
                const urgency = lease.daysLeft <= 30 ? 'border-danger/20' : lease.daysLeft <= LEASE_EXPIRING_DAYS ? 'border-warning/20' : 'border-border'
                const ended = lease.displayStatus === 'ended'
                const flagged = lease.displayStatus === 'review'
                return (
                  <div key={lease.id} className={`group flex flex-wrap items-center gap-4 rounded-2xl border ${urgency} bg-card/40 px-5 py-4 transition-colors hover:bg-muted/20`}>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <FileText weight="duotone" className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground/90">{lease.tenantLabel}</p>
                        <p className="text-[11px] text-muted-foreground/70">{propName(lease.propertyId)} · {lease.unit} · {lease.term}</p>
                      </div>
                    </div>

                    <div className="hidden flex-col sm:flex">
                      <p className="text-[11px] text-muted-foreground">{formatDate(lease.startDate)} → {formatDate(lease.endDate)}</p>
                      <p className="text-[11px] font-semibold text-foreground/75">${lease.rent.toLocaleString()}/mo</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!ended && lease.daysLeft <= LEASE_EXPIRING_DAYS && (
                        <span className={`text-[11px] font-medium ${lease.daysLeft <= 30 ? 'text-danger' : 'text-warning'}`}>{lease.daysLeft}d left</span>
                      )}
                      <StatusBadge status={lease.displayStatus} />
                      <RowActions>
                        <RowActionsTrigger asChild>
                          <button title="Actions"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
                            <DotsThree weight="bold" className="h-4 w-4" />
                          </button>
                        </RowActionsTrigger>
                        <RowActionsContent>
                          <RowActionsLabel>Quick actions</RowActionsLabel>
                          {!flagged && lease.status !== 'ended' && (
                            <RowActionItem icon={<ArrowCounterClockwise weight="duotone" className="h-3.5 w-3.5" />} tone="primary"
                              onSelect={() => dispatch({ type: 'UPDATE_LEASE', payload: { id: lease.id, status: 'review' } })}>
                              Flag for renewal
                            </RowActionItem>
                          )}
                          {lease.status !== 'active' && (
                            <RowActionItem icon={<CheckCircle weight="duotone" className="h-3.5 w-3.5" />} tone="success"
                              onSelect={() => dispatch({ type: 'UPDATE_LEASE', payload: { id: lease.id, status: 'active' } })}>
                              Mark active
                            </RowActionItem>
                          )}
                          {lease.status !== 'ended' && (
                            <RowActionItem icon={<Clock weight="duotone" className="h-3.5 w-3.5" />}
                              onSelect={() => dispatch({ type: 'UPDATE_LEASE', payload: { id: lease.id, status: 'ended' } })}>
                              End lease
                            </RowActionItem>
                          )}
                          <RowActionsSeparator />
                          <RowActionItem icon={<PencilSimple weight="duotone" className="h-3.5 w-3.5" />}
                            onSelect={() => setEditTarget({ id: lease.id, data: {
                              propertyId: lease.propertyId, unit: lease.unit, tenantIds: [...lease.tenantIds],
                              startDate: lease.startDate, endDate: lease.endDate, rent: String(lease.rent), term: lease.term, status: lease.status,
                            } })}>
                            Edit details
                          </RowActionItem>
                          <RowActionItem icon={<TrashSimple weight="duotone" className="h-3.5 w-3.5" />} tone="danger"
                            onSelect={() => setDeleteTarget(lease)}>
                            Delete lease
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

        <LeaseFormModal open={addOpen} onSave={handleAdd} onClose={() => setAddOpen(false)} />
        <LeaseFormModal open={!!editTarget} initial={editTarget?.data} onSave={handleEdit} onClose={() => setEditTarget(null)} />
        <DeleteConfirm open={!!deleteTarget} label={deleteTarget ? `${deleteTarget.unit} lease` : ''}
          onConfirm={() => { if (deleteTarget) dispatch({ type: 'DELETE_LEASE', payload: { id: deleteTarget.id } }); setDeleteTarget(null) }}
          onClose={() => setDeleteTarget(null)} />
      </>
    </AppShell>
  )
}
