// ─── Derived helpers (read-only, operate on REAL data) ────────────
//
// Phase 1 removed the degenerate fake logic that lived here: the coin-flip
// payment simulation and index-math maintenance templates are gone. Leases,
// payments, and maintenance are now first-class entities persisted in the store.
//
// What remains are pure, side-effect-free helpers that compute values from
// real records (duration math, status roll-ups, display formatting). These
// do NOT invent data — call remove them with confidence.

import type {
  AppState, Lease, LeaseStatus, Payment, MaintenanceRequest,
  Property, Tenant, PaymentMethod,
} from './types'

// ─── Role helper (Phase 0 session) ────────────────────────────────

/** Normalize a possibly-undefined role to the default. */
export function normalizeRole(role: AppState['role'] | undefined): AppState['role'] {
  return role ?? 'admin'
}

// ─── Date helpers ─────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Whole days from today until an ISO date. Negative = past. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  if (!iso) return 0
  const target = new Date(`${iso}T00:00:00`)
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((target.getTime() - base.getTime()) / MS_PER_DAY)
}

/** Format an ISO date as e.g. "Mar 5, 2026". Empty string passes through. */
export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "Mar 2026" style month/year label. */
export function formatMonth(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** First day of the month containing `d`, as ISO yyyy-mm-dd. */
export function monthStart(d: Date = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

/** Last day of the month containing `d`, as ISO yyyy-mm-dd. */
export function monthEnd(d: Date = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}

// ─── Lease helpers ────────────────────────────────────────────────

/** A lease is "expiring" once within `thresholdDays` of its end date. */
export const LEASE_EXPIRING_DAYS = 90

/** Compute the display status of a lease from real dates + term state. */
export function leaseStatus(lease: Lease, from: Date = new Date()): LeaseStatus {
  const left = daysUntil(lease.endDate, from)
  if (left <= 0) return 'ended'
  if (lease.status === 'review') return 'review'
  if (left <= LEASE_EXPIRING_DAYS) return 'expiring'
  return 'active'
}

export interface LeaseView extends Lease {
  daysLeft: number
  displayStatus: LeaseStatus
  /** Human label of the co-tenant names, joined. */
  tenantLabel: string
}

/** Enrich leases with days-left + resolved status for display. Pure. */
export function leasesWithMeta(state: Pick<AppState, 'leases' | 'tenants'>, from: Date = new Date()): LeaseView[] {
  const tenantName = new Map(state.tenants.map(t => [t.id, t.name]))
  return state.leases
    .map(l => {
      const names = l.tenantIds.map(id => tenantName.get(id)).filter(Boolean) as string[]
      return {
        ...l,
        daysLeft: daysUntil(l.endDate, from),
        displayStatus: leaseStatus(l, from),
        tenantLabel: names.length > 0 ? names.join(' & ') : 'Unassigned',
      }
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

// ─── Payment helpers ──────────────────────────────────────────────

/** Total owed on a payment line, honoring late-fee waivers. */
export function paymentTotal(p: Pick<Payment, 'amount' | 'lateFee' | 'lateFeeWaived'>): number {
  return p.amount + (p.lateFeeWaived ? 0 : p.lateFee)
}

/** Outstanding balance requested by a line (0 once fully paid). */
export function paymentOutstanding(p: Payment): number {
  if (p.status === 'paid') return 0
  return paymentTotal(p)
}

/** A "delinquent" line is anything not fully paid that's owed for rent/fee. */
export function isDelinquent(p: Payment): boolean {
  return p.status === 'overdue' || p.status === 'partial' || p.status === 'pending'
}

/**
 * Rent + fee income actually COLLECTED, from real payments.
 *
 * Excludes deposits (they're liabilities, not income) and excludes unpaid
 * lines. Late fees count only when not waived — see `paymentTotal`.
 * Optionally scoped to a month window via `periodStart`.
 *
 * NOTE: this is the single source of truth for "how much rent came in".
 * Dashboard/Reports must use this instead of summing `tenant.rent`, which
 * is the *expected* rent, not what was collected.
 */
export function collectedIncome(
  payments: Payment[],
  from?: Date,
  to?: Date,
): number {
  return payments
    .filter(p => {
      if (p.type === 'deposit') return false
      if (p.status !== 'paid') return false
      if (!from && !to) return true
      const d = new Date(p.periodStart).getTime()
      if (Number.isNaN(d)) return true
      if (from && d < from.getTime()) return false
      if (to && d > to.getTime()) return false
      return true
    })
    .reduce((sum, p) => sum + paymentTotal(p), 0)
}

/** Expected monthly rent across active leases (the "should be" figure). */
export function expectedMonthlyRent(state: Pick<AppState, 'leases'>): number {
  return state.leases
    .filter(l => l.status !== 'ended')
    .reduce((sum, l) => sum + l.rent, 0)
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  ach: 'ACH',
  card: 'Card',
  check: 'Check',
  cash: 'Cash',
}

export function paymentMethodLabel(method: PaymentMethod | string): string {
  return METHOD_LABEL[method as PaymentMethod] ?? method
}

export interface DelinquencyRow {
  payment: Payment
  tenantName: string
  unit: string
  propertyName: string
  owed: number
  daysLate: number
}

/** Lines that need chasing: overdue/partial/pending, oldest first. Pure. */
export function delinquencies(
  state: Pick<AppState, 'payments' | 'tenants' | 'properties'>,
  from: Date = new Date(),
): DelinquencyRow[] {
  const tenantName = new Map(state.tenants.map(t => [t.id, t.name]))
  const propName = new Map(state.properties.map(p => [p.id, p.name]))
  return state.payments
    .filter(isDelinquent)
    .map(p => ({
      payment: p,
      tenantName: tenantName.get(p.tenantId) ?? 'Unknown tenant',
      unit: state.tenants.find(t => t.id === p.tenantId)?.unit ?? '—',
      propertyName: propName.get(p.propertyId) ?? '—',
      owed: paymentOutstanding(p),
      daysLate: Math.max(0, daysUntil(p.periodStart, from) * -1),
    }))
    .sort((a, b) => b.daysLate - a.daysLate)
}

// ─── Maintenance helpers ──────────────────────────────────────────

export function isOpenRequest(r: MaintenanceRequest): boolean {
  return r.status !== 'resolved'
}

/** Total spend logged against resolved requests in a property set. */
export function maintenanceSpend(requests: MaintenanceRequest[]): number {
  return requests.reduce((sum, r) => sum + (r.cost || 0), 0)
}

// ─── Property helper ──────────────────────────────────────────────

/** Display label for a property id, falling back gracefully. */
export function propertyName(properties: Property[], propertyId: string): string {
  return properties.find(p => p.id === propertyId)?.name ?? 'Unknown'
}

/** Display label for a tenant id. */
export function tenantName(tenants: Tenant[], tenantId: string): string {
  return tenants.find(t => t.id === tenantId)?.name ?? 'Unknown tenant'
}

// ─── Occupancy (derived — properties are single homes) ────────────

/** A property is occupied when it has at least one active lease. */
export type Occupancy = 'occupied' | 'vacant'

export function propertyOccupancy(propertyId: string, leases: Lease[]): Occupancy {
  const hasActive = leases.some(l => l.propertyId === propertyId && leaseStatus(l) !== 'ended')
  return hasActive ? 'occupied' : 'vacant'
}

/** Counts across a portfolio, for the dashboard. */
export function occupancyCounts(
  properties: Pick<Property, 'id'>[],
  leases: Lease[],
): { occupied: number; vacant: number; total: number; pct: number } {
  let occupied = 0
  for (const p of properties) {
    if (propertyOccupancy(p.id, leases) === 'occupied') occupied += 1
  }
  const total = properties.length
  return { occupied, vacant: total - occupied, total, pct: total > 0 ? Math.round((occupied / total) * 100) : 0 }
}

/** Monthly rent currently under contract at a property (active leases). */
export function propertyMonthlyRent(propertyId: string, leases: Lease[]): number {
  return leases
    .filter(l => l.propertyId === propertyId && leaseStatus(l) !== 'ended')
    .reduce((sum, l) => sum + l.rent, 0)
}
