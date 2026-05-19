import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || !['admin', 'hr', 'owner'].includes(session.role))
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const personalNr = searchParams.get('personal_nr')

  if (!personalNr)
    return NextResponse.json({ error: 'Personal-Nr. fehlt' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, personal_nr')
    .eq('personal_nr', personalNr)
    .single()

  if (error || !data)
    return NextResponse.json(null, { status: 404 })

  return NextResponse.json(data)
}