import { NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, role, phone, address, birth_date, start_date, personal_nr, is_active, needs_profile_setup')
    .eq('email', user.email)
    .single()

  return NextResponse.json(data || user)
}