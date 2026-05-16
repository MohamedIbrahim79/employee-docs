import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (session.role === 'employee' && session.id !== params.id)
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, phone, position, department, start_date, is_active, created_at')
    .eq('id', params.id)
    .single()

  if (userError || !userData) return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })

  const { data: docs } = await supabaseAdmin
    .from('documents')
    .select(`
      id, file_url, file_name, expiry_date, issue_date, status, notes, uploaded_at, updated_at,
      document_type:document_type_id(id, name_ar, name_de, has_expiry, is_required, description)
    `)
    .eq('user_id', params.id)

  return NextResponse.json({ ...userData, documents: docs || [] })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { full_name, position, department, phone, start_date, is_active } = body
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ full_name, position, department, phone, start_date, is_active })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  await supabaseAdmin.from('users').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}