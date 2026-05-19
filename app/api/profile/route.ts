import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await req.json()
  const { full_name, phone, address, birth_date, needs_profile_setup } = body

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.email)
    .single()

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const updateData: any = {
    full_name,
    phone: phone || null,
    address: address || null,
    birth_date: birth_date || null,
  }

  if (needs_profile_setup === false) {
    updateData.needs_profile_setup = false
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', userData.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await new Promise(resolve => setTimeout(resolve, 500))

  const { data: freshData } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, phone, address, birth_date, start_date, personal_nr, is_active, needs_profile_setup')
    .eq('email', session.email)
    .single()

  return NextResponse.json(freshData)
}