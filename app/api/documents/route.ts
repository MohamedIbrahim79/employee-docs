import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendDocumentUploaded } from '@/lib/email'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id') || session.id

  if (session.role === 'employee' && userId !== session.id)
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('documents')
    .select(`
      id, file_url, file_name, file_size, expiry_date, issue_date, status, notes, uploaded_at, updated_at,
      document_type:document_type_id(id, name_ar, name_de, has_expiry, is_required)
    `)
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const documentTypeId = formData.get('document_type_id') as string
    const expiryDate = formData.get('expiry_date') as string | null
    const issueDate = formData.get('issue_date') as string | null
    const userId = session.role === 'employee' ? session.id : (formData.get('user_id') as string || session.id)

    if (!documentTypeId) return NextResponse.json({ error: 'Dokumenttyp erforderlich' }, { status: 400 })

    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${documentTypeId}-${Date.now()}.${ext}`
      const buffer = await file.arrayBuffer()

      const { error: uploadError } = await supabaseAdmin.storage
        .from('documents')
        .upload(path, buffer, { contentType: file.type, upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabaseAdmin.storage.from('documents').getPublicUrl(path)
      fileUrl = publicUrl
      fileName = file.name
      fileSize = file.size
    }

    const { data: existing } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .eq('document_type_id', documentTypeId)
      .single()

    let doc
    if (existing) {
      const { data } = await supabaseAdmin
        .from('documents')
        .update({ file_url: fileUrl, file_name: fileName, file_size: fileSize, expiry_date: expiryDate || null, issue_date: issueDate || null, status: 'pending', notes: null, reviewed_by: null, reviewed_at: null, uploaded_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      doc = data
    } else {
      const { data } = await supabaseAdmin
        .from('documents')
        .insert({ user_id: userId, document_type_id: documentTypeId, file_url: fileUrl, file_name: fileName, file_size: fileSize, expiry_date: expiryDate || null, issue_date: issueDate || null, status: 'pending' })
        .select()
        .single()
      doc = data
    }

    // لما الموظف يرفع ملف، ابعت إشعار للـ HR والـ Admin والـ Owner
    if (session.role === 'employee') {
      const { data: docType } = await supabaseAdmin.from('document_types').select('name_de').eq('id', documentTypeId).single()
      const { data: employee } = await supabaseAdmin.from('users').select('full_name').eq('id', userId).single()
      const { data: admins } = await supabaseAdmin.from('users').select('id, email').in('role', ['admin', 'hr', 'owner'])

      for (const admin of admins || []) {
        // إشعار داخلي
        await supabaseAdmin.from('in_app_notifications').insert({
          user_id: admin.id,
          title: 'Neues Dokument hochgeladen',
          message: `${employee?.full_name} hat ${docType?.name_de} hochgeladen`,
          metadata: { employee_id: userId }
        })
        // إيميل
        try { await sendDocumentUploaded(admin.email, employee?.full_name || '', docType?.name_de || '') } catch {}
      }
    }

    return NextResponse.json(doc, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Serverfehler' }, { status: 500 })
  }
}