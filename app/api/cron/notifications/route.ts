import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendExpiryWarning } from '@/lib/email'
import { differenceInDays } from 'date-fns'

// This runs automatically every day at 7am via Vercel Cron
export async function GET(req: Request) {
  // Security: verify it's from Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select(`
      id, expiry_date,
      user:user_id(id, email, full_name, is_active),
      document_type:document_type_id(name_ar, name_de)
    `)
    .not('expiry_date', 'is', null)
    .not('file_url', 'is', null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  let sent = 0

  for (const doc of documents || []) {
    if (!doc.user?.is_active) continue
    const daysLeft = differenceInDays(new Date(doc.expiry_date), today)
    const shouldNotify = [30, 14, 7, 3, 1, 0].includes(daysLeft) || (daysLeft < 0 && daysLeft % 7 === 0)
    if (!shouldNotify) continue

    // Check we haven't sent today already
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('document_id', doc.id)
      .gte('sent_at', today.toISOString())
      .limit(1)
    if (existing?.length) continue

    try {
      await sendExpiryWarning(doc.user.email, doc.user.full_name, doc.document_type.name_ar, doc.document_type.name_de, doc.expiry_date, daysLeft)
      await supabaseAdmin.from('notifications').insert({
        user_id: doc.user.id, document_id: doc.id,
        type: daysLeft < 0 ? 'expiry_overdue' : daysLeft === 0 ? 'expiry_today' : 'expiry_30days',
        email_sent: true,
      })
      sent++
    } catch (e) {
      console.error('Email failed:', e)
    }
  }

  return NextResponse.json({ ok: true, sent, timestamp: new Date().toISOString() })
}
