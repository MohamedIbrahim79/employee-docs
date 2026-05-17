import { NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return NextResponse.json(user)

  return NextResponse.json({
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    phone: data.phone,
    address: data.address,
    birth_date: data.birth_date,
    is_active: data.is_active,
  })
}