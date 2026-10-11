// ─── Supabase environment access (Phase 2) ────────────────────────
//
// Central place to read Supabase config. All vars are NEXT_PUBLIC_* because
// the anon key is designed to be public (RLS is the actual security boundary).
// The service-role key is NEVER referenced here — it's server-only and used
// exclusively by the migration script.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True when Supabase config is present. The app falls back to local/demo
 *  behavior when this is false, so the public beta keeps working. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Selected persistence backend: "local" (localStorage) or "remote" (API). */
export const backend = (process.env.NEXT_PUBLIC_VESTAOS_BACKEND ?? 'local') as
  | 'local'
  | 'remote'
