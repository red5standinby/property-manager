// ─── Supabase browser client ──────────────────────────────────────
//
// Used by client components (login page, settings/2FA, sign-out). Creates a
// single browser client using @supabase/ssr so the session is stored in
// cookies (readable by our route handlers + middleware), not localStorage.

'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from './env'

let client: ReturnType<typeof createBrowserClient> | null = null

/** Returns the shared browser Supabase client, or null when Supabase is not
 *  configured (keeps the local/demo beta path working without keys). */
export function getBrowserSupabase() {
  if (!supabaseConfigured) return null
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return client
}
