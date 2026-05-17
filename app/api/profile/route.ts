import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const body = await req.json()
  const { full_name, phone, address, birth_date } = body

  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.email)
    .single()

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      full_name, 
      phone: phone || null, 
      address: address || null, 
      birth_date: birth_date || null 
    })
    .eq('id', userData.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // انتظر ثانية عشان Supabase يحدث البيانات
  await new Promise(resolve => setTimeout(resolve, 500))

  const { data: freshData } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, phone, address, birth_date, is_active')
    .eq('email', session.email)
    .single()

  return NextResponse.json(freshData)
}