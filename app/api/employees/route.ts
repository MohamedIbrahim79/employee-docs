import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, phone, position, department, start_date, is_active, created_at')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const body = await req.json()
    const { email, full_name, position, department, phone, start_date } = body
    if (!email || !full_name) return NextResponse.json({ error: 'الاسم والبريد مطلوبان' }, { status: 400 })

    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()
    const hash = await hashPassword(tempPassword)

    const { data: user2, error } = await supabaseAdmin
      .from('users')
      .insert({ email: email.toLowerCase(), full_name, password_hash: hash, role: 'employee', phone, position, department, start_date: start_date || null })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: docTypes } = await supabaseAdmin.from('document_types').select('id')
    if (docTypes?.length) {
      await supabaseAdmin.from('documents').insert(
        docTypes.map(dt => ({ user_id: user2.id, document_type_id: dt.id, status: 'pending' }))
      )
    }

    try { await sendWelcomeEmail(email, full_name, tempPassword) } catch {}

    return NextResponse.json({ ...user2, temp_password: tempPassword }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}