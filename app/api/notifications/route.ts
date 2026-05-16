import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { sendExpiryWarning } from '@/lib/email'
import { differenceInDays } from 'date-fns'

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { user_id } = await req.json().catch(() => ({}))

  let query = supabaseAdmin
    .from('documents')
    .select(`
      id, expiry_date,
      user:user_id(id, email, full_name, is_active),
      document_type:document_type_id(name_ar, name_de)
    `)
    .not('expiry_date', 'is', null)
    .not('file_url', 'is', null)

  if (user_id) query = query.eq('user_id', user_id)

  const { data: documents } = await query
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let sent = 0

  for (const doc of documents || []) {
    if (!(doc.user as any)?.is_active) continue
    const daysLeft = differenceInDays(new Date(doc.expiry_date), today)
    if (daysLeft > 30) continue

    try {
      await sendExpiryWarning(
        (doc.user as any).email,
        (doc.user as any).full_name,
        (doc.document_type as any).name_ar,
        (doc.document_type as any).name_de,
        doc.expiry_date,
        daysLeft
      )
      await supabaseAdmin.from('notifications').insert({
        user_id: (doc.user as any).id,
        document_id: doc.id,
        type: daysLeft < 0 ? 'expiry_overdue' : daysLeft === 0 ? 'expiry_today' : 'expiry_30days',
        email_sent: true,
      })
      sent++
    } catch {}
  }

  return NextResponse.json({ sent, message: `تم إرسال ${sent} إشعار` })
}