// ─── Shared domain types ──────────────────────────────────────────

export type PropertyStatus = 'active' | 'renovation' | 'pending'
export type TenantStatus   = 'current' | 'expiring' | 'late'
export type LeaseStatus    = 'active' | 'expiring' | 'review'
export type PaymentStatus  = 'paid' | 'pending' | 'overdue'
export type PaymentType    = 'rent' | 'fee' | 'deposit'
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

export interface Lease {
  id: string
  tenantId: string
  propertyId: string
  tenant: string
  unit: string
  start: string
  end: string
  rent: string
  status: 'active' | 'expiring' | 'review'
  daysLeft: number
}

export interface Payment {
  id: string
  tenantId: string
  propertyId: string
  tenant: string
  unit: string
  amount: number
  date: string
  method: string
  type: 'rent' | 'fee' | 'deposit'
  status: 'paid' | 'pending' | 'overdue'
}

export interface MaintenanceRequest {
  id: string
  title: string
  unit: string
  tenantId: string
  propertyId: string
  tenant: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  submitted: string
  category: string
}

// ─── State shape ──────────────────────────────────────────────────

export interface AppState {
  properties: Property[]
  tenants: Tenant[]
  leases: Lease[]
  payments: Payment[]
  maintenanceRequests: MaintenanceRequest[]
}

// ─── Individual action payloads (named exports for discriminated dispatch) ──

export type AddPropertyPayload   = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'occupied' | 'revenue'>
export type UpdatePropertyPayload = Partial<Property> & { id: string }
export type AddTenantPayload     = Omit<Tenant, 'id' | 'since' | 'leaseLabel'>
export type UpdateTenantPayload  = Partial<Tenant> & { id: string }

// ─── Action types ─────────────────────────────────────────────────

export type AppAction =
  | { type: 'ADD_PROPERTY';  payload: AddPropertyPayload }
  | { type: 'UPDATE_PROPERTY'; payload: UpdatePropertyPayload }
  | { type: 'DELETE_PROPERTY'; payload: { id: string } }
  | { type: 'ADD_TENANT';    payload: AddTenantPayload }
  | { type: 'UPDATE_TENANT'; payload: UpdateTenantPayload }
  | { type: 'DELETE_TENANT'; payload: { id: string } }
  | { type: 'RESET'; payload: AppState }
