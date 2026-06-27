import type { AppState } from './types'

export const seedData: AppState = {
  properties: [
    {
      id: 'prop-1', name: 'Elm Court Residences',
      address: '420 Elm Court Dr, Austin TX 78701',
      units: 50, occupied: 49, type: 'Multi-family', revenue: '$47,200',
      status: 'active', createdAt: '2024-01-15', updatedAt: '2026-04-01',
    },
    {
      id: 'prop-2', name: 'Maple Ridge Apartments',
      address: '812 Maple Ridge Blvd, Austin TX 78704',
      units: 50, occupied: 46, type: 'Multi-family', revenue: '$38,900',
      status: 'active', createdAt: '2024-02-01', updatedAt: '2026-04-01',
    },
    {
      id: 'prop-3', name: 'Oak View Condos',
      address: '55 Oak View Ln, Austin TX 78705',
      units: 50, occupied: 44, type: 'Condo', revenue: '$31,400',
      status: 'active', createdAt: '2023-11-10', updatedAt: '2026-04-01',
    },
    {
      id: 'prop-4', name: 'Birch Lane Complex',
      address: '1100 Birch Lane, Austin TX 78745',
      units: 50, occupied: 38, type: 'Multi-family', revenue: '$26,800',
      status: 'active', createdAt: '2024-03-20', updatedAt: '2026-04-01',
    },
    {
      id: 'prop-5', name: 'Cedar Blvd Townhomes',
      address: '77 Cedar Blvd, Austin TX 78748',
      units: 50, occupied: 32, type: 'Townhome', revenue: '$22,400',
      status: 'renovation', createdAt: '2024-06-01', updatedAt: '2026-04-01',
    },
    {
      id: 'prop-6', name: 'Pinewood Commons',
      address: '300 Pinewood Cir, Round Rock TX 78664',
      units: 24, occupied: 0, type: 'Multi-family', revenue: '—',
      status: 'pending', createdAt: '2025-09-01', updatedAt: '2026-04-01',
    },
  ],

  tenants: [
    { id: 't-1', name: 'Marcus Webb',      email: 'marcuswebb@email.com',   phone: '(512) 555-0142', propertyId: 'prop-1', unit: 'Elm Court 4B',  leaseStart: '2024-09-01', leaseEnd: '2026-08-31', rent: 2400, status: 'current',  since: 'Mar 2024', leaseLabel: 'Expires Aug 2026' },
    { id: 't-2', name: 'Priya Nair',       email: 'priya.nair@email.com',   phone: '(512) 555-0187', propertyId: 'prop-2', unit: 'Maple Ridge 2A', leaseStart: '2026-04-16', leaseEnd: '2026-12-31', rent: 1850, status: 'current',  since: 'Apr 2026', leaseLabel: 'Expires Dec 2026' },
    { id: 't-3', name: 'James Okonkwo',    email: 'j.okonkwo@email.com',    phone: '(512) 555-0231', propertyId: 'prop-3', unit: 'Oak View 7C',    leaseStart: '2022-05-01', leaseEnd: '2026-05-31', rent: 2100, status: 'expiring', since: 'May 2022', leaseLabel: 'Expires May 2026' },
    { id: 't-4', name: 'Sofia Reyes',      email: 'sofiar@email.com',       phone: '(512) 555-0099', propertyId: 'prop-4', unit: 'Birch Lane 12',  leaseStart: '2023-09-01', leaseEnd: '2026-09-30', rent: 1650, status: 'current',  since: 'Sep 2023', leaseLabel: 'Expires Sep 2026' },
    { id: 't-5', name: 'Devon Harrington', email: 'd.harrington@email.com', phone: '(512) 555-0304', propertyId: 'prop-5', unit: 'Cedar Blvd 3A',  leaseStart: '2025-07-01', leaseEnd: '2026-07-31', rent: 2200, status: 'current',  since: 'Jul 2025', leaseLabel: 'Expires Jul 2026' },
    { id: 't-6', name: 'Aiko Tanaka',      email: 'atanaka@email.com',      phone: '(512) 555-0418', propertyId: 'prop-1', unit: 'Elm Court 11D',  leaseStart: '2023-06-01', leaseEnd: '2026-06-30', rent: 2300, status: 'expiring', since: 'Jun 2023', leaseLabel: 'Expires Jun 2026' },
    { id: 't-7', name: 'Brian Calloway',   email: 'b.calloway@email.com',   phone: '(512) 555-0552', propertyId: 'prop-2', unit: 'Maple Ridge 5B',  leaseStart: '2025-02-01', leaseEnd: '2027-01-31', rent: 1900, status: 'late',     since: 'Feb 2025', leaseLabel: 'Overdue' },
    { id: 't-8', name: 'Nina Vasquez',     email: 'nvasquez@email.com',     phone: '(512) 555-0611', propertyId: 'prop-3', unit: 'Oak View 2F',    leaseStart: '2024-11-01', leaseEnd: '2026-11-30', rent: 2050, status: 'current',  since: 'Nov 2024', leaseLabel: 'Expires Nov 2026' },
  ],

  leases: [],
  payments: [],
  maintenanceRequests: [],
}
