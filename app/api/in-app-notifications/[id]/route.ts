import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  await supabaseAdmin
    .from('in_app_notifications')
    .update({ is_read: true })
    .eq('id', params.id)
    .eq('user_id', session.id)

  return NextResponse.json({ ok: true })
}