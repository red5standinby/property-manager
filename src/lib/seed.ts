import type { AppState, Property, Tenant, Lease, Payment, MaintenanceRequest } from './types'

// ─── Demo dataset ─────────────────────────────────────────────────
//
// Realistic sample data for demos + local testing. NOT loaded by default
// (the app starts empty — see store/context.tsx). Load it by writing
// DEMO_STATE to the storage adapter under the app's storage key, or via the
// app's demo/seed entry point.
//
// Portfolio: 3 properties, 5 tenants. Deliberately includes edge
// cases the Ops view exists to surface: an overdue rent, a partial payment,
// a waived late fee, a lease expiring within 30 days, and open maintenance.
//
// Properties are single rentable homes; occupancy is derived from active
// leases, not stored.

const today = new Date()
const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysFromNow = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return iso(d)
}
const monthStart = (offsetMonths = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth() + offsetMonths, 1)
  return iso(d)
}
const monthEnd = (offsetMonths = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth() + offsetMonths + 1, 0)
  return iso(d)
}

const properties: Property[] = [
  {
    id: 'prop-maple',
    name: 'Maple Street Duplex',
    address: '142 Maple St, Hartford, CT 06106',
    type: 'Duplex',
    status: 'active',
    createdAt: '2024-03-01',
    updatedAt: iso(today),
  },
  {
    id: 'prop-oak',
    name: 'Oak Avenue House',
    address: '88 Oak Ave, New Britain, CT 06051',
    type: 'Single-family',
    status: 'active',
    createdAt: '2024-08-15',
    updatedAt: iso(today),
  },
  {
    id: 'prop-cedar',
    name: 'Cedar Lane Cottage',
    address: '7 Cedar Ln, Middletown, CT 06457',
    type: 'Single-family',
    status: 'active',
    createdAt: '2025-01-10',
    updatedAt: iso(today),
  },
]

const tenants: Tenant[] = [
  {
    id: 't-dana',
    name: 'Dana Whitfield',
    email: 'dana.whitfield@example.com',
    phone: '(860) 555-0142',
    propertyId: 'prop-maple',
    unit: '1A',
    leaseStart: '2024-04-01',
    leaseEnd: '2026-03-31',
    rent: 1700,
    status: 'current',
    since: 'Apr 2024',
    leaseLabel: 'Expires Mar 2026',
  },
  {
    id: 't-marcus',
    name: 'Marcus Reyes',
    email: 'marcus.reyes@example.com',
    phone: '(860) 555-0188',
    propertyId: 'prop-maple',
    unit: '1B',
    leaseStart: '2025-06-01',
    leaseEnd: '2026-05-31',
    rent: 1700,
    status: 'current',
    since: 'Jun 2025',
    leaseLabel: 'Expires May 2026',
  },
  {
    id: 't-priya',
    name: 'Priya & Anand Kapoor',
    email: 'kapoor.family@example.com',
    phone: '(203) 555-0119',
    propertyId: 'prop-oak',
    unit: '2A',
    leaseStart: '2024-09-01',
    leaseEnd: '2026-08-31',
    rent: 1450,
    status: 'current',
    since: 'Sep 2024',
    leaseLabel: 'Expires Aug 2026',
  },
  {
    id: 't-jordan',
    name: 'Jordan Blake',
    email: 'jordan.blake@example.com',
    phone: '(860) 555-0173',
    propertyId: 'prop-oak',
    unit: '2B',
    leaseStart: '2025-02-01',
    // Expiring soon — within 30 days — so Ops surfaces it.
    leaseEnd: daysFromNow(21),
    rent: 1425,
    status: 'expiring',
    since: 'Feb 2025',
    leaseLabel: `Expires ${new Date(daysFromNow(21)).toLocaleString('default', { month: 'short', year: 'numeric' })}`,
  },
  {
    id: 't-rosa',
    name: 'Rosa Delgado',
    email: 'rosa.delgado@example.com',
    phone: '(860) 555-0166',
    propertyId: 'prop-cedar',
    unit: 'Main',
    leaseStart: '2025-02-15',
    leaseEnd: '2027-02-14',
    rent: 1850,
    status: 'late',
    since: 'Feb 2025',
    leaseLabel: 'Expires Feb 2027',
  },
]

const leases: Lease[] = [
  {
    id: 'lease-dana',
    propertyId: 'prop-maple',
    unit: '1A',
    tenantIds: ['t-dana'],
    startDate: '2024-04-01',
    endDate: '2026-03-31',
    rent: 1700,
    term: '24-month',
    status: 'active',
    createdAt: '2024-04-01',
    updatedAt: '2024-04-01',
  },
  {
    id: 'lease-marcus',
    propertyId: 'prop-maple',
    unit: '1B',
    tenantIds: ['t-marcus'],
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    rent: 1700,
    term: '12-month',
    status: 'active',
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    // Co-tenants share one lease.
    id: 'lease-kapoor',
    propertyId: 'prop-oak',
    unit: '2A',
    tenantIds: ['t-priya'],
    startDate: '2024-09-01',
    endDate: '2026-08-31',
    rent: 1450,
    term: '24-month',
    status: 'active',
    createdAt: '2024-09-01',
    updatedAt: '2024-09-01',
  },
  {
    id: 'lease-jordan',
    propertyId: 'prop-oak',
    unit: '2B',
    tenantIds: ['t-jordan'],
    startDate: '2025-02-01',
    endDate: daysFromNow(21),
    rent: 1425,
    term: '12-month',
    status: 'expiring',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-01',
  },
  {
    id: 'lease-rosa',
    propertyId: 'prop-cedar',
    unit: 'Main',
    tenantIds: ['t-rosa'],
    startDate: '2025-02-15',
    endDate: '2027-02-14',
    rent: 1850,
    term: '24-month',
    status: 'active',
    createdAt: '2025-02-15',
    updatedAt: '2025-02-15',
  },
]

const payments: Payment[] = [
  // Paid in full
  {
    id: 'pay-dana-cur', leaseId: 'lease-dana', tenantId: 't-dana', propertyId: 'prop-maple',
    periodStart: monthStart(), periodEnd: monthEnd(), amount: 1700, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'ach', status: 'paid', paidAt: monthStart(0), note: '',
    createdAt: monthStart(), updatedAt: monthStart(),
  },
  {
    id: 'pay-marcus-cur', leaseId: 'lease-marcus', tenantId: 't-marcus', propertyId: 'prop-maple',
    periodStart: monthStart(), periodEnd: monthEnd(), amount: 1700, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'ach', status: 'paid', paidAt: monthStart(0), note: '',
    createdAt: monthStart(), updatedAt: monthStart(),
  },
  {
    id: 'pay-kapoor-cur', leaseId: 'lease-kapoor', tenantId: 't-priya', propertyId: 'prop-oak',
    periodStart: monthStart(), periodEnd: monthEnd(), amount: 1450, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'check', status: 'paid', paidAt: monthStart(0), note: '',
    createdAt: monthStart(), updatedAt: monthStart(),
  },
  // PARTIAL payment — tenant paid part of the month's rent.
  {
    id: 'pay-jordan-cur', leaseId: 'lease-jordan', tenantId: 't-jordan', propertyId: 'prop-oak',
    periodStart: monthStart(), periodEnd: monthEnd(), amount: 800, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'cash', status: 'partial', paidAt: monthStart(0),
    note: 'Paid $800 of $1,425 — balance promised next week.',
    createdAt: monthStart(), updatedAt: monthStart(),
  },
  // OVERDUE, with a late fee that was WAIVED (goodwill).
  {
    id: 'pay-rosa-cur', leaseId: 'lease-rosa', tenantId: 't-rosa', propertyId: 'prop-cedar',
    periodStart: monthStart(), periodEnd: monthEnd(), amount: 1850, lateFee: 75, lateFeeWaived: true,
    type: 'rent', method: 'ach', status: 'overdue', paidAt: '',
    note: 'Late fee waived once (first offense, long-term tenant).',
    createdAt: monthStart(), updatedAt: monthStart(),
  },
  // Deposit — must NOT count as income.
  {
    id: 'pay-jordan-dep', leaseId: 'lease-jordan', tenantId: 't-jordan', propertyId: 'prop-oak',
    periodStart: monthStart(-12), periodEnd: monthEnd(-12), amount: 1425, lateFee: 0, lateFeeWaived: false,
    type: 'deposit', method: 'check', status: 'paid', paidAt: monthStart(-12), note: 'Security deposit',
    createdAt: monthStart(-12), updatedAt: monthStart(-12),
  },
  // Prior month, paid — gives the dashboard history.
  {
    id: 'pay-dana-prev', leaseId: 'lease-dana', tenantId: 't-dana', propertyId: 'prop-maple',
    periodStart: monthStart(-1), periodEnd: monthEnd(-1), amount: 1700, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'ach', status: 'paid', paidAt: monthStart(-1), note: '',
    createdAt: monthStart(-1), updatedAt: monthStart(-1),
  },
  {
    id: 'pay-marcus-prev', leaseId: 'lease-marcus', tenantId: 't-marcus', propertyId: 'prop-maple',
    periodStart: monthStart(-1), periodEnd: monthEnd(-1), amount: 1700, lateFee: 0, lateFeeWaived: false,
    type: 'rent', method: 'ach', status: 'paid', paidAt: monthStart(-1), note: '',
    createdAt: monthStart(-1), updatedAt: monthStart(-1),
  },
]

const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    title: 'Water heater leaking in basement',
    description: 'Small pool forming under the unit. Tenant placed a bucket.',
    unit: '2B', tenantId: 't-jordan', propertyId: 'prop-oak',
    priority: 'urgent', status: 'in-progress', category: 'Plumbing',
    submitted: daysFromNow(-3),
    statusHistory: [
      { status: 'open', at: daysFromNow(-3), note: 'Reported by tenant via text.' },
      { status: 'in-progress', at: daysFromNow(-2), note: 'Vendor (Hartford Plumbing) scheduled for tomorrow AM.' },
    ],
    cost: 0, resolvedAt: '', createdAt: daysFromNow(-3), updatedAt: daysFromNow(-2),
  },
  {
    id: 'maint-2',
    title: 'HVAC blowing warm air',
    description: 'Upstairs unit not cooling.',
    unit: '1A', tenantId: 't-dana', propertyId: 'prop-maple',
    priority: 'high', status: 'open', category: 'HVAC',
    submitted: daysFromNow(-1),
    statusHistory: [
      { status: 'open', at: daysFromNow(-1), note: 'Reported by tenant. Awaiting vendor quote.' },
    ],
    cost: 0, resolvedAt: '', createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1),
  },
  {
    id: 'maint-3',
    title: 'Kitchen faucet dripping',
    description: 'Slow drip from the base of the faucet.',
    unit: 'Main', tenantId: 't-rosa', propertyId: 'prop-cedar',
    priority: 'low', status: 'resolved', category: 'Plumbing',
    submitted: daysFromNow(-14),
    statusHistory: [
      { status: 'open', at: daysFromNow(-14), note: 'Reported.' },
      { status: 'in-progress', at: daysFromNow(-10), note: 'Handyman assigned.' },
      { status: 'resolved', at: daysFromNow(-8), note: 'Replaced cartridge. Works fine.' },
    ],
    cost: 120, resolvedAt: daysFromNow(-8), createdAt: daysFromNow(-14), updatedAt: daysFromNow(-8),
  },
  {
    id: 'maint-4',
    title: 'Front door lock sticking',
    description: 'Key turns hard; tenant worried it will fail.',
    unit: '2A', tenantId: 't-priya', propertyId: 'prop-oak',
    priority: 'medium', status: 'open', category: 'General',
    submitted: daysFromNow(-2),
    statusHistory: [
      { status: 'open', at: daysFromNow(-2), note: 'Reported. Considering full lock replacement.' },
    ],
    cost: 0, resolvedAt: '', createdAt: daysFromNow(-2), updatedAt: daysFromNow(-2),
  },
]

export const demoData: AppState = {
  properties,
  tenants,
  leases,
  payments,
  maintenanceRequests,
  role: 'admin',
}

// Keep the empty seed as the default startup state.
export const seedData: AppState = {
  properties: [],
  tenants: [],
  leases: [],
  payments: [],
  maintenanceRequests: [],
  role: 'admin',
}
