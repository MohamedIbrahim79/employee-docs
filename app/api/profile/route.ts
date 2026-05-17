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

  // أولاً جيب الـ user من قاعدة البيانات عشان نتأكد من الـ id
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.email)
    .single()

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ 
      full_name, 
      phone: phone || null, 
      address: address || null, 
      birth_date: birth_date || null 
    })
    .eq('id', userData.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}