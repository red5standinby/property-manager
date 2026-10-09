import type {
  AppState, AppAction, Property, Tenant, Lease, Payment,
  MaintenanceRequest, PaymentStatus, PaymentMethod, LeaseStatus,
  ReqStatus, MaintenanceStatusEntry,
} from '@/src/lib/types'
import { monthStart, monthEnd } from '@/src/lib/derived'

let idCounter = 0
function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

const today = () => new Date().toISOString().slice(0, 10)

/** Occupancy is derived from active leases (see src/lib/derived.ts), so there
 *  are no cached property fields to recompute. Kept as a pass-through so the
 *  many call sites stay readable and we have one seam if that changes. */
function recomputeAll(state: AppState): AppState {
  return state
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ─── Properties ─────────────────────────────────────────────
    case 'ADD_PROPERTY': {
      const property: Property = {
        ...action.payload,
        id: generateId('prop'),
        createdAt: today(),
        updatedAt: today(),
      }
      return { ...state, properties: [...state.properties, property] }
    }

    case 'UPDATE_PROPERTY': {
      const properties = state.properties.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload, updatedAt: today() }
          : p
      )
      return { ...state, properties }
    }

    case 'DELETE_PROPERTY': {
      const properties = state.properties.filter(p => p.id !== action.payload.id)
      const tenants = state.tenants.filter(t => t.propertyId !== action.payload.id)
      const tenantIds = new Set(tenants.map(t => t.id))
      return recomputeAll({
        ...state,
        properties,
        tenants,
        leases: state.leases.filter(l => l.propertyId !== action.payload.id),
        payments: state.payments.filter(p => p.propertyId !== action.payload.id && tenantIds.has(p.tenantId)),
        maintenanceRequests: state.maintenanceRequests.filter(r => r.propertyId !== action.payload.id),
      })
    }

    // ─── Tenants ────────────────────────────────────────────────
    case 'ADD_TENANT': {
      const tenant: Tenant = {
        ...action.payload,
        id: generateId('t'),
        since: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
        leaseLabel: action.payload.leaseEnd
          ? `Expires ${new Date(`${action.payload.leaseEnd}T00:00:00`).toLocaleString('default', { month: 'short', year: 'numeric' })}`
          : '—',
      }
      return recomputeAll({ ...state, tenants: [...state.tenants, tenant] })
    }

    case 'UPDATE_TENANT': {
      const tenants = state.tenants.map(t =>
        t.id === action.payload.id
          ? {
              ...t,
              ...action.payload,
              leaseLabel: action.payload.leaseEnd
                ? `Expires ${new Date(`${action.payload.leaseEnd}T00:00:00`).toLocaleString('default', { month: 'short', year: 'numeric' })}`
                : t.leaseLabel,
            }
          : t
      )
      return recomputeAll({ ...state, tenants })
    }

    case 'DELETE_TENANT': {
      const tenants = state.tenants.filter(t => t.id !== action.payload.id)
      // Remove the tenant from any co-tenant lease; drop leases left empty.
      const leases = state.leases
        .map(l => ({ ...l, tenantIds: l.tenantIds.filter(id => id !== action.payload.id) }))
        .filter(l => l.tenantIds.length > 0)
      return recomputeAll({
        ...state,
        tenants,
        leases,
        payments: state.payments.filter(p => p.tenantId !== action.payload.id),
      })
    }

    // ─── Leases (first-class) ───────────────────────────────────
    case 'ADD_LEASE': {
      const lease: Lease = {
        ...action.payload,
        id: generateId('lease'),
        createdAt: today(),
        updatedAt: today(),
      }
      return recomputeAll({ ...state, leases: [...state.leases, lease] })
    }

    case 'UPDATE_LEASE': {
      const leases = state.leases.map(l =>
        l.id === action.payload.id
          ? { ...l, ...action.payload, updatedAt: today() }
          : l
      )
      return recomputeAll({ ...state, leases })
    }

    case 'DELETE_LEASE': {
      return recomputeAll({
        ...state,
        leases: state.leases.filter(l => l.id !== action.payload.id),
        payments: state.payments.filter(p => p.leaseId !== action.payload.id),
      })
    }

    // ─── Payments (first-class) ─────────────────────────────────
    case 'ADD_PAYMENT': {
      const payment: Payment = {
        ...action.payload,
        id: generateId('pay'),
        createdAt: today(),
        updatedAt: today(),
      }
      return recomputeAll({ ...state, payments: [...state.payments, payment] })
    }

    case 'UPDATE_PAYMENT': {
      const payments = state.payments.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload, updatedAt: today() }
          : p
      )
      return recomputeAll({ ...state, payments })
    }

    case 'DELETE_PAYMENT': {
      return recomputeAll({
        ...state,
        payments: state.payments.filter(p => p.id !== action.payload.id),
      })
    }

    // ─── Maintenance (first-class) ──────────────────────────────
    case 'ADD_MAINTENANCE': {
      const request: MaintenanceRequest = {
        ...action.payload,
        id: generateId('maint'),
        createdAt: today(),
        updatedAt: today(),
      }
      return recomputeAll({ ...state, maintenanceRequests: [...state.maintenanceRequests, request] })
    }

    case 'UPDATE_MAINTENANCE': {
      const maintenanceRequests = state.maintenanceRequests.map(r =>
        r.id === action.payload.id
          ? { ...r, ...action.payload, updatedAt: today() }
          : r
      )
      return recomputeAll({ ...state, maintenanceRequests })
    }

    case 'DELETE_MAINTENANCE': {
      return recomputeAll({
        ...state,
        maintenanceRequests: state.maintenanceRequests.filter(r => r.id !== action.payload.id),
      })
    }

    case 'RESET':
      return action.payload

    default:
      return state
  }
}

// ─── Seed generation ──────────────────────────────────────────────
//
// Deterministic sample portfolio for a fresh install. This is REAL entity
// creation (explicit records, real timestamps) — not the coin-flip/index
// simulation that used to live in derived.ts. Every record here is editable
// and persisted like any user-created one.

const DAY = 1000 * 60 * 60 * 24
const iso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY)

/** Build a realistic starter dataset anchoring everything to the current
 *  month so payment/lease timing reads correctly whenever it's first run. */
export function buildSeedState(): AppState {
  const now = new Date()
  const pStart = monthStart(now)
  const pEnd = monthEnd(now)
  const prevStart = monthStart(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const prevEnd = monthEnd(new Date(now.getFullYear(), now.getMonth() - 1, 1))

  const properties: Property[] = [
    {
      id: 'prop-1', name: 'Willow Creek House', address: '412 Willow Creek Rd, Austin, TX 78701',
      type: 'Single-family', status: 'active',
      createdAt: iso(addDays(now, -400)), updatedAt: iso(now),
    },
    {
      id: 'prop-2', name: 'Maple Street Duplex', address: '88 Maple St, Austin, TX 78704',
      type: 'Duplex', status: 'active',
      createdAt: iso(addDays(now, -300)), updatedAt: iso(now),
    },
    {
      id: 'prop-3', name: 'Cedar Park Townhome', address: '9 Cedar Park Ln, Round Rock, TX 78664',
      type: 'Townhome', status: 'renovation',
      createdAt: iso(addDays(now, -200)), updatedAt: iso(now),
    },
  ]

  const tenantSeeds: Omit<Tenant, 'id' | 'since' | 'leaseLabel' | 'status'>[] = [
    { name: 'Marcus Reed',    email: 'marcus.reed@example.com',  phone: '(512) 555-0114', propertyId: 'prop-1', unit: '1A', rent: 1850, leaseStart: iso(addDays(now, -120)), leaseEnd: iso(addDays(now, 245)) },
    { name: 'Priya Natarajan', email: 'priya.n@example.com',      phone: '(512) 555-0128', propertyId: 'prop-1', unit: '1B', rent: 1925, leaseStart: iso(addDays(now, -350)), leaseEnd: iso(addDays(now, 15)) },
    { name: 'Theo Alvarez',   email: 'theo.alvarez@example.com', phone: '(512) 555-0136', propertyId: 'prop-1', unit: '2A', rent: 1750, leaseStart: iso(addDays(now, -60)),  leaseEnd: iso(addDays(now, 305)) },
    { name: 'Dana Whitfield', email: 'dana.w@example.com',       phone: '(512) 555-0142', propertyId: 'prop-1', unit: '2B', rent: 1800, leaseStart: iso(addDays(now, -400)), leaseEnd: iso(addDays(now, -5)) },
    { name: 'Kenji Ito',      email: 'kenji.ito@example.com',    phone: '(512) 555-0157', propertyId: 'prop-1', unit: '3A', rent: 1875, leaseStart: iso(addDays(now, -200)), leaseEnd: iso(addDays(now, 165)) },
    { name: 'Rosa Delgado',   email: 'rosa.delgado@example.com', phone: '(512) 555-0163', propertyId: 'prop-2', unit: 'A', rent: 2100, leaseStart: iso(addDays(now, -80)),  leaseEnd: iso(addDays(now, 285)) },
    { name: 'Owen Bradley',   email: 'owen.b@example.com',       phone: '(512) 555-0171', propertyId: 'prop-2', unit: 'B', rent: 2050, leaseStart: iso(addDays(now, -310)), leaseEnd: iso(addDays(now, 55)) },
    { name: 'Simone Laurent', email: 'simone.l@example.com',     phone: '(512) 555-0188', propertyId: 'prop-3', unit: '1', rent: 1650, leaseStart: iso(addDays(now, -45)),  leaseEnd: iso(addDays(now, 320)) },
    { name: 'Ivan Petrov',    email: 'ivan.petrov@example.com',  phone: '(512) 555-0194', propertyId: 'prop-3', unit: '2', rent: 1600, leaseStart: iso(addDays(now, -500)), leaseEnd: iso(addDays(now, -30)) },
  ]

  const tenants: Tenant[] = tenantSeeds.map((t, i) => ({
    ...t,
    id: `t-${i + 1}`,
    since: new Date(`${t.leaseStart}T00:00:00`).toLocaleString('default', { month: 'short', year: 'numeric' }),
    leaseLabel: `Expires ${new Date(`${t.leaseEnd}T00:00:00`).toLocaleString('default', { month: 'short', year: 'numeric' })}`,
    status: 'current',
  }))

  // One lease per occupied unit, linked to its tenant(s).
  const leases: Lease[] = tenants.map((t, i) => {
    const start = t.leaseStart
    const end = t.leaseEnd
    const months = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (DAY * 30)))
    const term: Lease['term'] = months <= 1 ? 'month-to-month' : months <= 4 ? '3-month' : months <= 8 ? '6-month' : months <= 14 ? '12-month' : '24-month'
    return {
      id: `lease-${i + 1}`,
      propertyId: t.propertyId,
      unit: t.unit,
      tenantIds: [t.id],
      startDate: start,
      endDate: end,
      rent: t.rent,
      term,
      status: 'active',
      createdAt: start,
      updatedAt: iso(now),
    }
  })

  // Payment lines. Deposits kept separate; late fees are their own line and
  // one is explicitly WAIVED to exercise the flag.
  const payments: Payment[] = []
  const mk = (
    lease: Lease, tenantId: string, propertyId: string, periodS: string, periodE: string,
    amount: number, type: Payment['type'], method: PaymentMethod, status: PaymentStatus,
    opts: { lateFee?: number; lateFeeWaived?: boolean; paidAt?: string; note?: string } = {},
  ) => {
    payments.push({
      id: generateId('pay'),
      leaseId: lease.id, tenantId, propertyId,
      periodStart: periodS, periodEnd: periodE, amount,
      lateFee: opts.lateFee ?? 0, lateFeeWaived: opts.lateFeeWaived ?? false,
      type, method, status, paidAt: opts.paidAt ?? '', note: opts.note ?? '',
      createdAt: today(), updatedAt: today(),
    })
  }

  leases.forEach((lease, i) => {
    const tenant = tenants[i]
    // Security deposit, kept out of rent income.
    mk(lease, tenant.id, tenant.propertyId, lease.startDate, lease.startDate, tenant.rent, 'deposit', 'ach', 'paid',
      { paidAt: lease.startDate, note: 'Move-in security deposit' })
  })

  const methods: PaymentMethod[] = ['ach', 'ach', 'card', 'check', 'cash', 'ach', 'card', 'check', 'cash']
  const method = (i: number): PaymentMethod => methods[i] ?? 'ach'

  // Previous month — all lines settled.
  leases.forEach((lease, i) => {
    mk(lease, tenants[i].id, tenants[i].propertyId, prevStart, prevEnd, lease.rent, 'rent', method(i), 'paid', { paidAt: prevEnd })
  })

  // Current month — a realistic mix.
  mk(leases[0], tenants[0].id, tenants[0].propertyId, pStart, pEnd, leases[0].rent, 'rent', 'ach', 'paid', { paidAt: `${pStart.slice(0, 8)}04` })
  mk(leases[1], tenants[1].id, tenants[1].propertyId, pStart, pEnd, leases[1].rent, 'rent', 'check', 'pending')
  mk(leases[2], tenants[2].id, tenants[2].propertyId, pStart, pEnd, 900, 'rent', 'ach', 'partial',
    { note: 'Partial payment — remainder promised Friday' })
  mk(leases[3], tenants[3].id, tenants[3].propertyId, pStart, pEnd, leases[3].rent, 'rent', 'ach', 'overdue', { lateFee: 75 })
  mk(leases[4], tenants[4].id, tenants[4].propertyId, pStart, pEnd, leases[4].rent, 'rent', 'card', 'paid', { paidAt: `${pStart.slice(0, 8)}06` })
  mk(leases[5], tenants[5].id, tenants[5].propertyId, pStart, pEnd, leases[5].rent, 'rent', 'ach', 'paid', { paidAt: `${pStart.slice(0, 8)}02` })
  mk(leases[6], tenants[6].id, tenants[6].propertyId, pStart, pEnd, leases[6].rent, 'rent', 'cash', 'overdue', { lateFee: 50 })
  mk(leases[7], tenants[7].id, tenants[7].propertyId, pStart, pEnd, leases[7].rent, 'rent', 'ach', 'pending')
  // A late-fee-only line that's been waived (shows the waiver flow in data).
  mk(leases[0], tenants[0].id, tenants[0].propertyId, prevStart, prevEnd, 0, 'fee', 'ach', 'paid',
    { lateFee: 50, lateFeeWaived: true, note: 'Late fee waived — first-time grace' })

  const statusHistoryEntry = (status: ReqStatus, at: string, note: string): MaintenanceStatusEntry => ({ status, at, note })

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: generateId('maint'), title: 'HVAC not cooling', description: 'Upstairs unit blows warm air; tenant reports 82°F indoors.',
      unit: '1A', tenantId: tenants[0].id, propertyId: 'prop-1', priority: 'high', status: 'in-progress', category: 'HVAC',
      submitted: iso(addDays(now, -6)), cost: 0, resolvedAt: '',
      statusHistory: [
        statusHistoryEntry('open', iso(addDays(now, -6)), 'Reported by tenant'),
        statusHistoryEntry('in-progress', iso(addDays(now, -5)), 'Technician scheduled for Friday'),
      ],
      createdAt: iso(addDays(now, -6)), updatedAt: iso(now),
    },
    {
      id: generateId('maint'), title: 'Leaking kitchen faucet', description: 'Slow drip under the sink; cabinet base is damp.',
      unit: '2A', tenantId: tenants[2].id, propertyId: 'prop-1', priority: 'medium', status: 'open', category: 'Plumbing',
      submitted: iso(addDays(now, -2)), cost: 0, resolvedAt: '',
      statusHistory: [statusHistoryEntry('open', iso(addDays(now, -2)), 'Reported by tenant')],
      createdAt: iso(addDays(now, -2)), updatedAt: iso(now),
    },
    {
      id: generateId('maint'), title: 'Electrical outlet dead', description: 'Living room outlet stopped working after storm.',
      unit: 'B', tenantId: tenants[6].id, propertyId: 'prop-2', priority: 'high', status: 'open', category: 'Electric',
      submitted: iso(addDays(now, -1)), cost: 0, resolvedAt: '',
      statusHistory: [statusHistoryEntry('open', iso(addDays(now, -1)), 'Reported by tenant')],
      createdAt: iso(addDays(now, -1)), updatedAt: iso(now),
    },
    {
      id: generateId('maint'), title: 'Water heater failure', description: 'No hot water since Tuesday morning.',
      unit: '3A', tenantId: tenants[4].id, propertyId: 'prop-1', priority: 'urgent', status: 'resolved', category: 'Plumbing',
      submitted: iso(addDays(now, -20)), cost: 640, resolvedAt: iso(addDays(now, -17)),
      statusHistory: [
        statusHistoryEntry('open', iso(addDays(now, -20)), 'Reported by tenant'),
        statusHistoryEntry('in-progress', iso(addDays(now, -19)), 'Plumber dispatched'),
        statusHistoryEntry('resolved', iso(addDays(now, -17)), 'Replaced heating element — $640'),
      ],
      createdAt: iso(addDays(now, -20)), updatedAt: iso(addDays(now, -17)),
    },
    {
      id: generateId('maint'), title: 'Clogged drain', description: 'Bathroom sink draining very slowly.',
      unit: 'A', tenantId: tenants[5].id, propertyId: 'prop-2', priority: 'low', status: 'resolved', category: 'Plumbing',
      submitted: iso(addDays(now, -35)), cost: 120, resolvedAt: iso(addDays(now, -33)),
      statusHistory: [
        statusHistoryEntry('open', iso(addDays(now, -35)), 'Reported by tenant'),
        statusHistoryEntry('resolved', iso(addDays(now, -33)), 'Snaked drain — $120'),
      ],
      createdAt: iso(addDays(now, -35)), updatedAt: iso(addDays(now, -33)),
    },
  ]

  const state: AppState = {
    properties, tenants, leases, payments, maintenanceRequests, role: 'admin',
  }
  return recomputeAll(state)
}
