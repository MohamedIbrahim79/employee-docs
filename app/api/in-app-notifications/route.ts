import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('in_app_notifications')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}

export async function PATCH(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await supabaseAdmin
    .from('in_app_notifications')
    .update({ is_read: true })
    .eq('user_id', session.id)

  return NextResponse.json({ ok: true })
}