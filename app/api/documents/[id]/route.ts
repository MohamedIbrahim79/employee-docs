import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendDocumentStatus } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { action, notes } = await req.json()
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await sendDocumentStatus(
      (doc.user as any).email,
      (doc.user as any).full_name,
      (doc.document_type as any).name_ar,
      action === 'approve',
      notes
    )
  } catch {}

  return NextResponse.json(doc)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  await supabaseAdmin.from('documents').update({ file_url: null, file_name: null, status: 'pending' }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}