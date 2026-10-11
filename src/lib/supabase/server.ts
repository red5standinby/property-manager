// ─── Supabase server client ───────────────────────────────────────
//
// Used by route handlers and middleware to read the current session from
// cookies. Each request gets its own client (no module-level caching) because
// the cookie jar is per-request.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'

/** Build a Supabase client bound to the current request's cookies. */
export async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component render — cookies are read-only
          // there. Middleware refreshes the session instead, so this is safe.
        }
      },
    },
  })
}

/** Resolve the current user, or null when unauthenticated / unconfigured. */
export async function getCurrentUser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
