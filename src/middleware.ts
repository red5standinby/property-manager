// ─── Auth middleware (Phase 2) ────────────────────────────────────
//
// Two jobs:
//   1. Refresh the Supabase session on every request (standard @supabase/ssr
//      pattern) so server components/handlers see a fresh cookie.
//   2. Guard the app: when Supabase is configured AND a request is for an
//      app route with no session, redirect to /login.
//
// When Supabase is NOT configured (local/demo beta), the guard is skipped so
// the public demo keeps working with no keys.

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const BACKEND = process.env.NEXT_PUBLIC_VESTAOS_BACKEND ?? 'local'

// Paths that never require a session.
const PUBLIC_PATHS = ['/login', '/demo', '/auth']

function isPublic(pathname: string) {
  const p = pathname.replace(/^\/property-manager/, '')
  return PUBLIC_PATHS.some((prefix) => p === prefix || p.startsWith(prefix + '/'))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // No Supabase or not on remote backend → local/demo mode, no auth.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || BACKEND !== 'remote') {
    return response
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: getUser() (not getSession()) revalidates the token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublic(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)'],
}
