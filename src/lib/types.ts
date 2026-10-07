// ─── Shared domain types ──────────────────────────────────────────
//
// Phase 1: Payments, Leases, and Maintenance are now FIRST-CLASS entities
// persisted in the store. They are no longer derived from tenants. See
// src/store/reducer.ts (CRUD + seed generation) and src/lib/derived.ts
// (read-only helpers that operate on REAL data).

export type PropertyStatus = 'active' | 'renovation' | 'pending'
export type TenantStatus   = 'current' | 'expiring' | 'late'
export type LeaseStatus    = 'active' | 'expiring' | 'review' | 'ended'
export type LeaseTerm      = 'month-to-month' | '3-month' | '6-month' | '12-month' | '24-month'
export type PaymentStatus  = 'paid' | 'pending' | 'partial' | 'overdue'
export type PaymentType    = 'rent' | 'fee' | 'deposit'
export type PaymentMethod  = 'ach' | 'card' | 'check' | 'cash'
export type ReqPriority    = 'urgent' | 'high' | 'medium' | 'low'
export type ReqStatus      = 'open' | 'in-progress' | 'resolved'

// ─── Core entities ────────────────────────────────────────────────

export interface Property {
  id: string
  name: string
  address: string
  units: number
  occupied: number
  type: string
  revenue: string
  status: 'active' | 'renovation' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  propertyId: string
  unit: string
  leaseStart: string
  leaseEnd: string
  rent: number
  status: 'current' | 'expiring' | 'late'
  since: string
  leaseLabel: string
}

/** A lease is an independent entity: it owns the rented term/rent and may
 *  cover multiple co-tenants. Tenants reference a unit; the lease links the
 *  occupants to a term. */
export interface Lease {
  id: string
  propertyId: string
  unit: string
  /** Co-tenants who share this single lease. */
  tenantIds: string[]
  startDate: string   // ISO yyyy-mm-dd
  endDate: string     // ISO yyyy-mm-dd
  rent: number        // monthly rent for the term
  term: LeaseTerm
  status: LeaseStatus
  createdAt: string
  updatedAt: string
}

/** A payment line. Amount may be LESS than rent (partial payments are the
 *  norm). `type` keeps deposits and fees out of rent income. Late fees are
 *  their own line item and are separately waivable. */
export interface Payment {
  id: string
  leaseId: string
  tenantId: string
  propertyId: string
  /** ISO yyyy-mm-dd — the rental period this payment covers (supports prepay). */
  periodStart: string
  periodEnd: string
  /** Rent/fee amount. For a deposit this is the deposit amount. */
  amount: number
  /** Late fee tracked as its own line item, independent of `amount`. */
  lateFee: number
  /** When true, the late fee is waived (does not count toward what's owed). */
  lateFeeWaived: boolean
  type: PaymentType
  method: PaymentMethod
  status: PaymentStatus
  /** ISO yyyy-mm-dd the payment was recorded/made. Empty for unpaid lines. */
  paidAt: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface MaintenanceStatusEntry {
  status: ReqStatus
  at: string   // ISO yyyy-mm-dd (or full ISO timestamp)
  note: string
}

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  unit: string
  tenantId: string
  propertyId: string
  priority: ReqPriority
  status: ReqStatus
  category: string
  submitted: string  // ISO yyyy-mm-dd
  /** Audit trail of every status change, oldest first. This is the record. */
  statusHistory: MaintenanceStatusEntry[]
  /** Cost set on/in after resolution. 0 = not yet known. */
  cost: number
  resolvedAt: string // ISO yyyy-mm-dd, '' when unresolved
  createdAt: string
  updatedAt: string
}

// ─── Session ──────────────────────────────────────────────────────

/** Minimal session role. Not functional auth yet (Phase 0) — just carries
 *  which persona the UI should present. Defaults to 'admin'. */
export type Role = 'admin' | 'user'

// ─── State shape ──────────────────────────────────────────────────

export interface AppState {
  properties: Property[]
  tenants: Tenant[]
  leases: Lease[]
  payments: Payment[]
  maintenanceRequests: MaintenanceRequest[]
  /** Current session role. Default 'admin'. Persisted with the rest of state. */
  role: Role
}

// ─── Action payloads ──────────────────────────────────────────────

export type AddPropertyPayload   = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'occupied' | 'revenue'>
export type UpdatePropertyPayload = Partial<Property> & { id: string }
export type AddTenantPayload     = Omit<Tenant, 'id' | 'since' | 'leaseLabel'>
export type UpdateTenantPayload  = Partial<Tenant> & { id: string }

export type AddLeasePayload      = Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateLeasePayload   = Partial<Lease> & { id: string }

export type AddPaymentPayload    = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePaymentPayload = Partial<Payment> & { id: string }

export type AddMaintenancePayload    = Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMaintenancePayload = Partial<MaintenanceRequest> & { id: string }

// ─── Action types ─────────────────────────────────────────────────

export type AppAction =
  | { type: 'ADD_PROPERTY';  payload: AddPropertyPayload }
  | { type: 'UPDATE_PROPERTY'; payload: UpdatePropertyPayload }
  | { type: 'DELETE_PROPERTY'; payload: { id: string } }
  | { type: 'ADD_TENANT';    payload: AddTenantPayload }
  | { type: 'UPDATE_TENANT'; payload: UpdateTenantPayload }
  | { type: 'DELETE_TENANT'; payload: { id: string } }
  | { type: 'ADD_LEASE';     payload: AddLeasePayload }
  | { type: 'UPDATE_LEASE';  payload: UpdateLeasePayload }
  | { type: 'DELETE_LEASE';  payload: { id: string } }
  | { type: 'ADD_PAYMENT';   payload: AddPaymentPayload }
  | { type: 'UPDATE_PAYMENT'; payload: UpdatePaymentPayload }
  | { type: 'DELETE_PAYMENT'; payload: { id: string } }
  | { type: 'ADD_MAINTENANCE'; payload: AddMaintenancePayload }
  | { type: 'UPDATE_MAINTENANCE'; payload: UpdateMaintenancePayload }
  | { type: 'DELETE_MAINTENANCE'; payload: { id: string } }
  | { type: 'RESET'; payload: AppState }
