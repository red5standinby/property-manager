// ─── /api/state — full-snapshot load (GET) + save (PUT) ──────────────
//
// The app persists one whole AppState snapshot (the same shape the
// localStorage adapter produces), so the store + remote adapter are oblivious
// to the backend. RLS scopes every row to its owner; we also filter by
// owner_id defensively.
//
//   GET  → current snapshot for the signed-in owner
//   PUT  → upsert the snapshot + prune rows no longer present
//
// Whole-state PUT is fine for a 1–10 home portfolio; the adapter boundary
// lets us move to per-entity endpoints later without touching UI code.

import { NextResponse, type NextRequest } from 'next/server'
import { getServerSupabase, getCurrentUser } from '@/src/lib/supabase/server'
import {
  rowToEntity,
  entityToRow,
  ENTITY_TABLES,
  type EntityKey,
  type Row,
} from '@/src/lib/supabase/map'
import type {
  AppState,
  Property,
  Tenant,
  Lease,
  Payment,
  MaintenanceRequest,
} from '@/src/lib/types'

export const dynamic = 'force-dynamic'

const KEYS = Object.keys(ENTITY_TABLES) as EntityKey[]

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = await getServerSupabase()

  const [properties, tenants, leases, payments, maintenance] = await Promise.all([
    supabase.from('properties').select('*').eq('owner_id', user.id),
    supabase.from('tenants').select('*').eq('owner_id', user.id),
    supabase.from('leases').select('*').eq('owner_id', user.id),
    supabase.from('payments').select('*').eq('owner_id', user.id),
    supabase.from('maintenance_requests').select('*').eq('owner_id', user.id),
  ])

  const err =
    properties.error || tenants.error || leases.error ||
    payments.error || maintenance.error
  if (err) return NextResponse.json({ error: err.message }, { status: 500 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    properties: (properties.data ?? []).map((r) => rowToEntity<Property>(r as Row)),
    tenants: (tenants.data ?? []).map((r) => rowToEntity<Tenant>(r as Row)),
    leases: (leases.data ?? []).map((r) => rowToEntity<Lease>(r as Row)),
    payments: (payments.data ?? []).map((r) => rowToEntity<Payment>(r as Row)),
    maintenanceRequests: (maintenance.data ?? []).map((r) =>
      rowToEntity<MaintenanceRequest>(r as Row),
    ),
    role: (profile?.role as 'admin' | 'user') ?? 'user',
  })
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let state: AppState
  try {
    state = (await request.json()) as AppState
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const supabase = await getServerSupabase()

  for (const key of KEYS) {
    const table = ENTITY_TABLES[key]
    const entities = (state[key] ?? []) as unknown as Row[]
    const rows = entities.map((e) => entityToRow(e, user.id))

    if (rows.length > 0) {
      const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
      if (error) {
        return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 500 })
      }
    }

    // Delete rows for this owner that are no longer present in the snapshot.
    const ids = entities.map((e) => String(e.id))
    const del = supabase.from(table).delete().eq('owner_id', user.id)
    const { error: delErr } = ids.length > 0
      ? await del.not('id', 'in', `(${ids.map((i) => `"${i}"`).join(',')})`)
      : await del
    if (delErr) {
      return NextResponse.json({ error: `${table} prune: ${delErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
