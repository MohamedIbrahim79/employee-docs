import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function PUT(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { full_name, phone, address, birth_date } = await req.json()

  console.log('SESSION:', session)
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ full_name, phone, address, birth_date: birth_date || null })
    .eq('id', session.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}// profile route
