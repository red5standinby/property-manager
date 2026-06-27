'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import type { Tenant } from '@/src/lib/types'
import {
  Buildings, ArrowLeft, Users, CurrencyDollar, MapPin,
  Envelope, Phone, PencilSimple, TrashSimple, X, Plus,
} from '@phosphor-icons/react'

const statusStyles: Record<string, string> = {
  current:  'bg-success/10 text-success border border-success/20',
  expiring: 'bg-warning/10 text-warning border border-warning/20',
  late:     'bg-danger/10 text-danger border border-danger/20',
}

const statusOptionsTenant: TenantStatus[] = ['current', 'expiring', 'late']
type TenantStatus = 'current' | 'expiring' | 'late'

const propertyTypeStyles: Record<string, string> = {
  active:     'bg-success/10 text-success border border-success/20',
  renovation: 'bg-warning/10 text-warning border border-warning/20',
  pending:    'bg-muted/60 text-muted-foreground border border-border',
}

// ─── Tenant Form Modal ────────────────────────────────────────────

type TenantFormData = {
  name: string
  email: string
  phone: string
  unit: string
  leaseStart: string
  leaseEnd: string
  rent: string
  status: TenantStatus
}

const emptyTenantForm = (): TenantFormData => ({
  name: '', email: '', phone: '', unit: '',
  leaseStart: '', leaseEnd: '', rent: '0', status: 'current',
})

function TenantFormModal({
  open, initial, onSave, onClose, propertyName,
}: {
  open: boolean
  initial?: TenantFormData
  onSave: (data: TenantFormData) => void
  onClose: () => void
  propertyName: string
}) {
  const [data, setData] = useState<TenantFormData>(initial ?? emptyTenantForm())
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {initial ? 'Edit Tenant' : `Add Tenant to ${propertyName}`}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
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
                  {statusOptionsTenant.map(s => (
                    <button key={s} onClick={() => setData(d => ({ ...d, status: s }))}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize transition-colors ${
                        data.status === s ? statusStyles[s] || 'bg-primary/10 text-primary border border-primary/20'
                          : 'border border-border text-muted-foreground/70 hover:text-foreground'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => onSave(data)} disabled={!data.name || !data.unit || !data.leaseStart || !data.leaseEnd || Number(data.rent) < 1}
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
          <p className="mt-2 text-xs text-muted-foreground/70">This tenant will be permanently removed from this property.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={onConfirm} className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white shadow-brand-glow-sm">Remove</button>
          </div>
        </div>
      </div>
    </>
  )
}

const avatarColors = [
  'from-blue-600 to-blue-800', 'from-violet-600 to-violet-800',
  'from-emerald-600 to-emerald-800', 'from-rose-600 to-rose-800',
  'from-amber-600 to-amber-700', 'from-cyan-600 to-cyan-800',
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function PropertyDetailClient() {
  const params = useParams()
  const { state, dispatch } = useApp()
  const property = state.properties.find(p => p.id === params.id)
  const propertyTenants = state.tenants.filter(t => t.propertyId === params.id)

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; data: TenantFormData } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)

  if (!property) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Buildings className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Property not found</p>
          <Link href="/properties" className="mt-3 text-xs font-medium text-primary hover:text-primary/80">Back to properties</Link>
        </div>
      </AppShell>
    )
  }

  const occupancyPct = property.units > 0 ? Math.round((property.occupied / property.units) * 100) : 0

  function handleAddTenant(data: TenantFormData) {
    if (!property) return
    const unit = data.unit.includes(property.name.slice(0, 4))
      ? data.unit
      : `${property.name.split(' ')[0]} ${data.unit}`
    const payload: import('@/src/lib/types').AddTenantPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      propertyId: property.id,
      unit,
      leaseStart: data.leaseStart,
      leaseEnd: data.leaseEnd,
      rent: Number(data.rent),
      status: data.status,
    }
    dispatch({ type: 'ADD_TENANT', payload })
    setAddOpen(false)
  }

  function handleEditTenant(data: TenantFormData) {
    if (!editTarget) return
    const payload: import('@/src/lib/types').UpdateTenantPayload = {
      id: editTarget.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      unit: data.unit,
      leaseStart: data.leaseStart,
      leaseEnd: data.leaseEnd,
      rent: Number(data.rent),
      status: data.status,
    }
    dispatch({ type: 'UPDATE_TENANT', payload })
    setEditTarget(null)
  }

  function handleDeleteTenant() {
    if (!deleteTarget) return
    dispatch({ type: 'DELETE_TENANT', payload: { id: deleteTarget.id } })
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          {/* Back + Header */}
          <div className="mb-6">
            <Link href="/properties" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="h-3.5 w-3.5" />
              Properties
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">{property.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.address}
                  <span className={`ml-1 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${propertyTypeStyles[property.status]}`}>
                    {property.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm"
              >
                <Plus weight="bold" className="h-3.5 w-3.5" />
                Add Tenant
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Units',     value: String(property.units),    icon: Buildings,      color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Occupied',  value: String(property.occupied), icon: Users,          color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Vacancy',   value: `${100 - occupancyPct}%`,  icon: Buildings,      color: occupancyPct >= 90 ? 'text-success' : 'text-warning', bg: 'bg-muted/60' },
              { label: 'Revenue',   value: property.revenue,           icon: CurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/40 p-4">
                <div className={`mb-2 inline-flex rounded-lg p-1.5 ${s.bg}`}>
                  <s.icon weight="duotone" className={`h-4 w-4 ${s.color}`} />
                </div>
                <p className={`text-lg font-semibold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground/70">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Occupancy bar */}
          <div className="mb-6 rounded-2xl border border-border bg-card/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/75">Occupancy</span>
              <span className="text-xs font-semibold text-foreground/75">{occupancyPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${occupancyPct >= 90 ? 'bg-success' : occupancyPct >= 70 ? 'bg-primary' : 'bg-warning'}`}
                style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>

          {/* Tenants list */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Tenants {propertyTenants.length > 0 && <span className="font-normal text-muted-foreground/70">· {propertyTenants.length}</span>}
            </h2>

            {propertyTenants.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">No tenants yet</p>
                <p className="mt-1 text-xs text-muted-foreground/50">Add your first tenant to this property.</p>
                <button onClick={() => setAddOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground">
                  <Plus weight="bold" className="h-3.5 w-3.5" />
                  Add Tenant
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {propertyTenants.map((t, i) => (
                  <div key={t.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-card/40 px-4 py-3.5 transition-colors hover:bg-muted/20">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-[11px] font-bold text-white`}>
                      {initials(t.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground/90">{t.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/70">
                        <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{t.unit}</span>
                        <span className="flex items-center gap-1"><Envelope className="h-2.5 w-2.5" />{t.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{t.phone}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-xs font-semibold text-foreground/75">${t.rent.toLocaleString()}/mo</p>
                      <p className="text-[10px] text-muted-foreground/70">{t.leaseLabel}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyles[t.status]}`}>
                      {t.status}
                    </span>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => setEditTarget({ id: t.id, data: { name: t.name, email: t.email, phone: t.phone, unit: t.unit, leaseStart: t.leaseStart, leaseEnd: t.leaseEnd, rent: String(t.rent), status: t.status } })}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                        <PencilSimple className="h-3 w-3" />
                      </button>
                      <button onClick={() => setDeleteTarget(t)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger" title="Remove">
                        <TrashSimple className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <TenantFormModal open={addOpen} onSave={handleAddTenant} onClose={() => setAddOpen(false)} propertyName={property.name} />
        <TenantFormModal open={!!editTarget} initial={editTarget?.data} onSave={handleEditTenant} onClose={() => setEditTarget(null)} propertyName={property.name} />
        <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name ?? ''} onConfirm={handleDeleteTenant} onClose={() => setDeleteTarget(null)} />
      </>
    </AppShell>
  )
}
