'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import type { Property, PropertyStatus } from '@/src/lib/types'
import { Buildings, Plus, MagnifyingGlass, SlidersHorizontal, MapPin, Users, PencilSimple, TrashSimple, X } from '@phosphor-icons/react'

const statusStyles: Record<string, string> = {
  active:     'bg-success/10 text-success border border-success/20',
  renovation: 'bg-warning/10 text-warning border border-warning/20',
  pending:    'bg-muted/60 text-muted-foreground border border-border',
}

const statusOptions: PropertyStatus[] = ['active', 'renovation', 'pending']

// ─── Property Form Modal ─────────────────────────────────────────

type FormData = {
  name: string
  address: string
  units: string
  type: string
  status: PropertyStatus
}

const emptyForm: FormData = {
  name: '', address: '', units: '0', type: 'Multi-family', status: 'active',
}

function PropertyFormModal({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean
  initial?: FormData
  onSave: (data: FormData) => void
  onClose: () => void
}) {
  const [data, setData] = useState<FormData>(initial ?? emptyForm)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {initial ? 'Edit Property' : 'Add Property'}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground/70">Property Name</label>
              <input
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="e.g. Willow Creek"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground/70">Address</label>
              <input
                value={data.address}
                onChange={e => setData(d => ({ ...d, address: e.target.value }))}
                className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="e.g. 123 Main St, Austin TX 78701"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground/70">Units</label>
                <input
                  type="number" min={1}
                  value={data.units}
                  onChange={e => setData(d => ({ ...d, units: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground/70">Type</label>
                <select
                  value={data.type}
                  onChange={e => setData(d => ({ ...d, type: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option>Multi-family</option>
                  <option>Condo</option>
                  <option>Townhome</option>
                  <option>Single-family</option>
                  <option>Commercial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground/70">Status</label>
              <div className="flex gap-2">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => setData(d => ({ ...d, status: s }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      data.status === s
                        ? statusStyles[s]
                        : 'border border-border text-muted-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(data)}
              disabled={!data.name || !data.address || Number(data.units) < 1}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {initial ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Delete Confirmation ──────────────────────────────────────────

function DeleteConfirm({ open, name, onConfirm, onClose }: {
  open: boolean
  name: string
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <p className="text-sm font-semibold text-foreground">Delete {name}?</p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            This will permanently remove this property and all its data. This action cannot be undone.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={onConfirm} className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white shadow-brand-glow-sm transition-all hover:bg-danger/90">Delete</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page Component ───────────────────────────────────────────────

export default function PropertiesPage() {
  const { state, dispatch } = useApp()
  const { properties } = state

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; data: FormData } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  const filters = ['All', 'Active', 'Renovation', 'Pending']

  const filtered = properties.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter.toLowerCase()) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.address.toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleAdd(data: FormData) {
    const payload: import('@/src/lib/types').AddPropertyPayload = {
      name: data.name,
      address: data.address,
      units: Number(data.units),
      type: data.type,
      status: data.status as PropertyStatus,
    }
    dispatch({ type: 'ADD_PROPERTY', payload })
    setModalOpen(false)
  }

  function handleEdit(data: FormData) {
    if (!editTarget) return
    const payload: import('@/src/lib/types').UpdatePropertyPayload = {
      id: editTarget.id,
      name: data.name,
      address: data.address,
      units: Number(data.units),
      type: data.type,
      status: data.status as PropertyStatus,
    }
    dispatch({ type: 'UPDATE_PROPERTY', payload })
    setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    dispatch({ type: 'DELETE_PROPERTY', payload: { id: deleteTarget.id } })
    setDeleteTarget(null)
  }

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Properties</h1>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {properties.length} properties · {properties.reduce((a, p) => a + p.units, 0)} total units
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 hover:shadow-brand-glow-md"
            >
              <Plus weight="bold" className="h-3.5 w-3.5" />
              Add Property
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52 max-w-xs">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                placeholder="Search properties..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const occupancyPct = p.units > 0 ? Math.round((p.occupied / p.units) * 100) : 0
              return (
                <Link
                  href={`/properties/${p.id}`}
                  key={p.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card/40 transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.5)]"
                >
                  {/* Actions */}
                  <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditTarget({ id: p.id, data: { name: p.name, address: p.address, units: String(p.units), type: p.type, status: p.status } })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-muted-foreground hover:bg-black/70 hover:text-foreground backdrop-blur-sm"
                      title="Edit"
                    >
                      <PencilSimple className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-muted-foreground hover:bg-danger/80 hover:text-white backdrop-blur-sm"
                      title="Delete"
                    >
                      <TrashSimple className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Image placeholder */}
                  <div className="h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-muted to-card">
                    <div className="flex h-full items-center justify-center">
                      <Buildings weight="duotone" className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-foreground">
                          {p.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{p.address}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyles[p.status]}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground/50">Units</p>
                        <p className="text-xs font-semibold text-foreground/90">{p.units}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/50">Occupied</p>
                        <p className="text-xs font-semibold text-foreground/90">{p.occupied}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground/50">Revenue</p>
                        <p className="text-xs font-semibold text-foreground/90">{p.revenue}</p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                          <Users className="h-3 w-3" />
                          Occupancy
                        </span>
                        <span className="text-[11px] font-semibold text-foreground/75">{occupancyPct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancyPct >= 90 ? 'bg-success' :
                            occupancyPct >= 70 ? 'bg-primary' :
                            occupancyPct >= 40 ? 'bg-warning' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Modals */}
        <PropertyFormModal
          open={modalOpen}
          onSave={handleAdd}
          onClose={() => setModalOpen(false)}
        />
        <PropertyFormModal
          open={!!editTarget}
          initial={editTarget?.data}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
        <DeleteConfirm
          open={!!deleteTarget}
          name={deleteTarget?.name ?? ''}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </>
    </AppShell>
  )
}
