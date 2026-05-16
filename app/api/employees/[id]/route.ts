import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    // Employee can only see themselves
    if (session.role === 'employee' && session.id !== params.id)
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })

    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, full_name, role, phone, position, department, start_date, is_active, created_at,
        documents(
          id, file_url, file_name, expiry_date, issue_date, status, notes, uploaded_at, updated_at,
          document_type:document_type_id(id, name_ar, name_de, has_expiry, is_required, description)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth('admin')
    const body = await req.json()
    const { full_name, position, department, phone, start_date, is_active } = body

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name, position, department, phone, start_date, is_active })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth('admin')
    await supabaseAdmin.from('users').delete().eq('id', params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
