import type { Property, Tenant, Lease, Payment, MaintenanceRequest } from './types'

/** Derive Lease records from Tenant data */
export function deriveLeases(properties: Property[], tenants: Tenant[]): Lease[] {
  const propNames = new Map(properties.map(p => [p.id, p.name]))
  return tenants.map(t => {
    const start = new Date(t.leaseStart)
    const end = new Date(t.leaseEnd)
    const daysLeft = Math.max(0, Math.round((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

    let leaseStatus: Lease['status'] = 'active'
    if (t.status === 'expiring') leaseStatus = 'expiring'
    if (daysLeft <= 0) leaseStatus = 'review'

    return {
      id: `lease-${t.id}`,
      tenantId: t.id,
      propertyId: t.propertyId,
      tenant: t.name,
      unit: t.unit,
      start: new Date(t.leaseStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: new Date(t.leaseEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rent: `$${t.rent.toLocaleString()}/mo`,
      status: leaseStatus,
      daysLeft,
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft)
}

/** Derive Payment records from Tenant data */
export function derivePayments(tenants: Tenant[]): Payment[] {
  const now = new Date()
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  const day = now.getDate()

  const paid: Payment[] = []
  const pending: Payment[] = []
  const overdue: Payment[] = []

  tenants.forEach((t, i) => {
    // Simulate a payment history — some have paid, some pending, some overdue
    const isPaid = t.status === 'current' && i % 3 !== 0
    const isOverdue = t.status === 'late' || (t.status === 'current' && i % 5 === 0)

    if (isPaid) {
      paid.push({
        id: `pay-${t.id}-${now.getMonth()}`,
        tenantId: t.id,
        propertyId: t.propertyId,
        tenant: t.name,
        unit: t.unit,
        amount: t.rent,
        date: `${month} ${day}`,
        method: ['ACH', 'Card', 'Check', 'ACH'][i % 4],
        type: 'rent',
        status: 'paid',
      })
    } else if (isOverdue) {
      overdue.push({
        id: `pay-${t.id}-${now.getMonth()}-overdue`,
        tenantId: t.id,
        propertyId: t.propertyId,
        tenant: t.name,
        unit: t.unit,
        amount: t.rent,
        date: `${month} 1`,
        method: '—',
        type: 'rent',
        status: 'overdue',
      })
    } else {
      pending.push({
        id: `pay-${t.id}-${now.getMonth()}-pending`,
        tenantId: t.id,
        propertyId: t.propertyId,
        tenant: t.name,
        unit: t.unit,
        amount: t.rent,
        date: `${month} ${day}`,
        method: '—',
        type: 'rent',
        status: 'pending',
      })
    }
  })

  return [...paid, ...pending, ...overdue]
}

/** Derive maintenance requests (seed data, but linked to real tenants/properties) */
export function deriveMaintenanceRequests(properties: Property[], tenants: Tenant[]): MaintenanceRequest[] {
  const propNames = new Map(properties.map(p => [p.id, p.name]))

  const templates = [
    { title: 'HVAC not cooling',       category: 'HVAC',     priority: 'high' as const,   icon: null },
    { title: 'Leaking kitchen faucet', category: 'Plumbing', priority: 'medium' as const, icon: null },
    { title: 'Electrical outlet dead', category: 'Electric', priority: 'high' as const,   icon: null },
    { title: 'Garage door stuck',      category: 'General',  priority: 'low' as const,    icon: null },
    { title: 'Water heater failure',   category: 'Plumbing', priority: 'urgent' as const, icon: null },
    { title: 'Broken window latch',    category: 'General',  priority: 'low' as const,    icon: null },
    { title: 'Smoke detector beeping', category: 'Safety',   priority: 'medium' as const, icon: null },
    { title: 'Clogged drain',          category: 'Plumbing', priority: 'medium' as const, icon: null },
  ]

  return templates.map((t, i) => {
    const tenant = tenants[i % tenants.length]
    return {
      id: `maint-${i + 1}`,
      title: t.title,
      unit: tenant.unit,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      tenant: tenant.name,
      priority: t.priority,
      status: (i < 5 ? (i < 3 ? 'open' : 'in-progress') : 'resolved') as MaintenanceRequest['status'],
      submitted: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      category: t.category,
    }
  })
}
