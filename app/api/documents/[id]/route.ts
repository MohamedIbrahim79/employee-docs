import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { sendDocumentStatus } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth('admin')
    const { action, notes } = await req.json() // action: 'approve' | 'reject'

    const status = action === 'approve' ? 'active' : 'rejected'
    const { data: doc, error } = await supabaseAdmin
      .from('documents')
      .update({ status, notes, reviewed_by: session.id, reviewed_at: new Date().toISOString() })
      .eq('id', params.id)
      .select(`
        id, status,
        user:user_id(email, full_name),
        document_type:document_type_id(name_ar)
      `)
      .single()

    if (error) throw error

    // Notify employee
    try {
      await sendDocumentStatus(
        doc.user.email, doc.user.full_name, doc.document_type.name_ar,
        action === 'approve', notes
      )
    } catch {}

    return NextResponse.json(doc)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth('admin')
    await supabaseAdmin.from('documents').update({ file_url: null, file_name: null, status: 'pending' }).eq('id', params.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
