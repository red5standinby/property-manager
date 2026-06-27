'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import type { Tenant, TenantStatus } from '@/src/lib/types'
import { Plus, MagnifyingGlass, Envelope, Phone, MapPin, PencilSimple, TrashSimple, X } from '@phosphor-icons/react'

const statusStyles: Record<string, { badge: string; dot: string }> = {
  current:  { badge: 'bg-success/10 text-success border border-success/20',   dot: 'bg-success'  },
  expiring: { badge: 'bg-warning/10 text-warning border border-warning/20',   dot: 'bg-warning'  },
  late:     { badge: 'bg-danger/10 text-danger border border-danger/20',       dot: 'bg-danger'   },
}

const statusOptions: TenantStatus[] = ['current', 'expiring', 'late']

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const avatarColors = [
  'from-blue-600 to-blue-800', 'from-violet-600 to-violet-800',
  'from-emerald-600 to-emerald-800', 'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-700', 'from-cyan-600 to-cyan-800',
  'from-pink-600 to-pink-800', 'from-indigo-600 to-indigo-800',
]

// ─── Tenant Form Modal ────────────────────────────────────────────

type TenantFormData = {
  name: string
  email: string
  phone: string
  propertyId: string
  unit: string
  leaseStart: string
  leaseEnd: string
  rent: string
  status: TenantStatus
}

const emptyForm = (): TenantFormData => ({
  name: '', email: '', phone: '', propertyId: '', unit: '',
  leaseStart: '', leaseEnd: '', rent: '0', status: 'current',
})

function TenantFormModal({
  open, initial, properties, onSave, onClose,
}: {
  open: boolean
  initial?: TenantFormData
  properties: { id: string; name: string }[]
  onSave: (data: TenantFormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<TenantFormData>(initial ?? emptyForm())
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {initial ? 'Edit Tenant' : 'Add Tenant'}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Property</label>
              <select
                value={data.propertyId}
                onChange={e => setData(d => ({ ...d, propertyId: e.target.value }))}
                className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Select a property</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Name</label>
                <input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Full name" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Unit</label>
                <input value={data.unit} onChange={e => setData(d => ({ ...d, unit: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="e.g. 3A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Email</label>
                <input value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="email@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Phone</label>
                <input value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="(512) 555-0000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Lease Start</label>
                <input type="date" value={data.leaseStart} onChange={e => setData(d => ({ ...d, leaseStart: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Lease End</label>
                <input type="date" value={data.leaseEnd} onChange={e => setData(d => ({ ...d, leaseEnd: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Monthly Rent ($)</label>
                <input type="number" min={0} value={data.rent} onChange={e => setData(d => ({ ...d, rent: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Status</label>
                <div className="flex gap-1.5 pt-0.5">
                  {statusOptions.map(s => (
                    <button key={s} onClick={() => setData(d => ({ ...d, status: s }))}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize transition-colors ${
                        data.status === s ? (statusStyles[s]?.badge ?? 'bg-primary/10 text-primary border border-primary/20')
                          : 'border border-border text-muted-foreground/70 hover:text-foreground'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => {
              const unit = data.unit
              onSave({ ...data, unit })
            }} disabled={!data.name || !data.propertyId || !data.leaseStart || !data.leaseEnd || Number(data.rent) < 1}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
              {initial ? 'Save Changes' : 'Add Tenant'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────

function DeleteConfirm({ open, name, onConfirm, onClose }: {
  open: boolean; name: string; onConfirm: () => void; onClose: () => void
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <p className="text-sm font-semibold text-foreground">Remove {name}?</p>
          <p className="mt-2 text-xs text-muted-foreground/70">This tenant will be permanently removed.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={onConfirm} className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white">Remove</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

const allFilters = ['All', 'Current', 'Expiring', 'Late']

export default function TenantsPage() {
  const { state, dispatch } = useApp()
  const { tenants, properties } = state

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; data: TenantFormData } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)

  const filtered = tenants.filter(t => {
    if (filter !== 'All' && t.status !== filter.toLowerCase()) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.unit.toLowerCase().includes(q)) return false
    }
    return true
  })

  const lateCount = tenants.filter(t => t.status === 'late').length
  const expiringCount = tenants.filter(t => t.status === 'expiring').length

  function getPropertyName(propertyId: string) {
    return properties.find(p => p.id === propertyId)?.name ?? 'Unknown'
  }

  function handleAdd(data: TenantFormData) {
    dispatch({
      type: 'ADD_TENANT',
      payload: {
        name: data.name, email: data.email, phone: data.phone,
        propertyId: data.propertyId, unit: data.unit,
        leaseStart: data.leaseStart, leaseEnd: data.leaseEnd,
        rent: Number(data.rent), status: data.status,
      },
    })
    setAddOpen(false)
  }

  function handleEdit(data: TenantFormData) {
    if (!editTarget) return
    dispatch({
      type: 'UPDATE_TENANT',
      payload: {
        id: editTarget.id,
        name: data.name, email: data.email, phone: data.phone,
        propertyId: data.propertyId, unit: data.unit,
        leaseStart: data.leaseStart, leaseEnd: data.leaseEnd,
        rent: Number(data.rent), status: data.status,
      },
    })
    setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    dispatch({ type: 'DELETE_TENANT', payload: { id: deleteTarget.id } })
    setDeleteTarget(null)
  }

  const propertyOptions = properties.map(p => ({ id: p.id, name: p.name }))

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Tenants</h1>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {tenants.length} tenants · {lateCount > 0 && `${lateCount} late payment${lateCount > 1 ? 's' : ''}`}{lateCount > 0 && expiringCount > 0 && ' · '}{expiringCount > 0 && `${expiringCount} lease${expiringCount > 1 ? 's' : ''} expiring soon`}
              </p>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90"
            >
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
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            {allFilters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
            <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3 sm:grid">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Tenant</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Property / Unit</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Contact</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 md:block">Lease</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Status</span>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((t, i) => {
                const s = statusStyles[t.status]
                return (
                  <div key={t.id} className="group grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center sm:gap-4 sm:py-3.5 transition-colors hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-[11px] font-bold text-white`}>
                        {initials(t.name)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground/90">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground/70">Since {t.since}</p>
                      </div>
                    </div>

                    <div className="min-w-0 sm:mt-0">
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="text-[11px] font-medium text-foreground/60">{getPropertyName(t.propertyId)}</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span className="truncate">{t.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <Envelope className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-32">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{t.phone}</span>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-xs font-semibold text-foreground/75">${t.rent.toLocaleString()}/mo</p>
                      <p className="text-[10px] text-muted-foreground/70">{t.leaseLabel}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {t.status}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => setEditTarget({ id: t.id, data: { name: t.name, email: t.email, phone: t.phone, propertyId: t.propertyId, unit: t.unit, leaseStart: t.leaseStart, leaseEnd: t.leaseEnd, rent: String(t.rent), status: t.status } })}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                          <PencilSimple className="h-3 w-3" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger" title="Remove">
                          <TrashSimple className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <TenantFormModal open={addOpen} initial={undefined} properties={propertyOptions} onSave={handleAdd} onClose={() => setAddOpen(false)} />
        <TenantFormModal open={!!editTarget} initial={editTarget?.data} properties={propertyOptions} onSave={handleEdit} onClose={() => setEditTarget(null)} />
        <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name ?? ''} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      </>
    </AppShell>
  )
}
