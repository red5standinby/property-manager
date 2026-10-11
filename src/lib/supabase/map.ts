// ─── AppState ↔ DB row mapping (Phase 2) ──────────────────────────
//
// The app uses camelCase entities; Postgres columns are snake_case. These
// helpers convert both ways and inject owner_id on writes. Kept in one place
// so GET/PUT and the migration script stay in lockstep.

export type Row = Record<string, unknown>

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())

/** DB row → app entity (drops owner_id, camelCases the rest). */
export function rowToEntity<T = Row>(row: Row): T {
  const out: Row = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'owner_id') continue
    out[camel(k)] = v
  }
  return out as T
}

/** App entity → DB row (adds owner_id, snake_cases keys). */
export function entityToRow(entity: Row, ownerId: string): Row {
  const out: Row = { owner_id: ownerId }
  for (const [k, v] of Object.entries(entity)) {
    if (k === 'id') {
      out.id = v
      continue
    }
    out[snake(k)] = v
  }
  return out
}

/** Entity collection → table name + mapper. */
export const ENTITY_TABLES = {
  properties: 'properties',
  tenants: 'tenants',
  leases: 'leases',
  payments: 'payments',
  maintenanceRequests: 'maintenance_requests',
} as const

export type EntityKey = keyof typeof ENTITY_TABLES
