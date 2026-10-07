'use client'

import { useState } from 'react'
import { AppShell } from '@/src/components/layout/app-shell'
import { useApp } from '@/src/store/context'
import { StatusBadge } from '@/src/components/status-badge'
import {
  RowActions, RowActionsTrigger, RowActionsContent, RowActionItem,
  RowActionsSeparator, RowActionsLabel,
} from '@/src/components/row-actions'
import type { MaintenanceRequest, ReqPriority, ReqStatus, MaintenanceStatusEntry } from '@/src/lib/types'
import { formatDate, maintenanceSpend } from '@/src/lib/derived'
import {
  Wrench, Plus, MagnifyingGlass, CheckCircle, Warning, Fire, Drop, Thermometer, Lightbulb,
  X, Clock, Receipt, ArrowRight, DotsThree,
} from '@phosphor-icons/react'

const priorityMeta: Record<string, { label: string }> = {
  urgent: { label: 'Urgent' },
  high:   { label: 'High' },
  medium: { label: 'Medium' },
  low:    { label: 'Low' },
}

const categoryIcons: Record<string, React.ElementType> = {
  HVAC: Thermometer, Plumbing: Drop, Electric: Lightbulb, Safety: Warning, General: Wrench,
}

const categories = ['HVAC', 'Plumbing', 'Electric', 'Safety', 'General']
const priorities: ReqPriority[] = ['urgent', 'high', 'medium', 'low']
const reqStatuses: ReqStatus[] = ['open', 'in-progress', 'resolved']

// ─── New Request Modal ────────────────────────────────────────────

type NewReqData = {
  title: string; description: string; propertyId: string; tenantId: string; priority: ReqPriority; category: string
}

function NewRequestModal({ open, onSave, onClose }: {
  open: boolean
  onSave: (d: NewReqData) => void
  onClose: () => void
}) {
  const { state } = useApp()
  const { properties, tenants } = state
  const [data, setData] = useState<NewReqData>({ title: '', description: '', propertyId: '', tenantId: '', priority: 'medium', category: 'General' })
  if (!open) return null

  const scopedTenants = tenants.filter(t => !data.propertyId || t.propertyId === data.propertyId)

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">New Request</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Title</label>
              <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Leaking bathroom sink"
                className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Description</label>
              <textarea value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} rows={3}
                className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Property</label>
                <select value={data.propertyId} onChange={e => setData(d => ({ ...d, propertyId: e.target.value, tenantId: '' }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  <option value="">Select property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Tenant</label>
                <select value={data.tenantId} onChange={e => setData(d => ({ ...d, tenantId: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  <option value="">Select tenant</option>
                  {scopedTenants.map(t => <option key={t.id} value={t.id}>{t.name} · {t.unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Priority</label>
                <select value={data.priority} onChange={e => setData(d => ({ ...d, priority: e.target.value as ReqPriority }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Category</label>
                <select value={data.category} onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => onSave(data)} disabled={!data.title || !data.propertyId || !data.tenantId}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
              Create Request
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Status Update Modal ──────────────────────────────────────────

function StatusUpdateModal({ request, onUpdate, onClose }: {
  request: MaintenanceRequest
  onUpdate: (status: ReqStatus, note: string, cost?: number) => void
  onClose: () => void
}) {
  const [status, setStatus] = useState<ReqStatus>(request.status)
  const [note, setNote] = useState('')
  const [cost, setCost] = useState(request.cost > 0 ? String(request.cost) : '')

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Update Status</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <p className="mb-4 text-[11px] text-muted-foreground/70">{request.title} · {request.unit}</p>

          <div className="mb-3 flex gap-2">
            {reqStatuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-medium capitalize transition-colors ${status === s ? 'bg-primary/10 text-primary border border-primary/20' : 'border border-border text-muted-foreground/70 hover:text-foreground'}`}>
                {s === 'in-progress' ? 'In Progress' : s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Note (added to history)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. Scheduled technician for Friday"
                className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            {status === 'resolved' && (
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground/70">Cost ($)</label>
                <input type="number" min={0} value={cost} onChange={e => setCost(e.target.value)}
                  className="h-8 w-full rounded-lg border border-border bg-card/60 px-3 text-xs text-foreground/90 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => onUpdate(status, note, status === 'resolved' ? Number(cost) || 0 : undefined)} disabled={!note && status === request.status}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
              Save Update
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────

function RequestDetail({ request, onClose, onUpdate }: {
  request: MaintenanceRequest
  onClose: () => void
  onUpdate: () => void
}) {
  const { state } = useApp()
  const tenantName = state.tenants.find(t => t.id === request.tenantId)?.name ?? 'Unknown'
  const propName = state.properties.find(p => p.id === request.propertyId)?.name ?? '—'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{request.title}</h2>
            <p className="text-[11px] text-muted-foreground/70">{propName} · {request.unit} · {tenantName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={request.priority} micro label={priorityMeta[request.priority].label} />
            <StatusBadge status={request.status} dot={false} />
            <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{request.category}</span>
          </div>

          {request.description && (
            <p className="mb-5 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground/80">{request.description}</p>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] text-muted-foreground/50">Submitted</p>
              <p className="text-xs font-medium text-foreground/85">{formatDate(request.submitted)}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] text-muted-foreground/50">Cost</p>
              <p className="text-xs font-medium text-foreground/85">{request.cost > 0 ? `$${request.cost.toLocaleString()}` : '—'}</p>
            </div>
          </div>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">Status History</p>
          <div className="space-y-0">
            {request.statusHistory.map((h: MaintenanceStatusEntry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`mt-1 h-2 w-2 rounded-full ${h.status === 'resolved' ? 'bg-success' : h.status === 'in-progress' ? 'bg-warning' : 'bg-primary'}`} />
                  {i < request.statusHistory.length - 1 && <div className="my-0.5 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium capitalize text-foreground/85">{h.status === 'in-progress' ? 'In Progress' : h.status}</p>
                  <p className="text-[10px] text-muted-foreground/60">{formatDate(h.at)}</p>
                  {h.note && <p className="mt-0.5 text-[11px] text-muted-foreground/75">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={onUpdate}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
            <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            Update Status
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const { state, dispatch } = useApp()
  const { maintenanceRequests } = state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [updateId, setUpdateId] = useState<string | null>(null)

  const open = maintenanceRequests.filter(r => r.status === 'open')
  const inProgress = maintenanceRequests.filter(r => r.status === 'in-progress')
  const resolved = maintenanceRequests.filter(r => r.status === 'resolved')

  const tenantName = (id: string) => state.tenants.find(t => t.id === id)?.name ?? '—'
  const propName = (id: string) => state.properties.find(p => p.id === id)?.name ?? '—'

  const filtered = maintenanceRequests.filter(r => {
    if (filter !== 'All' && r.status !== filter.toLowerCase().replace(' ', '-')) return false
    if (search) {
      const q = search.toLowerCase()
      if (!r.title.toLowerCase().includes(q) && !r.unit.toLowerCase().includes(q) && !tenantName(r.tenantId).toLowerCase().includes(q)) return false
    }
    return true
  })

  const detail = detailId ? maintenanceRequests.find(r => r.id === detailId) ?? null : null
  const updating = updateId ? maintenanceRequests.find(r => r.id === updateId) ?? null : null

  function handleCreate(d: NewReqData) {
    const tenant = state.tenants.find(t => t.id === d.tenantId)
    dispatch({ type: 'ADD_MAINTENANCE', payload: {
      title: d.title, description: d.description, unit: tenant?.unit ?? '—',
      tenantId: d.tenantId, propertyId: d.propertyId, priority: d.priority, status: 'open', category: d.category,
      submitted: new Date().toISOString().slice(0, 10),
      statusHistory: [{ status: 'open', at: new Date().toISOString().slice(0, 10), note: 'Request created' }],
      cost: 0, resolvedAt: '',
    } })
    setAddOpen(false)
  }

  function handleUpdate(id: string, status: ReqStatus, note: string, cost?: number) {
    const req = maintenanceRequests.find(r => r.id === id)
    if (!req) return
    const at = new Date().toISOString().slice(0, 10)
    const entry: MaintenanceStatusEntry = { status, at, note: note || `Marked ${status}` }
    const patch: Partial<MaintenanceRequest> = {
      status,
      statusHistory: [...req.statusHistory, entry],
    }
    if (status === 'resolved') {
      patch.resolvedAt = at
      if (cost !== undefined) patch.cost = cost
    } else {
      patch.resolvedAt = ''
    }
    dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id, ...patch } })
    setUpdateId(null)
  }

  return (
    <AppShell>
      <>
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Maintenance</h1>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {maintenanceRequests.length} total · {open.length} open · {inProgress.length} in progress · ${maintenanceSpend(resolved).toLocaleString()} spent
              </p>
            </div>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
              <Plus weight="bold" className="h-3.5 w-3.5" />
              New Request
            </button>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Open', count: open.length, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/10' },
              { label: 'In Progress', count: inProgress.length, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/10' },
              { label: 'Resolved', count: resolved.length, color: 'text-success', bg: 'bg-success/10', border: 'border-success/10' },
            ].map(b => (
              <div key={b.label} className={`rounded-2xl border ${b.border} bg-card/40 p-5`}>
                <div className={`mb-2 inline-flex rounded-lg p-1.5 ${b.bg}`}><Wrench weight="duotone" className={`h-4 w-4 ${b.color}`} /></div>
                <p className={`text-2xl font-semibold ${b.color}`}>{b.count}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">{b.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-52 max-w-xs">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..."
                className="h-8 w-full rounded-lg border border-border bg-card/60 pl-8 pr-3 text-xs text-foreground/90 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-muted text-foreground/90' : 'text-muted-foreground/70 hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 py-16">
                <Wrench className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {maintenanceRequests.length === 0 ? 'No maintenance requests yet' : 'No matching requests'}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/50">
                  {maintenanceRequests.length === 0 ? 'Log an issue when something breaks.' : 'Try another filter or search term.'}
                </p>
                {maintenanceRequests.length === 0 && (
                  <button onClick={() => setAddOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-brand-glow-sm transition-all hover:bg-primary/90">
                    <Plus weight="bold" className="h-3.5 w-3.5" /> New Request
                  </button>
                )}
              </div>
            ) : (
              filtered.map(req => {
                const pMeta = priorityMeta[req.priority]
                const ReqIcon = categoryIcons[req.category] ?? Wrench
                return (
                  <div key={req.id} onClick={() => setDetailId(req.id)}
                    className="flex cursor-pointer flex-wrap items-center gap-4 rounded-2xl border border-border bg-card/40 px-5 py-4 transition-colors hover:bg-muted/20">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <ReqIcon weight="duotone" className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium text-foreground/90">{req.title}</p>
                        <StatusBadge status={req.priority} micro label={pMeta.label} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {propName(req.propertyId)} · {req.unit} · {tenantName(req.tenantId)} · {req.category}
                      </p>
                    </div>

                    <div className="hidden flex-col items-end sm:flex">
                      <p className="text-[11px] text-muted-foreground/70">Submitted {formatDate(req.submitted)}</p>
                      {req.cost > 0 && (
                        <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60"><Receipt className="h-2.5 w-2.5" />${req.cost.toLocaleString()}</p>
                      )}
                    </div>

                    <StatusBadge status={req.status} />
                    <RowActions>
                      <RowActionsTrigger asChild>
                        <button onClick={(e) => e.stopPropagation()} title="Actions"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground">
                          <DotsThree weight="bold" className="h-4 w-4" />
                        </button>
                      </RowActionsTrigger>
                      <RowActionsContent>
                        <RowActionsLabel>Quick actions</RowActionsLabel>
                        {req.status !== 'in-progress' && (
                          <RowActionItem icon={<Clock weight="duotone" className="h-3.5 w-3.5" />} tone="primary"
                            onSelect={() => dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id: req.id, status: 'in-progress', statusHistory: [...req.statusHistory, { status: 'in-progress', at: new Date().toISOString().slice(0, 10), note: 'Marked in progress' }] } })}>
                            Start work
                          </RowActionItem>
                        )}
                        {req.status !== 'resolved' && (
                          <RowActionItem icon={<CheckCircle weight="duotone" className="h-3.5 w-3.5" />} tone="success"
                            onSelect={() => handleUpdate(req.id, 'resolved', 'Marked resolved')}>
                            Resolve
                          </RowActionItem>
                        )}
                        {req.status !== 'open' && (
                          <RowActionItem icon={<ArrowRight weight="duotone" className="h-3.5 w-3.5" />}
                            onSelect={() => dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id: req.id, status: 'open', statusHistory: [...req.statusHistory, { status: 'open', at: new Date().toISOString().slice(0, 10), note: 'Reopened' }] } })}>
                            Reopen
                          </RowActionItem>
                        )}
                        <RowActionsSeparator />
                        <RowActionItem icon={<Receipt weight="duotone" className="h-3.5 w-3.5" />}
                          onSelect={() => setUpdateId(req.id)}>
                          Update with note / cost…
                        </RowActionItem>
                      </RowActionsContent>
                    </RowActions>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <NewRequestModal open={addOpen} onSave={handleCreate} onClose={() => setAddOpen(false)} />
        {updating && <StatusUpdateModal request={updating} onUpdate={(s, n, c) => handleUpdate(updating.id, s, n, c)} onClose={() => setUpdateId(null)} />}
        {detail && <RequestDetail request={detail} onClose={() => setDetailId(null)} onUpdate={() => { setUpdateId(detail.id); setDetailId(null) }} />}
      </>
    </AppShell>
  )
}
