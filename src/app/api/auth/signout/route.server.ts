// ─── POST /api/auth/signout — clear the Supabase session ─────────────

import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/src/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await getServerSupabase()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
