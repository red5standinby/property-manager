import type { AppState, AppAction, Property, Tenant } from '@/src/lib/types'
import { deriveLeases, derivePayments, deriveMaintenanceRequests } from '@/src/lib/derived'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function recomputeProperties(properties: Property[], tenants: Tenant[]): Property[] {
  return properties.map(p => {
    const propTenants = tenants.filter(t => t.propertyId === p.id)
    const occupied = Math.min(propTenants.length, p.units)
    const total = propTenants.reduce((sum, t) => sum + t.rent, 0)
    return {
      ...p,
      occupied,
      revenue: total > 0 ? `$${total.toLocaleString()}` : '—',
    }
  })
}

function recomputeAll(state: AppState): AppState {
  const properties = recomputeProperties(state.properties, state.tenants)
  const leases = deriveLeases(properties, state.tenants)
  const payments = derivePayments(state.tenants)
  const maintenanceRequests = deriveMaintenanceRequests(properties, state.tenants)
  return { ...state, properties, leases, payments, maintenanceRequests }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PROPERTY': {
      const property: Property = {
        ...action.payload,
        id: generateId('prop'),
        occupied: 0,
        revenue: '—',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      const next = { ...state, properties: [...state.properties, property] }
      return recomputeAll(next)
    }

    case 'UPDATE_PROPERTY': {
      const properties = state.properties.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload, updatedAt: new Date().toISOString().slice(0, 10) }
          : p
      )
      const next = { ...state, properties }
      return recomputeAll(next)
    }

    case 'DELETE_PROPERTY': {
      const properties = state.properties.filter(p => p.id !== action.payload.id)
      const tenants = state.tenants.filter(t => t.propertyId !== action.payload.id)
      const next = { ...state, properties, tenants }
      return recomputeAll(next)
    }

    case 'ADD_TENANT': {
      const tenant: Tenant = {
        ...action.payload,
        id: generateId('t'),
        since: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
        leaseLabel: `Expires ${new Date(action.payload.leaseEnd).toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      }
      const next = { ...state, tenants: [...state.tenants, tenant] }
      return recomputeAll(next)
    }

    case 'UPDATE_TENANT': {
      const tenants = state.tenants.map(t =>
        t.id === action.payload.id
          ? {
              ...t,
              ...action.payload,
              leaseLabel: action.payload.leaseEnd
                ? `Expires ${new Date(action.payload.leaseEnd).toLocaleString('default', { month: 'short', year: 'numeric' })}`
                : t.leaseLabel,
            }
          : t
      )
      const next = { ...state, tenants }
      return recomputeAll(next)
    }

    case 'DELETE_TENANT': {
      const tenants = state.tenants.filter(t => t.id !== action.payload.id)
      const next = { ...state, tenants }
      return recomputeAll(next)
    }

    case 'RESET':
      return action.payload

    default:
      return state
  }
}
