#!/usr/bin/env node
// ─── VestaOS: migrate local state → Supabase (Phase 2) ────────────
//
// Reads a `vestaos-state` JSON blob (exported from the browser's
// localStorage) and upserts every entity into Supabase, tagged with the
// target owner's uid. Idempotent: upserts by `id`, so re-running is safe.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
//   node scripts/migrate-local-to-remote.mjs <state.json> <owner-uuid>
//
// STAGED 2026-10-09. Requires @supabase/supabase-js installed and a live
// Supabase project with the Phase 2 schema applied (docs/phase2-backend.md).

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const [statePath, ownerId] = process.argv.slice(2)
if (!statePath || !ownerId) {
  console.error('usage: migrate-local-to-remote.mjs <state.json> <owner-uuid>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const raw = JSON.parse(readFileSync(statePath, 'utf8'))

// Map app entity → table name. Keep field names snake_cased to match schema.
const TABLES = {
  properties: 'properties',
  tenants: 'tenants',
  leases: 'leases',
  payments: 'payments',
  maintenanceRequests: 'maintenance_requests',
}

const snake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())

function toRow(entity) {
  const row = {}
  for (const [k, v] of Object.entries(entity)) {
    row[snake(k)] = v
  }
  row.owner_id = ownerId
  return row
}

let failures = 0
const summary = {}

for (const [appKey, table] of Object.entries(TABLES)) {
  const rows = (raw[appKey] ?? []).map(toRow)
  if (rows.length === 0) {
    summary[table] = 0
    continue
  }
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error(`✗ ${table}: ${error.message}`)
    failures++
    summary[table] = `FAILED (${error.message})`
  } else {
    summary[table] = rows.length
    console.log(`✓ ${table}: ${rows.length} rows`)
  }
}

console.log('\nSummary:', summary)
if (failures > 0) {
  console.error(`\n${failures} table(s) failed — do NOT clear localStorage yet.`)
  process.exit(1)
}
console.log('\nRemote row counts SHOULD equal the local entity counts. Verify before clearing.')
